"use server"

import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateMemberRole(id: string, role: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
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
