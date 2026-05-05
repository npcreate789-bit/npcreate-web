import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import type { Service } from "@/types/database"
import { mergeServicesPage } from "@/lib/data/services-page"
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

  const [{ data: services }, { data: pageData }] = await Promise.all([
    supabase.from("services").select("*").eq("is_active", true).order("display_order"),
    supabase.from("site_settings").select("value").eq("key", "services_page").maybeSingle(),
  ])

  const all = (services as Service[]) ?? []
  const plans = all.filter((s) => s.category === "pricing")
  const serviceList = all.filter((s) => s.category === "service")

  const page = mergeServicesPage((pageData?.value ?? {}) as Record<string, unknown>)

  return (
    <main className="min-h-screen bg-[#0A0808] pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-2xl">
          <span
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: page.heading2_color }}
          >
            {page.label}
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-5">
            {page.heading1}
            <br />
            <span style={{ color: page.heading2_color }}>{page.heading2}</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">{page.description}</p>
        </div>
      </div>

      <ServicesDetail services={serviceList} />
      <ProcessSection />
      <PricingSection plans={plans} lineHref="/contact" />
      <FAQSection lineHref="/contact" />
      <CTASection lineOaHref="/contact" />
    </main>
  )
}
