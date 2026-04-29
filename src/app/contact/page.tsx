import type { Metadata } from "next"
import { cookies } from "next/headers"
import { ContactForm } from "@/components/public/contact/ContactForm"
import { ContactInfo } from "@/components/public/contact/ContactInfo"
import type { LineSession } from "@/components/public/contact/ContactForm"

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

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("line_session")?.value

  let lineSession: LineSession | null = null
  if (sessionCookie) {
    try {
      lineSession = JSON.parse(sessionCookie)
    } catch {}
  }

  return (
    <main className="min-h-screen bg-[#0F172A] pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* OAuth error banner */}
        {error && errorMessages[error] && (
          <div className="max-w-xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
            {errorMessages[error]}
          </div>
        )}

        {/* Page header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[#6366F1] text-sm font-semibold uppercase tracking-widest">
            ติดต่อเรา
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
            ปรึกษาฟรี วันนี้
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            บอกเราเกี่ยวกับ shop ของคุณ แล้วเราจะวิเคราะห์และเสนอแนวทางที่เหมาะสมที่สุดให้ฟรี
          </p>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-start">
          <ContactInfo />
          <ContactForm lineSession={lineSession} />
        </div>
      </div>
    </main>
  )
}
