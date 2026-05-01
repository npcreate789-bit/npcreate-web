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

export default async function ContactPage() {
  const [cookieStore, supabase] = await Promise.all([cookies(), createClient()])

  const hasSubmitted = !!cookieStore.get("contact_submitted")?.value

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
          <ContactForm hasSubmitted={hasSubmitted} lineOaHref={lineOaHref} />
        </div>
      </div>
    </main>
  )
}
