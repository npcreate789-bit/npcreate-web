"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Campaign } from "@/types/database"

async function getSellerCtx() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const { data: store } = await supabase.from("stores").select("id").eq("seller_id", user.id).maybeSingle()
  if (!store) throw new Error("ไม่พบร้านค้า")
  return { supabase, user, storeId: store.id as string }
}

export async function getStoreCampaigns(): Promise<Campaign[]> {
  const { supabase, storeId } = await getSellerCtx()
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
  return (data ?? []) as Campaign[]
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const { supabase, storeId } = await getSellerCtx()
  const { data } = await supabase
    .from("campaigns").select("*")
    .eq("id", id).eq("store_id", storeId).maybeSingle()
  return data as Campaign | null
}

export type CampaignInput = {
  title: string
  description: string
  special_commission_rate: number | null
  starts_at: string
  ends_at: string
  product_ids: string[]
  script: string
  banner_url: string
  is_active: boolean
}

function parseInput(data: CampaignInput, storeId: string) {
  if (!data.starts_at || !data.ends_at) throw new Error("กรุณาระบุวันเริ่มต้นและสิ้นสุด")
  if (new Date(data.ends_at) <= new Date(data.starts_at)) throw new Error("วันสิ้นสุดต้องมาหลังวันเริ่มต้น")
  if (!data.title.trim()) throw new Error("กรุณาระบุชื่อแคมเปญ")
  return {
    store_id: storeId,
    title: data.title.trim(),
    description: data.description.trim() || null,
    special_commission_rate: data.special_commission_rate ?? null,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    product_ids: data.product_ids,
    script: data.script.trim() || null,
    banner_url: (() => {
      const u = data.banner_url.trim()
      if (u && !/^https?:\/\//i.test(u)) throw new Error("banner_url ต้องเป็น https://")
      return u || null
    })(),
    is_active: data.is_active,
  }
}

async function verifyProductIds(supabase: Awaited<ReturnType<typeof createClient>>, storeId: string, productIds: string[]) {
  if (productIds.length === 0) return []
  const safeIds = productIds.slice(0, 100)  // cap at 100 to prevent oversized IN queries
  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("store_id", storeId)
    .in("id", safeIds)
  const ownedIds = new Set((data ?? []).map(p => p.id as string))
  return productIds.filter(id => ownedIds.has(id))
}

export async function createCampaign(data: CampaignInput) {
  const { supabase, storeId } = await getSellerCtx()
  const safeProductIds = await verifyProductIds(supabase, storeId, data.product_ids)
  const { error } = await supabase.from("campaigns").insert(parseInput({ ...data, product_ids: safeProductIds }, storeId))
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/campaigns")
  revalidatePath("/member/marketplace")
}

export async function updateCampaign(id: string, data: CampaignInput) {
  const { supabase, storeId } = await getSellerCtx()
  const safeProductIds = await verifyProductIds(supabase, storeId, data.product_ids)
  const { error } = await supabase.from("campaigns").update({
    ...parseInput({ ...data, product_ids: safeProductIds }, storeId),
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/campaigns")
  revalidatePath("/member/marketplace")
}

export async function toggleCampaignActive(id: string, isActive: boolean) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("campaigns")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/campaigns")
  revalidatePath("/member/marketplace")
}

export async function deleteCampaign(id: string) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("campaigns").delete().eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/campaigns")
  revalidatePath("/member/marketplace")
}
