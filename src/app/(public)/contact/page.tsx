import type { Metadata } from "next"
import { cookies } from "next/headers"
import { ContactForm } from "@/components/public/contact/ContactForm"
import { createClient } from "@/lib/supabase/server"
import { mergeSiteInfo, getLineOaHref } from "@/lib/data/site-info"

export const metadata: Metadata = {
  title: "ติดต่อ",
  description:
    "ปรึกษาฟรี ไม่มีข้อผูกมัด ทีมงานตอบกลับภายใน 1 ชั่วโมง — สำหรับ Seller ที่ต้องการยิงแอด GMV Max หรือ Affiliate ที่ต้องการคอร์สเรียนและวางแผนกลยุทธ์",
}

type LineSession = { userId: string; displayName: string; pictureUrl: string }
type UserRole    = "seller" | "affiliate" | "admin" | null

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const [cookieStore, supabase] = await Promise.all([cookies(), createClient()])
  const { data: { user } } = await supabase.auth.getUser()

  // ── User role (auto-detect from DB) ──────────────────────────────────────────
  let userRole: UserRole = null
  let lineSession: LineSession | null = null

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, role_confirmed, line_user_id, line_display_name")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.role_confirmed) {
      userRole = (profile.role as UserRole) ?? null
    }
    if (profile?.line_user_id) {
      lineSession = {
        userId:      profile.line_user_id,
        displayName: profile.line_display_name ?? "",
        pictureUrl:  "",
      }
    }
  }

  // Fallback: LINE session from cookie (for non-member LINE users)
  if (!lineSession) {
    try {
      const raw = cookieStore.get("line_session")?.value
      if (raw) lineSession = JSON.parse(raw) as LineSession
    } catch {}
  }

  // ── hasSubmitted ─────────────────────────────────────────────────────────────
  // Seller: member → DB check, anonymous → cookie
  let sellerHasSubmitted = false
  if (user) {
    try {
      const { data: activeLead } = await supabase
        .from("leads")
        .select("id")
        .eq("member_id", user.id)
        .eq("lead_type", "seller")
        .in("status", ["new", "contacted"])
        .limit(1)
        .maybeSingle()
      sellerHasSubmitted = !!activeLead
    } catch {
      sellerHasSubmitted = !!cookieStore.get("contact_submitted")?.value
    }
  } else {
    sellerHasSubmitted = !!cookieStore.get("contact_submitted")?.value
  }

  // Affiliate: cookie-based
  const affiliateHasSubmitted = !!cookieStore.get("contact_affiliate_submitted")?.value

  // ── Site settings ─────────────────────────────────────────────────────────────
  const { data: siteData } = await supabase
    .from("site_settings").select("value").eq("key", "site_info").maybeSingle()
  const info       = mergeSiteInfo((siteData?.value ?? {}) as Record<string, unknown>)
  const lineOaHref = getLineOaHref(info.line_oa_url, info.line_oa_id)

  // ── fallback form type for non-logged-in users (from URL ?type=) ─────────────
  const defaultFormType: "seller" | "affiliate" =
    type === "affiliate" ? "affiliate" : "seller"

  return (
    <main className="min-h-screen bg-[#0A0808] pt-24 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Page header */}
        <div className="text-center mb-8">
          <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">ติดต่อเรา</span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
            เริ่มต้นด้วยการคุย
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            {userRole === "affiliate"
              ? <>คอร์สเรียน TikTok Affiliate และบริการวางแผนกลยุทธ์<br /><span className="text-slate-500 text-sm">ทีมงานตอบกลับภายใน 1 ชั่วโมง ในเวลาทำการ 9:00–20:00 น.</span></>
              : <>ปรึกษายิงแอด GMV Max และวางกลยุทธ์ TikTok Shop<br /><span className="text-slate-500 text-sm">ปรึกษาฟรี ไม่มีข้อผูกมัด ทีมงานตอบกลับภายใน 1 ชั่วโมง</span></>
            }
          </p>
        </div>

        <ContactForm
          userRole={userRole}
          defaultFormType={defaultFormType}
          sellerHasSubmitted={sellerHasSubmitted}
          affiliateHasSubmitted={affiliateHasSubmitted}
          lineSession={lineSession}
          isMember={!!user}
          lineOaHref={lineOaHref}
        />

      </div>
    </main>
  )
}
