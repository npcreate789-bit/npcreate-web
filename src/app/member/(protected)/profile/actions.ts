"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { full_name: string; phone: string; line_id: string }) {
  if (data.full_name.trim().length > 100) throw new Error("ชื่อยาวเกินไป")
  if (data.phone.trim().length > 20)      throw new Error("เบอร์โทรไม่ถูกต้อง")
  if (data.line_id.trim().length > 50)    throw new Error("LINE ID ยาวเกินไป")
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

export async function updateContentType(contentType: "clip" | "live" | "both") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const { error } = await supabase
    .from("profiles")
    .update({ content_type: contentType, updated_at: new Date().toISOString() })
    .eq("id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/member/profile")
  revalidatePath("/member/store/pulls")
}

export async function updateTiktokUrl(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const trimmed = url.trim()
  if (trimmed && !/^https?:\/\//i.test(trimmed)) throw new Error("URL ต้องเป็น https:// หรือ http://")
  const { error } = await supabase
    .from("profiles")
    .update({ tiktok_channel_url: trimmed || null, updated_at: new Date().toISOString() })
    .eq("id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/member")
  revalidatePath("/member/profile")
  revalidatePath("/product-ads")
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
  if (data.address_name.trim().length > 100)        throw new Error("ชื่อผู้รับยาวเกินไป")
  if (data.address_phone.trim().length > 20)         throw new Error("เบอร์ผู้รับไม่ถูกต้อง")
  if (data.address_line1.trim().length > 200)        throw new Error("ที่อยู่ยาวเกินไป")
  if (data.address_subdistrict.trim().length > 100)  throw new Error("แขวง/ตำบลยาวเกินไป")
  if (data.address_district.trim().length > 100)     throw new Error("เขต/อำเภอยาวเกินไป")
  if (data.address_province.trim().length > 100)     throw new Error("จังหวัดยาวเกินไป")
  if (!/^\d{5}$/.test(data.address_postcode.trim()) && data.address_postcode.trim())
    throw new Error("รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก")
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

const AVATAR_ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp"]

export async function updateAvatarUrl(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  // Only allow URLs from our Supabase storage bucket
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base || !url.startsWith(`${base}/storage/`)) {
    throw new Error("Invalid avatar URL")
  }
  // Validate image extension (strip query string before checking)
  const urlPath = url.split("?")[0].toLowerCase()
  if (!AVATAR_ALLOWED_EXTS.some(ext => urlPath.endsWith(ext))) {
    throw new Error("ประเภทไฟล์ไม่ถูกต้อง")
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
