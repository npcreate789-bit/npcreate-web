import type { Metadata } from "next"
import { cookies } from "next/headers"
import { ContactForm } from "@/components/public/contact/ContactForm"
import { ContactInfo } from "@/components/public/contact/ContactInfo"
import { createClient } from "@/lib/supabase/server"
import { mergeSiteInfo, getLineOaHref } from "@/lib/data/site-info"

export const metadata: Metadata = {
  title: "ติดต่อ",
  description:
    "ปรึกษาฟรี ไม่มีข้อผูกมัด ทีมงานตอบกลับภายใน 1 ชั่วโมง ผ่าน Line OA หรือกรอกฟอร์มด้านล่าง",
}

type LineSession = { userId: string; displayName: string; pictureUrl: string }

export default async function ContactPage() {
  const [cookieStore, supabase] = await Promise.all([cookies(), createClient()])

  const { data: { user } } = await supabase.auth.getUser()
  const isMember = !!user

  // ── hasSubmitted: member → ตรวจ active lead ใน DB, anonymous → cookie ──
  let hasSubmitted = false
  if (user) {
    // member ที่มี lead ที่ยัง "new" หรือ "contacted" ถือว่ายังรออยู่
    try {
      const { data: activeLead } = await supabase
        .from("leads")
        .select("id")
        .eq("member_id", user.id)
        .in("status", ["new", "contacted"])
        .limit(1)
        .maybeSingle()
      hasSubmitted = !!activeLead
    } catch {
      // graceful fallback ถ้า member_id column ยังไม่มี
      hasSubmitted = false
    }
  } else {
    hasSubmitted = !!cookieStore.get("contact_submitted")?.value
  }

  // ── LINE session: ดึงจาก member profile ก่อน fallback cookie ──
  let lineSession: LineSession | null = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("line_user_id, line_display_name")
      .eq("id", user.id)
      .maybeSingle()
    if (profile?.line_user_id) {
      lineSession = {
        userId:      profile.line_user_id,
        displayName: profile.line_display_name ?? "",
        pictureUrl:  "",
      }
    }
  }

  if (!lineSession) {
    try {
      const raw = cookieStore.get("line_session")?.value
      if (raw) lineSession = JSON.parse(raw) as LineSession
    } catch {}
  }

  const { data: siteData } = await supabase
    .from("site_settings").select("value").eq("key", "site_info").maybeSingle()
  const info       = mergeSiteInfo((siteData?.value ?? {}) as Record<string, unknown>)
  const lineOaHref = getLineOaHref(info.line_oa_url, info.line_oa_id)

  return (
    <main className="min-h-screen bg-[#0A0808] pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">ติดต่อเรา</span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">ปรึกษาฟรี วันนี้</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            บอกเราเกี่ยวกับ shop ของคุณ แล้วเราจะวิเคราะห์และเสนอแนวทางที่เหมาะสมที่สุดให้ฟรี
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-start">
          <ContactInfo lineHref={lineOaHref} />
          <ContactForm hasSubmitted={hasSubmitted} lineOaHref={lineOaHref} lineSession={lineSession} isMember={isMember} />
        </div>
      </div>
    </main>
  )
}
