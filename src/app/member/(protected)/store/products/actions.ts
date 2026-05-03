"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Product } from "@/types/database"

async function getStoreId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from("stores").select("id").eq("seller_id", userId).maybeSingle()
  if (!data) throw new Error("ไม่พบร้านค้า กรุณาสร้างร้านค้าก่อน")
  return data.id as string
}

async function getSellerCtx() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const storeId = await getStoreId(supabase, user.id)
  return { supabase, user, storeId }
}

export async function getStoreProducts(): Promise<Product[]> {
  const { supabase, storeId } = await getSellerCtx()
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
  return (data ?? []) as Product[]
}

export async function getProduct(id: string): Promise<Product | null> {
  const { supabase, storeId } = await getSellerCtx()
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("store_id", storeId)
    .maybeSingle()
  return data as Product | null
}

export type ProductInput = {
  name: string
  description: string
  price: number
  original_price: number | null
  commission_rate: number
  image_url: string
  tiktok_product_url: string
  tags: string
  stock_status: string
  monthly_sales_est: number
  is_active: boolean
}

function parseInput(data: ProductInput, storeId: string) {
  return {
    store_id: storeId,
    name: data.name.trim(),
    description: data.description.trim() || null,
    price: data.price,
    original_price: data.original_price ?? null,
    commission_rate: data.commission_rate,
    image_url: data.image_url.trim() || null,
    tiktok_product_url: data.tiktok_product_url.trim() || null,
    tags: data.tags.split(",").map(t => t.trim()).filter(Boolean),
    stock_status: data.stock_status,
    monthly_sales_est: data.monthly_sales_est || 0,
    is_active: data.is_active,
  }
}

export async function createProduct(data: ProductInput) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("products").insert(parseInput(data, storeId))
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/products")
  revalidatePath("/member/marketplace")
}

export async function updateProduct(id: string, data: ProductInput) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("products").update({
    ...parseInput(data, storeId),
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/products")
  revalidatePath("/member/marketplace")
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/products")
  revalidatePath("/member/marketplace")
}

export async function deleteProduct(id: string) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("products").delete().eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/products")
  revalidatePath("/member/marketplace")
}
