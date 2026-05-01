"use server"

import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { AboutContent } from "@/lib/data/about-content"

export async function updateAboutContent(data: AboutContent) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "about_content", value: data as unknown as Record<string, unknown> }, { onConflict: "key" })
  if (error) throw new Error(error.message)
  revalidatePath("/about")
}
