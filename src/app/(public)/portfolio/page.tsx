import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import type { Portfolio } from "@/types/database"
import { PortfolioGrid } from "@/components/public/portfolio/PortfolioGrid"
import { mergePortfolioPage } from "@/lib/data/portfolio-page"

export const metadata: Metadata = {
  title: "ผลงาน",
  description:
    "ผลงานการยิงแอด GMV Max ดูแลมาแล้วมากกว่า 500 แบรนด์ สร้างยอดขายรวมทะลุ 800 ล้านบาท ตัวเลขจริงจาก TikTok Shop dashboard",
}

export default async function PortfolioPage() {
  const supabase = await createClient()
  const [{ data: portfolios }, { data: pageData }] = await Promise.all([
    supabase.from("portfolios").select("*").eq("is_published", true).order("display_order", { ascending: true }),
    supabase.from("site_settings").select("value").eq("key", "portfolio_page").maybeSingle(),
  ])

  const page = mergePortfolioPage((pageData?.value ?? {}) as Record<string, unknown>)

  return (
    <main className="min-h-screen bg-[#0A0808] pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-14">
          <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">
            {page.label}
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
            {page.heading}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            {page.subtext}
          </p>
          {page.stats.length > 0 && (
            <div className="flex gap-8 mt-8">
              {page.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display font-bold text-2xl text-[#F59E0B]">{stat.value}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <PortfolioGrid portfolios={(portfolios as Portfolio[]) ?? []} lineHref="https://app.npcreate.co.th/contact" />
      </div>
    </main>
  )
}
