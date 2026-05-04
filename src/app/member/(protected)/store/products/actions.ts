"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { Product } from "@/types/database"

const productSchema = z.object({
  name:                z.string().min(1).max(200).trim(),
  description:         z.string().max(2000).trim(),
  price:               z.number().positive(),
  original_price:      z.number().positive().nullable(),
  commission_rate:     z.number().min(0).max(100),
  image_url:           z.string().url().max(500).or(z.literal("")),
  tiktok_product_url:  z.string().url().max(500).or(z.literal("")),
  tags:                z.string().max(500),
  stock_status:        z.enum(["in_stock", "low_stock", "out_of_stock"]),
  monthly_sales_est:   z.number().min(0),
  is_active:           z.boolean(),
  promotion_text:      z.string().max(1000).trim(),
  caption_suggestions: z.string().max(2000).trim(),
  forbidden_words:     z.string().max(500).trim(),
})

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
  name:                string
  description:         string
  price:               number
  original_price:      number | null
  commission_rate:     number
  image_url:           string
  tiktok_product_url:  string
  tags:                string
  stock_status:        string
  monthly_sales_est:   number
  is_active:           boolean
  promotion_text:      string
  caption_suggestions: string
  forbidden_words:     string
}

function parseInput(data: ProductInput, storeId: string) {
  return {
    store_id:            storeId,
    name:                data.name.trim(),
    description:         data.description.trim() || null,
    price:               data.price,
    original_price:      data.original_price ?? null,
    commission_rate:     data.commission_rate,
    image_url:           data.image_url.trim() || null,
    tiktok_product_url:  data.tiktok_product_url.trim() || null,
    tags:                data.tags.split(",").map(t => t.trim()).filter(Boolean),
    stock_status:        data.stock_status,
    monthly_sales_est:   data.monthly_sales_est || 0,
    is_active:           data.is_active,
    promotion_text:      data.promotion_text.trim() || null,
    caption_suggestions: data.caption_suggestions.trim() || null,
    forbidden_words:     data.forbidden_words.trim() || null,
  }
}

export async function createProduct(data: ProductInput) {
  const parsed = productSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง")
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("products").insert(parseInput(parsed.data, storeId))
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/products")
  revalidatePath("/marketplace")
}

export async function updateProduct(id: string, data: ProductInput) {
  const parsed = productSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง")
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("products").update({
    ...parseInput(parsed.data, storeId),
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/products")
  revalidatePath("/marketplace")
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/products")
  revalidatePath("/marketplace")
}

export async function deleteProduct(id: string) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("products").delete().eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/products")
  revalidatePath("/marketplace")
}
