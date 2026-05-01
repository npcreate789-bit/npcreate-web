import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import type { Service } from "@/types/database"
import { ServicesDetail } from "@/components/public/services/ServicesDetail"
import { ProcessSection } from "@/components/public/services/ProcessSection"
import { PricingSection } from "@/components/public/services/PricingSection"
import { FAQSection } from "@/components/public/services/FAQSection"
import { CTASection } from "@/components/public/CTASection"

export const metadata: Metadata = {
  title: "บริการ",
  description:
    "บริการยิงแอด GMV Max, วางกลยุทธ์ TikTok Shop, ผลิต Creative และวิเคราะห์ผลลัพธ์ โดยทีมผู้เชี่ยวชาญเฉพาะทาง",
}

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("services").select("*").eq("is_active", true).order("display_order", { ascending: true })

  const all      = (data as Service[]) ?? []
  const services = all.filter((s) => s.category === "service")
  const plans    = all.filter((s) => s.category === "pricing")

  return (
    <main className="min-h-screen bg-[#0A0808] pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-2xl">
          <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">
            บริการของเรา
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-5">
            ครบทุกขั้นตอน
            <br />
            <span className="text-[#DC2626]">ดูแลถึง Result</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            ไม่ใช่แค่ยิงแอด — เราวางกลยุทธ์ ผลิต creative ติดตามผลลัพธ์ และปรับ campaign
            แบบ real-time เพื่อให้ทุกบาทที่ลงทุนได้ผลตอบแทนสูงสุด
          </p>
        </div>
      </div>

      <ServicesDetail services={services} />
      <ProcessSection />
      <PricingSection plans={plans} lineHref="/contact" />
      <FAQSection lineHref="/contact" />
      <CTASection lineOaHref="/contact" />
    </main>
  )
}
