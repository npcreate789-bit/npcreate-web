"use server"

import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const urlOrEmpty = z.string().trim().max(500).refine(
  v => v === "" || /^https?:\/\/.+/.test(v),
  { message: "URL ต้องขึ้นต้นด้วย https://" }
)

const siteInfoSchema = z.object({
  site_name:       z.string().trim().min(1).max(100),
  tagline:         z.string().trim().max(300),
  line_oa_url:     urlOrEmpty,
  line_oa_id:      z.string().trim().max(100),
  phone:           z.string().trim().max(20),
  email:           z.string().trim().email().max(255).or(z.literal("")),
  address:         z.string().trim().max(500),
  facebook_url:    urlOrEmpty,
  tiktok_url:      urlOrEmpty,
  instagram_url:   urlOrEmpty,
  youtube_url:     urlOrEmpty,
  ga4_id:          z.string().trim().max(50).regex(/^(G-[A-Z0-9]+)?$/).or(z.literal("")),
  fb_pixel_id:     z.string().trim().max(50).regex(/^\d*$/),
  seo_title:       z.string().trim().min(1).max(160),
  seo_description: z.string().trim().max(320),
  seo_keywords:    z.string().trim().max(500),
})

const passwordSchema = z.object({
  newPassword: z.string().min(8).max(128)
    .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่")
    .regex(/[0-9]/, "ต้องมีตัวเลข"),
})

export async function updateSiteInfo(data: unknown) {
  const { supabase } = await requireAdmin()
  const clean = siteInfoSchema.parse(data)
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "site_info", value: clean }, { onConflict: "key" })
  if (error) throw new Error(error.message)
  revalidatePath("/", "layout")
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { supabase, user } = await requireAdmin()
  passwordSchema.parse({ newPassword })

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })
  if (verifyError) throw new Error("รหัสผ่านปัจจุบันไม่ถูกต้อง")

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}
