"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { full_name: string; phone: string; line_id: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name.trim(),
      phone:     data.phone.trim(),
      line_id:   data.line_id.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/member")
  revalidatePath("/member/profile")
}

export async function updateTiktokUrl(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const { error } = await supabase
    .from("profiles")
    .update({ tiktok_channel_url: url.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/member")
  revalidatePath("/member/profile")
  revalidatePath("/marketplace")
}

export async function updateAddress(data: {
  address_name: string
  address_phone: string
  address_line1: string
  address_subdistrict: string
  address_district: string
  address_province: string
  address_postcode: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const { error } = await supabase
    .from("profiles")
    .update({
      address_name:        data.address_name.trim()        || null,
      address_phone:       data.address_phone.trim()       || null,
      address_line1:       data.address_line1.trim()       || null,
      address_subdistrict: data.address_subdistrict.trim() || null,
      address_district:    data.address_district.trim()    || null,
      address_province:    data.address_province.trim()    || null,
      address_postcode:    data.address_postcode.trim()    || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/member/profile")
}

export async function updateAvatarUrl(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  // Only allow URLs from our Supabase storage bucket
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base || !url.startsWith(`${base}/storage/`)) {
    throw new Error("Invalid avatar URL")
  }
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url, updated_at: new Date().toISOString() })
    .eq("id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/member")
  revalidatePath("/member/profile")
}

export async function changePassword(newPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(translateAuthError(error.message))
}

function translateAuthError(msg: string): string {
  if (msg.includes("New password should be different")) return "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม"
  if (msg.includes("Password should be at least")) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
  if (msg.includes("Auth session missing")) return "หมดเวลาเข้าสู่ระบบ กรุณา login ใหม่"
  return msg
}

export async function removeAvatarUrl() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/member")
  revalidatePath("/member/profile")
}

export async function unlinkLine() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const { error } = await supabase
    .from("profiles")
    .update({ line_user_id: null, line_display_name: null, updated_at: new Date().toISOString() })
    .eq("id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/member")
  revalidatePath("/member/profile")
}
