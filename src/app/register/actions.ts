"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const sellerSchema = z.object({
  role: z.literal("seller"),
  store_name: z.string().min(1, "กรุณากรอกชื่อร้านค้า").max(100).trim(),
  store_tiktok_url: z.string().url("URL ไม่ถูกต้อง").optional().or(z.literal("")),
})

const affiliateSchema = z.object({
  role: z.literal("affiliate"),
  tiktok_channel_url: z.string().url("URL ไม่ถูกต้อง").optional().or(z.literal("")),
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

    const parsed = roleInfoSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }

    const data = parsed.data

    if (data.role === "affiliate") {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "affiliate", role_confirmed: true, is_active: true })
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
