"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { SampleStatus, Product, Profile } from "@/types/database"

export type PullRow = {
  id: string
  sample_status: SampleStatus
  seller_note: string | null
  created_at: string
  product_id: string
  product: Pick<Product, "id" | "name" | "image_url" | "commission_rate"> | null
  affiliate: Pick<Profile, "id" | "full_name" | "tiktok_channel_url" | "avatar_url"> | null
}

async function getStoreId(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; storeId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", user.id)
    .maybeSingle()

  if (!store) throw new Error("ไม่พบร้านค้า")
  return { supabase, storeId: store.id }
}

export async function getStorePulls(opts?: { status?: string; productId?: string }): Promise<PullRow[]> {
  const { supabase, storeId } = await getStoreId()

  const { data: products } = await supabase
    .from("products")
    .select("id")
    .eq("store_id", storeId)

  const productIds = products?.map(p => p.id) ?? []
  if (productIds.length === 0) return []

  let query = supabase
    .from("affiliate_pulls")
    .select(`
      id, sample_status, seller_note, created_at, product_id,
      product:products(id, name, image_url, commission_rate),
      affiliate:profiles!affiliate_id(id, full_name, tiktok_channel_url, avatar_url)
    `)
    .in("product_id", productIds)
    .order("created_at", { ascending: false })

  if (opts?.status && opts.status !== "all") {
    query = query.eq("sample_status", opts.status as SampleStatus)
  }
  if (opts?.productId) {
    query = query.eq("product_id", opts.productId)
  }

  const { data } = await query
  return (data ?? []) as unknown as PullRow[]
}

export async function updateSampleStatus(pullId: string, newStatus: SampleStatus) {
  const parsed = z.enum(["pending", "approved", "sent", "rejected"]).safeParse(newStatus)
  if (!parsed.success) throw new Error("สถานะไม่ถูกต้อง")

  const { supabase, storeId } = await getStoreId()

  // Verify the pull belongs to this seller's store
  const { data: pull } = await supabase
    .from("affiliate_pulls")
    .select("id, product_id")
    .eq("id", pullId)
    .maybeSingle()

  if (!pull) throw new Error("ไม่พบรายการ")

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", pull.product_id)
    .eq("store_id", storeId)
    .maybeSingle()

  if (!product) throw new Error("ไม่มีสิทธิ์")

  const { error } = await supabase
    .from("affiliate_pulls")
    .update({ sample_status: parsed.data })
    .eq("id", pullId)

  if (error) throw new Error(error.message)
  revalidatePath("/member/store/pulls")
  revalidatePath("/member/my-products")
}

export async function updateSellerNote(pullId: string, note: string) {
  const { supabase, storeId } = await getStoreId()

  const { data: pull } = await supabase
    .from("affiliate_pulls")
    .select("id, product_id")
    .eq("id", pullId)
    .maybeSingle()

  if (!pull) throw new Error("ไม่พบรายการ")

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", pull.product_id)
    .eq("store_id", storeId)
    .maybeSingle()

  if (!product) throw new Error("ไม่มีสิทธิ์")

  const { error } = await supabase
    .from("affiliate_pulls")
    .update({ seller_note: note.trim() || null })
    .eq("id", pullId)

  if (error) throw new Error(error.message)
  revalidatePath("/member/store/pulls")
}
