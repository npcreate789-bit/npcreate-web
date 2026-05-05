"use server"

import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { PortfolioInput } from "./schema"
import type { PortfolioPageSettings } from "@/lib/data/portfolio-page"

export async function createPortfolio(data: PortfolioInput) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("portfolios").insert(data)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/portfolios")
  redirect("/admin/portfolios")
}

export async function updatePortfolio(id: string, data: PortfolioInput) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("portfolios").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/portfolios")
  redirect("/admin/portfolios")
}

export async function deletePortfolio(id: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("portfolios").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/portfolios")
}

export async function togglePublished(id: string, is_published: boolean) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("portfolios")
    .update({ is_published, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/portfolios")
}

export async function updatePortfolioPageSettings(data: PortfolioPageSettings) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "portfolio_page", value: data, updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw new Error(error.message)
  revalidatePath("/admin/portfolios")
  revalidatePath("/portfolio")
}
