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

export default async function ContactPage() {
  const [cookieStore, supabase] = await Promise.all([cookies(), createClient()])
  const { data: { user } } = await supabase.auth.getUser()

  // ── Fetch profile + store + site settings ─────────────────────────────────────
  const [profileRes, storeRes, siteRes] = await Promise.all([
    user
      ? supabase
          .from("profiles")
          .select("role, role_confirmed, line_user_id, line_display_name, full_name, phone, tiktok_channel_url")
          .eq("id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("stores")
          .select("name")
          .eq("seller_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("site_settings").select("value").eq("key", "site_info").maybeSingle(),
  ])

  const profile    = profileRes.data
  const store      = storeRes.data
  const info       = mergeSiteInfo((siteRes.data?.value ?? {}) as Record<string, unknown>)
  const lineOaHref = getLineOaHref(info.line_oa_url, info.line_oa_id)

  // ── User role (auto-detect) ───────────────────────────────────────────────────
  const userRole: UserRole = profile?.role_confirmed
    ? (profile.role as UserRole)
    : null

  // ── LINE session ──────────────────────────────────────────────────────────────
  let lineSession: LineSession | null = null
  if (profile?.line_user_id) {
    lineSession = { userId: profile.line_user_id, displayName: profile.line_display_name ?? "", pictureUrl: "" }
  }
  if (!lineSession) {
    try {
      const raw = cookieStore.get("line_session")?.value
      if (raw) lineSession = JSON.parse(raw) as LineSession
    } catch {}
  }

  // ── Prefill data from profile ─────────────────────────────────────────────────
  const prefill = {
    fullName:   profile?.full_name ?? "",
    // normalize: strip dashes/spaces so it always matches /^0[6-9]\d{8}$/
    phone:      (profile?.phone ?? "").replace(/[^0-9]/g, ""),
    storeName:  store?.name ?? "",
    tiktokUrl:  profile?.tiktok_channel_url ?? "",
  }

  // ── hasSubmitted (only relevant when logged in) ───────────────────────────────
  let sellerHasSubmitted    = false
  let affiliateHasSubmitted = false

  if (user) {
    try {
      const { data: lead } = await supabase
        .from("leads")
        .select("id")
        .eq("member_id", user.id)
        .eq("lead_type", "seller")
        .in("status", ["new", "contacted"])
        .limit(1)
        .maybeSingle()
      sellerHasSubmitted = !!lead
    } catch {
      sellerHasSubmitted = !!cookieStore.get("contact_submitted")?.value
    }
    affiliateHasSubmitted = !!cookieStore.get("contact_affiliate_submitted")?.value
  }

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
            {!user
              ? <>สมัครสมาชิกฟรีหรือเข้าสู่ระบบ<br /><span className="text-slate-500 text-sm">เพื่อส่งข้อมูลและให้ทีมงานติดต่อกลับโดยตรง</span></>
              : userRole === "affiliate"
                ? <>คอร์สเรียน TikTok Affiliate และบริการวางแผนกลยุทธ์<br /><span className="text-slate-500 text-sm">ทีมงานตอบกลับภายใน 1 ชั่วโมง ในเวลาทำการ 9:00–20:00 น.</span></>
                : <>ปรึกษายิงแอด GMV Max และวางกลยุทธ์ TikTok Shop<br /><span className="text-slate-500 text-sm">ปรึกษาฟรี ไม่มีข้อผูกมัด ทีมงานตอบกลับภายใน 1 ชั่วโมง</span></>
            }
          </p>
        </div>

        <ContactForm
          userRole={userRole}
          sellerHasSubmitted={sellerHasSubmitted}
          affiliateHasSubmitted={affiliateHasSubmitted}
          lineSession={lineSession}
          isMember={!!user}
          lineOaHref={lineOaHref}
          prefill={prefill}
        />

      </div>
    </main>
  )
}
