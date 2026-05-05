"use server"

import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { HomepageSettings } from "@/lib/data/homepage"

export async function updateHomepageSettings(data: HomepageSettings) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "homepage", value: data, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  revalidatePath("/")
}

// ลบ field เก่าที่ไม่ใช้แล้วออกจาก Supabase JSON
export async function pruneHomepageSettings() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "homepage")
    .maybeSingle()

  if (!data?.value) return

  const raw = data.value as Record<string, unknown>
  const obsoleteKeys = ["services_section", "why_us"]
  const hasObsolete = obsoleteKeys.some((k) => k in raw)
  if (!hasObsolete) return

  obsoleteKeys.forEach((k) => delete raw[k])

  await supabase
    .from("site_settings")
    .update({ value: raw, updated_at: new Date().toISOString() })
    .eq("key", "homepage")
}
