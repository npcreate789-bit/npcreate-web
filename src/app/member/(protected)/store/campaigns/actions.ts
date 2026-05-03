"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Campaign } from "@/types/database"

async function getSellerCtx() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("ไม่ได้เข้าสู่ระบบ")
  const { data: store } = await supabase.from("stores").select("id").eq("seller_id", user.id).maybeSingle()
  if (!store) throw new Error("ไม่พบร้านค้า")
  return { supabase, user, storeId: store.id as string }
}

export async function getStoreCampaigns(): Promise<Campaign[]> {
  const { supabase, storeId } = await getSellerCtx()
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
  return (data ?? []) as Campaign[]
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const { supabase, storeId } = await getSellerCtx()
  const { data } = await supabase
    .from("campaigns").select("*")
    .eq("id", id).eq("store_id", storeId).maybeSingle()
  return data as Campaign | null
}

export type CampaignInput = {
  title: string
  description: string
  special_commission_rate: number | null
  starts_at: string
  ends_at: string
  product_ids: string[]
  script: string
  banner_url: string
  is_active: boolean
}

function parseInput(data: CampaignInput, storeId: string) {
  return {
    store_id: storeId,
    title: data.title.trim(),
    description: data.description.trim() || null,
    special_commission_rate: data.special_commission_rate ?? null,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    product_ids: data.product_ids,
    script: data.script.trim() || null,
    banner_url: data.banner_url.trim() || null,
    is_active: data.is_active,
  }
}

export async function createCampaign(data: CampaignInput) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("campaigns").insert(parseInput(data, storeId))
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/campaigns")
  revalidatePath("/member/marketplace")
}

export async function updateCampaign(id: string, data: CampaignInput) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("campaigns").update({
    ...parseInput(data, storeId),
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/campaigns")
  revalidatePath("/member/marketplace")
}

export async function toggleCampaignActive(id: string, isActive: boolean) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("campaigns")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/campaigns")
  revalidatePath("/member/marketplace")
}

export async function deleteCampaign(id: string) {
  const { supabase, storeId } = await getSellerCtx()
  const { error } = await supabase.from("campaigns").delete().eq("id", id).eq("store_id", storeId)
  if (error) throw new Error(error.message)
  revalidatePath("/member/store/campaigns")
  revalidatePath("/member/marketplace")
}
