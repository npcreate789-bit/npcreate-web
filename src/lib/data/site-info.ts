export type SiteInfo = {
  site_name: string
  tagline: string
  line_oa_url: string
  line_oa_id: string
  phone: string
  email: string
  address: string
  facebook_url: string
  tiktok_url: string
  instagram_url: string
  youtube_url: string
  ga4_id: string
  fb_pixel_id: string
  seo_title: string
  seo_description: string
  seo_keywords: string
}

export const DEFAULT_SITE_INFO: SiteInfo = {
  site_name:       "NP Create",
  tagline:         "ปั้นยอดขาย TikTok Shop ของคุณให้โต 10 เท่า ด้วย GMV Max",
  line_oa_url:     "",
  line_oa_id:      "@npcreate",
  phone:           "",
  email:           "",
  address:         "",
  facebook_url:    "",
  tiktok_url:      "",
  instagram_url:   "",
  youtube_url:     "",
  ga4_id:          "",
  fb_pixel_id:     "",
  seo_title:       "NP Create — รับยิงแอด GMV Max & TikTok Shop",
  seo_description: "ปั้นยอดขาย TikTok Shop ของคุณให้โต 10 เท่าด้วย GMV Max ดูแลมาแล้วมากกว่า 500 แบรนด์ ยอดขายรวมทะลุ 800 ล้านบาท",
  seo_keywords:    "รับยิงแอด GMV Max, TikTok Shop, ยิงแอด TikTok, การตลาดออนไลน์, NP Create, เพิ่มยอดขาย TikTok Shop",
}

export function mergeSiteInfo(override: Record<string, unknown>): SiteInfo {
  return { ...DEFAULT_SITE_INFO, ...(override as Partial<SiteInfo>) }
}

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

// Cached per-request — deduplicates DB query between generateMetadata and Footer
export const getSiteInfo = cache(async (): Promise<SiteInfo> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "site_info")
    .maybeSingle()
  return mergeSiteInfo((data?.value ?? {}) as Record<string, unknown>)
})

export function getLineOaHref(lineOaUrl: string, lineOaId: string): string {
  // ใช้ custom URL ก็ต่อเมื่อเป็น URL จริง (https://...)
  if (lineOaUrl && lineOaUrl.startsWith("http")) return lineOaUrl
  // auto-generate จาก LINE OA ID
  if (lineOaId) {
    const id = lineOaId.startsWith("@") ? lineOaId : `@${lineOaId}`
    return `https://line.me/R/ti/p/${id}`
  }
  return "/contact"
}

/**
 * ถ้า Login LINE แล้ว และเคยส่ง lead แล้ว → เปิด LINE OA โดยตรง
 * ยังไม่ได้ทำอย่างใดอย่างหนึ่ง → ผ่าน OAuth ก่อน
 */
export function getCtaHref(hasLineSession: boolean, hasSubmitted: boolean, lineOaHref: string): string {
  return (hasLineSession && hasSubmitted) ? lineOaHref : "/api/auth/line"
}
