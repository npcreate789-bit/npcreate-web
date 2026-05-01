"use server"

import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { SiteInfo } from "@/lib/data/site-info"

export async function updateSiteInfo(data: SiteInfo) {
  const { supabase } = await requireAdmin()
  const clean: SiteInfo = {
    site_name:     data.site_name.trim(),
    tagline:       data.tagline.trim(),
    line_oa_url:   data.line_oa_url.trim(),
    line_oa_id:    data.line_oa_id.trim(),
    phone:         data.phone.trim(),
    email:         data.email.trim(),
    address:       data.address.trim(),
    facebook_url:  data.facebook_url.trim(),
    tiktok_url:    data.tiktok_url.trim(),
    instagram_url: data.instagram_url.trim(),
    youtube_url:   data.youtube_url.trim(),
    ga4_id:        data.ga4_id.trim(),
    fb_pixel_id:   data.fb_pixel_id.trim(),
  }
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "site_info", value: clean }, { onConflict: "key" })
  if (error) throw new Error(error.message)
  revalidatePath("/", "layout")
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { supabase, user } = await requireAdmin()

  // Verify current password before allowing change
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })
  if (verifyError) throw new Error("รหัสผ่านปัจจุบันไม่ถูกต้อง")

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}
