"use server"

import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { ServiceInput } from "./schema"
import type { ServicesPageSettings } from "@/lib/data/services-page"

export async function createService(data: ServiceInput) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("services").insert(data)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/services")
  revalidatePath("/services")
  redirect("/admin/services")
}

export async function updateService(id: string, data: ServiceInput) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("services")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/services")
  revalidatePath("/services")
  redirect("/admin/services")
}

export async function deleteService(id: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("services").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/services")
  revalidatePath("/services")
}

export async function toggleActive(id: string, is_active: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("services")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/services")
  revalidatePath("/services")
}

export async function updateServicesPageSettings(data: ServicesPageSettings) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "services_page", value: data, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  revalidatePath("/admin/services")
  revalidatePath("/services")
}
