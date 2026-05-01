"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { PromoBannerInput } from "./schema"

function clean(data: PromoBannerInput): PromoBannerInput {
  return {
    ...data,
    banner_url:   data.banner_url?.trim()   || null as unknown as string,
    detail:       data.detail?.trim()       || null as unknown as string,
    price_text:   data.price_text?.trim()   || null as unknown as string,
    contact_text: data.contact_text.trim(),
    contact_url:  data.contact_url.trim()   || "/api/auth/line",
  }
}

function revalidate() {
  revalidatePath("/")
  revalidatePath("/admin/homepage/banners")
}

export async function createPromoBanner(data: PromoBannerInput) {
  const supabase = await createClient()
  const { error } = await supabase.from("promo_banners").insert(clean(data))
  if (error) throw new Error(error.message)
  revalidate()
  redirect("/admin/homepage/banners")
}

export async function updatePromoBanner(id: string, data: PromoBannerInput) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("promo_banners")
    .update({ ...clean(data), updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidate()
  redirect("/admin/homepage/banners")
}

export async function deletePromoBanner(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("promo_banners").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function togglePromoBannerActive(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("promo_banners")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidate()
}
