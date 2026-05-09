"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { Product, Store, Campaign } from "@/types/database"

export type ProductWithMeta = Product & {
  store: Pick<Store, "id" | "name" | "logo_url" | "is_verified">
  pull_count: number
}

export type CampaignWithStore = Campaign & {
  store: Pick<Store, "id" | "name">
}

export async function getProductAdsProducts(opts?: {
  q?: string
  sort?: "commission" | "newest" | "popular"
  storeId?: string
}): Promise<ProductWithMeta[]> {
  const supabase = await createClient()

  let query = supabase
    .from("products")
    .select("*, store:stores(id, name, logo_url, is_verified), affiliate_pulls(count)")
    .eq("is_active", true)

  if (opts?.q) {
    // PostgREST .or() uses comma/paren as delimiters — strip them from user input
    const safe = opts.q.replace(/[,()\\"]/g, " ").trim()
    if (safe) {
      query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`)
    }
  }
  if (opts?.storeId) {
    query = query.eq("store_id", opts.storeId)
  }

  if (opts?.sort === "newest") {
    query = query.order("created_at", { ascending: false })
  } else if (opts?.sort === "popular") {
    query = query.order("monthly_sales_est", { ascending: false })
  } else {
    // default: highest commission
    query = query.order("commission_rate", { ascending: false }).order("monthly_sales_est", { ascending: false })
  }

  query = query.limit(48)

  const { data } = await query
  return (data ?? []).map(p => ({
    ...p,
    store: p.store as Pick<Store, "id" | "name" | "logo_url" | "is_verified">,
    pull_count: (p.affiliate_pulls as unknown as { count: number }[])?.[0]?.count ?? 0,
  })) as ProductWithMeta[]
}

export async function getActiveCampaigns(): Promise<CampaignWithStore[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from("campaigns")
    .select("*, store:stores(id, name)")
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("ends_at", { ascending: true })
    .limit(20)
  return (data ?? []) as CampaignWithStore[]
}

export async function getProductDetail(productId: string): Promise<{
  product: ProductWithMeta
  isPulled: boolean
  isAffiliate: boolean
  hasTiktok: boolean
  isLoggedIn: boolean
} | null> {
  const supabase = await createClient()

  const { data: productData } = await supabase
    .from("products")
    .select("*, store:stores(id, name, logo_url, is_verified), affiliate_pulls(count)")
    .eq("id", productId)
    .eq("is_active", true)
    .maybeSingle()

  if (!productData) return null

  const product: ProductWithMeta = {
    ...productData,
    store: productData.store as Pick<Store, "id" | "name" | "logo_url" | "is_verified">,
    pull_count: (productData.affiliate_pulls as unknown as { count: number }[])?.[0]?.count ?? 0,
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { product, isPulled: false, isAffiliate: false, hasTiktok: false, isLoggedIn: false }

  const [profileRes, pullRes] = await Promise.all([
    supabase.from("profiles").select("role, tiktok_channel_url").eq("id", user.id).maybeSingle(),
    supabase.from("affiliate_pulls").select("id").eq("product_id", productId).eq("affiliate_id", user.id).maybeSingle(),
  ])

  const isAffiliate = profileRes.data?.role === "affiliate"
  const hasTiktok = !!profileRes.data?.tiktok_channel_url
  const isPulled = !!pullRes.data

  return { product, isPulled, isAffiliate, hasTiktok, isLoggedIn: true }
}

export async function getMyPullSet(): Promise<Set<string>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Set()
  const { data } = await supabase
    .from("affiliate_pulls")
    .select("product_id")
    .eq("affiliate_id", user.id)
  return new Set((data ?? []).map(p => p.product_id as string))
}

// ─── Pull Product (affiliate only) ────────────────────────────────────────────
const pullSchema = z.object({ productId: z.string().uuid() })

export async function pullProduct(productId: string): Promise<{ success: true } | { error: string }> {
  const parsed = pullSchema.safeParse({ productId })
  if (!parsed.success) return { error: "Product ID ไม่ถูกต้อง" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "กรุณาเข้าสู่ระบบก่อน" }

  // Role check server-side — never trust client
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.is_active) return { error: "บัญชีถูกระงับการใช้งาน" }
  if (profile.role !== "affiliate") return { error: "เฉพาะสมาชิก Affiliate เท่านั้น" }

  // Product must be active
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("is_active", true)
    .maybeSingle()
  if (!product) return { error: "ไม่พบสินค้าหรือสินค้าถูกปิดใช้งาน" }

  // Upsert — UNIQUE(affiliate_id, product_id) prevents duplicates at DB level
  const { error } = await supabase
    .from("affiliate_pulls")
    .upsert({ affiliate_id: user.id, product_id: productId }, { onConflict: "affiliate_id,product_id" })

  if (error) return { error: error.message }

  revalidatePath(`/product-ads/${productId}`)
  revalidatePath("/member/my-products")
  return { success: true }
}
