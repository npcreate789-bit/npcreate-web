"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Store } from "@/types/database"

async function getSellerUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "seller" && profile?.role !== "admin") throw new Error("เฉพาะ Seller เท่านั้น")
  return { supabase, user }
}

export async function getMyStore(): Promise<Store | null> {
  const { supabase, user } = await getSellerUser()
  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("seller_id", user.id)
    .maybeSingle()
  return data as Store | null
}

export async function createStore(data: {
  name: string
  description: string
  category: string
  tiktok_shop_url: string
  logo_url: string
}) {
  const { supabase, user } = await getSellerUser()
  const { error } = await supabase.from("stores").insert({
    seller_id: user.id,
    name: data.name.trim(),
    description: data.description.trim() || null,
    category: data.category,
    tiktok_shop_url: data.tiktok_shop_url.trim() || null,
    logo_url: data.logo_url.trim() || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/member/store")
}

export async function updateStore(id: string, data: {
  name: string
  description: string
  category: string
  tiktok_shop_url: string
  logo_url: string
}) {
  const { supabase, user } = await getSellerUser()
  const { error } = await supabase.from("stores").update({
    name: data.name.trim(),
    description: data.description.trim() || null,
    category: data.category,
    tiktok_shop_url: data.tiktok_shop_url.trim() || null,
    logo_url: data.logo_url.trim() || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("seller_id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store")
  revalidatePath("/member/marketplace")
}

export async function getStoreDashboardStats(storeId: string) {
  const { supabase } = await getSellerUser()

  const [productsRes, campaignsRes] = await Promise.all([
    supabase.from("products").select("id, is_active").eq("store_id", storeId),
    supabase.from("campaigns").select("id, is_active").eq("store_id", storeId),
  ])

  const productIds = (productsRes.data ?? []).map(p => p.id)
  const activeProducts = (productsRes.data ?? []).filter(p => p.is_active).length
  const activeCampaigns = (campaignsRes.data ?? []).filter(c => c.is_active).length

  let totalPulls = 0
  let pendingPulls = 0
  if (productIds.length > 0) {
    const { data: pulls } = await supabase
      .from("affiliate_pulls")
      .select("id, sample_status")
      .in("product_id", productIds)
    totalPulls = pulls?.length ?? 0
    pendingPulls = (pulls ?? []).filter(p => p.sample_status === "pending").length
  }

  return {
    totalProducts: productsRes.data?.length ?? 0,
    activeProducts,
    activeCampaigns,
    totalPulls,
    pendingPulls,
  }
}
