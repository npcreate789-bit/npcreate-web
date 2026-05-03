"use server"

import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { ProductInput } from "./schema"

function normalise(data: ProductInput) {
  return {
    ...data,
    description:         data.description         || null,
    image_url:           data.image_url           || null,
    tiktok_product_url:  data.tiktok_product_url  || null,
    promotion_text:      data.promotion_text      || null,
    caption_suggestions: data.caption_suggestions || null,
    forbidden_words:     data.forbidden_words     || null,
  }
}

function bust(id?: string) {
  revalidatePath("/admin/marketplace")
  revalidatePath("/marketplace")
  if (id) revalidatePath(`/marketplace/${id}`)
}

export async function createProduct(data: ProductInput) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("products").insert(normalise(data))
  if (error) throw new Error(error.message)
  bust()
  redirect("/admin/marketplace")
}

export async function updateProduct(id: string, data: ProductInput) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("products")
    .update({ ...normalise(data), updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  bust(id)
  redirect("/admin/marketplace")
}

export async function deleteProduct(id: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)
  bust(id)
}

export async function toggleProductActive(id: string, is_active: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("products")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  bust(id)
}
