"use server"

import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const VALID_ROLES = ["admin", "affiliate", "seller"] as const
type ValidRole = typeof VALID_ROLES[number]

export async function updateMemberRole(id: string, role: string) {
  if (!VALID_ROLES.includes(role as ValidRole)) throw new Error("role ไม่ถูกต้อง")
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("profiles")
    .update({ role: role as ValidRole, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/members")
}

export async function toggleMemberActive(id: string, is_active: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("profiles")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/members")
}
