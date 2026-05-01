import type { Metadata } from "next"
import { cookies } from "next/headers"
import { ContactForm } from "@/components/public/contact/ContactForm"
import { ContactInfo } from "@/components/public/contact/ContactInfo"
import type { LineSession } from "@/components/public/contact/ContactForm"
import { createClient } from "@/lib/supabase/server"
import { mergeSiteInfo, getLineOaHref } from "@/lib/data/site-info"

export const metadata: Metadata = {
  title: "ติดต่อ",
  description:
    "ปรึกษาฟรี ไม่มีข้อผูกมัด ทีมงานตอบกลับภายใน 1 ชั่วโมง ผ่าน Line OA หรือกรอกฟอร์มด้านล่าง",
}

const errorMessages: Record<string, string> = {
  invalid_state: "เกิดข้อผิดพลาดด้านความปลอดภัย กรุณาลองใหม่",
  token_failed: "ไม่สามารถยืนยัน Line ได้ กรุณาลองใหม่",
  profile_failed: "ไม่สามารถดึงข้อมูล Line ได้ กรุณาลองใหม่",
  server_error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
}

async function checkLineFollow(userId: string): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) return true // skip check if not configured — don't block user
  try {
    const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    return res.ok
  } catch {
    return true // network error — don't block user
  }
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("line_session")?.value
  const hasSubmitted  = !!cookieStore.get("contact_submitted")?.value

  let lineSession: LineSession | null = null
  if (sessionCookie) {
    try { lineSession = JSON.parse(sessionCookie) } catch {}
  }

  const [siteResult, hasAddedLineOa] = await Promise.all([
    createClient().then(sb =>
      sb.from("site_settings").select("value").eq("key", "site_info").maybeSingle()
    ),
    lineSession && !hasSubmitted ? checkLineFollow(lineSession.userId) : Promise.resolve(true),
  ])

  const info       = mergeSiteInfo((siteResult.data?.value ?? {}) as Record<string, unknown>)
  const lineOaHref = getLineOaHref(info.line_oa_url, info.line_oa_id)

  return (
    <main className="min-h-screen bg-[#0A0808] pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {error && errorMessages[error] && (
          <div className="max-w-xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
            {errorMessages[error]}
          </div>
        )}

        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">ติดต่อเรา</span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">ปรึกษาฟรี วันนี้</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            บอกเราเกี่ยวกับ shop ของคุณ แล้วเราจะวิเคราะห์และเสนอแนวทางที่เหมาะสมที่สุดให้ฟรี
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-start">
          <ContactInfo lineHref={lineOaHref} />
          <ContactForm
            lineSession={lineSession}
            hasSubmitted={hasSubmitted}
            lineOaHref={lineOaHref}
            hasAddedLineOa={hasAddedLineOa}
          />
        </div>
      </div>
    </main>
  )
}
