"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Store, Product, Campaign, AffiliatePull } from "@/types/database"

export type StoreWithCount = Store & { product_count: number }
export type ProductWithStore = Product & { store: Pick<Store, "id" | "name" | "logo_url" | "is_verified"> }
export type CampaignWithStore = Campaign & { store: Pick<Store, "id" | "name" | "logo_url"> }
export type PullWithProduct = AffiliatePull & {
  product: ProductWithStore
}

export async function getMarketplaceData() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [storesRes, productsRes, campaignsRes] = await Promise.all([
    supabase
      .from("stores")
      .select("*, products(count)")
      .eq("is_active", true)
      .order("is_verified", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*, store:stores(id, name, logo_url, is_verified)")
      .eq("is_active", true)
      .order("commission_rate", { ascending: false })
      .order("monthly_sales_est", { ascending: false })
      .limit(12),
    supabase
      .from("campaigns")
      .select("*, store:stores(id, name, logo_url)")
      .eq("is_active", true)
      .lte("starts_at", now)
      .gte("ends_at", now)
      .order("ends_at", { ascending: true })
      .limit(6),
  ])

  const stores = (storesRes.data ?? []).map(s => ({
    ...s,
    product_count: (s.products as unknown as { count: number }[])?.[0]?.count ?? 0,
  })) as StoreWithCount[]

  return {
    stores,
    featuredProducts: (productsRes.data ?? []) as ProductWithStore[],
    activeCampaigns: (campaignsRes.data ?? []) as CampaignWithStore[],
  }
}

export async function getStoreDetail(storeId: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [storeRes, productsRes, campaignsRes] = await Promise.all([
    supabase.from("stores").select("*").eq("id", storeId).eq("is_active", true).maybeSingle(),
    supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("commission_rate", { ascending: false }),
    supabase
      .from("campaigns")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .lte("starts_at", now)
      .gte("ends_at", now),
  ])

  if (!storeRes.data) return null

  return {
    store: storeRes.data as Store,
    products: (productsRes.data ?? []) as Product[],
    activeCampaigns: (campaignsRes.data ?? []) as Campaign[],
  }
}

export async function pullProduct(productId: string): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle()
  if (!profile?.is_active)        throw new Error("บัญชีถูกระงับการใช้งาน")
  if (profile?.role !== "affiliate") throw new Error("เฉพาะสมาชิก Affiliate เท่านั้น")

  // Upsert: if already pulled return existing pull_code
  const existing = await supabase
    .from("affiliate_pulls")
    .select("pull_code")
    .eq("affiliate_id", user.id)
    .eq("product_id", productId)
    .maybeSingle()

  if (existing.data?.pull_code) return existing.data.pull_code

  const { data, error } = await supabase
    .from("affiliate_pulls")
    .insert({ affiliate_id: user.id, product_id: productId })
    .select("pull_code")
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/member/my-products")
  return data.pull_code as string
}

export async function getMyPulledProducts(): Promise<PullWithProduct[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("affiliate_pulls")
    .select("*, product:products(*, store:stores(id, name, logo_url, is_verified))")
    .eq("affiliate_id", user.id)
    .order("created_at", { ascending: false })

  return (data ?? []) as PullWithProduct[]
}
