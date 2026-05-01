"use server"

import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { HeroMediaInput } from "./schema"

const SUPABASE_STORAGE = process.env.NEXT_PUBLIC_SUPABASE_URL

function validateMediaUrl(url: string) {
  if (!SUPABASE_STORAGE || !url.startsWith(`${SUPABASE_STORAGE}/storage/`)) {
    throw new Error("Invalid media URL — must be from Supabase storage")
  }
}

function cleanCaption(input: HeroMediaInput): HeroMediaInput {
  return { ...input, caption: input.caption?.trim() || null }
}

export async function createHeroMedia(data: HeroMediaInput) {
  const { supabase } = await requireAdmin()
  validateMediaUrl(data.media_url)
  const cleaned = cleanCaption(data)
  const { error } = await supabase.from("hero_media").insert(cleaned)
  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/admin/homepage/media")
  redirect("/admin/homepage/media")
}

export async function updateHeroMedia(id: string, data: HeroMediaInput) {
  const { supabase } = await requireAdmin()
  validateMediaUrl(data.media_url)
  const cleaned = cleanCaption(data)
  const { error } = await supabase
    .from("hero_media")
    .update({ ...cleaned, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/admin/homepage/media")
  redirect("/admin/homepage/media")
}

export async function deleteHeroMedia(id: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("hero_media").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/admin/homepage/media")
}

export async function toggleHeroMediaActive(id: string, is_active: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("hero_media")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/admin/homepage/media")
}
