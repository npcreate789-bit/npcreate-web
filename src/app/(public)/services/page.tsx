import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import type { Service } from "@/types/database"
import { mergeServicesPage } from "@/lib/data/services-page"
import { ServicesDetail } from "@/components/public/services/ServicesDetail"
import { ProcessSection } from "@/components/public/services/ProcessSection"
import { PricingSection } from "@/components/public/services/PricingSection"
import { FAQSection } from "@/components/public/services/FAQSection"

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
    <main className="bg-[#0A0808] pt-24">

      {/* ── Page header ── */}
      <div className="relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-0 -left-24 w-80 h-80 bg-[#DC2626]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#DC2626]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12">
          {/* Badge label */}
          <div
            className="inline-flex items-center gap-2 border text-xs font-bold uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full mb-6"
            style={{
              color: page.heading2_color,
              borderColor: `${page.heading2_color}33`,
              background: `${page.heading2_color}12`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: page.heading2_color }}
            />
            {page.label}
          </div>

          {/* Heading */}
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-snug mb-5 max-w-2xl">
            {page.heading1}
            <span className="block" style={{ color: page.heading2_color }}>
              {page.heading2}
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
            {page.description}
          </p>

          {/* Bottom accent line */}
          <div className="mt-10 h-px max-w-xs bg-gradient-to-r from-[#DC2626]/40 via-[#DC2626]/10 to-transparent" />
        </div>
      </div>

      <ServicesDetail services={serviceList} />
      <ProcessSection
        steps={page.process_steps}
        label={page.process_label}
        heading={page.process_heading}
        subtext={page.process_subtext}
      />
      <PricingSection
        plans={plans}
        lineHref="/contact"
        label={page.pricing_label}
        heading={page.pricing_heading}
        subtext={page.pricing_subtext}
      />
      <FAQSection faqs={page.faqs} lineHref="/contact" />
    </main>
  )
}
