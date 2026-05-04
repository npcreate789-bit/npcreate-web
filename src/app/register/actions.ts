"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const httpsUrl = z.string().max(500).refine(
  (v) => v === "" || /^https?:\/\//i.test(v),
  "URL ต้องเป็น https:// หรือ http://"
)

const sellerSchema = z.object({
  role: z.literal("seller"),
  store_name: z.string().min(1, "กรุณากรอกชื่อร้านค้า").max(100).trim(),
  store_tiktok_url: httpsUrl.optional().or(z.literal("")),
})

const affiliateSchema = z.object({
  role:               z.literal("affiliate"),
  tiktok_channel_url: httpsUrl.optional().or(z.literal("")),
  content_type:       z.enum(["clip", "live", "both"]).optional(),
})

const roleInfoSchema = z.discriminatedUnion("role", [sellerSchema, affiliateSchema])

export type RoleInfoInput = z.infer<typeof roleInfoSchema>

export async function saveRoleAndInfo(
  input: RoleInfoInput,
): Promise<{ redirectTo: string } | { error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "ไม่ได้เข้าสู่ระบบ" }

    const { data: profile } = await supabase
      .from("profiles").select("role_confirmed").eq("id", user.id).maybeSingle()
    if (profile?.role_confirmed) return { error: "บัญชีนี้ยืนยัน role แล้ว" }

    const parsed = roleInfoSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }

    const data = parsed.data

    if (data.role === "affiliate") {
      const { error } = await supabase
        .from("profiles")
        .update({
          role:               "affiliate",
          role_confirmed:     true,
          is_active:          true,
          tiktok_channel_url: data.tiktok_channel_url?.trim() || null,
          content_type:       data.content_type ?? null,
        })
        .eq("id", user.id)
      if (error) return { error: error.message }
      return { redirectTo: "/marketplace" }
    }

    // Seller: update profile + upsert store
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "seller", role_confirmed: true, is_active: true })
      .eq("id", user.id)
    if (profileError) return { error: profileError.message }

    const { error: storeError } = await supabase
      .from("stores")
      .upsert(
        {
          seller_id: user.id,
          name: data.store_name,
          tiktok_shop_url: data.store_tiktok_url?.trim() || null,
        },
        { onConflict: "seller_id" },
      )
    if (storeError) return { error: storeError.message }

    return { redirectTo: "/member/store" }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่" }
  }
}
