"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { HomepageSettings } from "@/lib/data/homepage"

export async function updateHomepageSettings(data: HomepageSettings) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "homepage", value: data, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  revalidatePath("/")
}
