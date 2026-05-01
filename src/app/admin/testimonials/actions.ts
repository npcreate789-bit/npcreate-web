"use server"

import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { TestimonialInput } from "./schema"

function clean(data: TestimonialInput) {
  return {
    ...data,
    client_role:    data.client_role    || null,
    client_company: data.client_company || null,
    client_avatar:  data.client_avatar  || null,
    short_quote:    data.short_quote    || null,
  }
}

export async function createTestimonial(data: TestimonialInput) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("testimonials").insert(clean(data))
  if (error) throw new Error(error.message)
  revalidatePath("/admin/testimonials")
  revalidatePath("/")
  redirect("/admin/testimonials")
}

export async function updateTestimonial(id: string, data: TestimonialInput) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("testimonials")
    .update({ ...clean(data), updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/testimonials")
  revalidatePath("/")
  redirect("/admin/testimonials")
}

export async function deleteTestimonial(id: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("testimonials").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/testimonials")
  revalidatePath("/")
}

export async function togglePublishedTestimonial(id: string, is_published: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("testimonials")
    .update({ is_published, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/testimonials")
  revalidatePath("/")
}
