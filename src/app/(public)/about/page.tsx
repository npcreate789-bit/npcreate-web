import type { Metadata } from "next"
import { CheckCircle2, Target, Eye, Heart, Zap } from "lucide-react"
import { CTASection } from "@/components/public/CTASection"
import { createClient } from "@/lib/supabase/server"
import { mergeAboutContent } from "@/lib/data/about-content"
import { cookies } from "next/headers"
import { mergeSiteInfo, getLineOaHref, getCtaHref } from "@/lib/data/site-info"
import type { LucideIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "NP Create คือทีมผู้เชี่ยวชาญด้าน TikTok Shop GMV Max ดูแลมาแล้วมากกว่า 500 แบรนด์ สร้างยอดขายรวมทะลุ 800 ล้านบาท",
}

const VALUE_ICONS: LucideIcon[] = [Target, Eye, Heart, Zap]

export default async function AboutPage() {
  const [supabase, cookieStore] = await Promise.all([createClient(), cookies()])
  const [{ data }, { data: siteData }] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "about_content").maybeSingle(),
    supabase.from("site_settings").select("value").eq("key", "site_info").maybeSingle(),
  ])

  const c            = mergeAboutContent((data?.value ?? {}) as Record<string, unknown>)
  const info         = mergeSiteInfo((siteData?.value ?? {}) as Record<string, unknown>)
  const lineOaHref   = getLineOaHref(info.line_oa_url, info.line_oa_id)
  const hasLineSession = !!cookieStore.get("line_session")?.value
  const hasSubmitted   = !!cookieStore.get("contact_submitted")?.value
  const ctaHref        = getCtaHref(hasLineSession, hasSubmitted, lineOaHref)

  return (
    <main className="min-h-screen bg-[#0A0808] pt-24">

      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#DC2626]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">เกี่ยวกับเรา</span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-6 leading-tight whitespace-pre-line">
              {c.hero_headline}
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">{c.hero_desc1}</p>
            <p className="text-slate-400 text-lg leading-relaxed">{c.hero_desc2}</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-[#0A0404]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {c.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display font-bold text-3xl sm:text-4xl text-[#F59E0B]">{stat.value}</div>
                <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story / Timeline */}
      <section className="py-20 bg-[#0A0808]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">เรื่องราวของเรา</span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3 mb-6 whitespace-pre-line">
                {c.story_title}
              </h2>
              <p className="text-slate-400 leading-relaxed mb-5">{c.story_desc1}</p>
              <p className="text-slate-400 leading-relaxed">{c.story_desc2}</p>
            </div>

            <div className="space-y-0">
              {c.milestones.map((m, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/30 flex items-center justify-center shrink-0">
                      <span className="text-[#DC2626] text-xs font-bold">{m.year}</span>
                    </div>
                    {i < c.milestones.length - 1 && (
                      <div className="w-px flex-1 bg-white/5 my-1" />
                    )}
                  </div>
                  <div className={`pb-8 ${i === c.milestones.length - 1 ? "pb-0" : ""}`}>
                    <h3 className="font-semibold text-white text-sm mb-1">{m.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      {c.values.length > 0 && (
        <section className="py-20 bg-[#0A0404]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">สิ่งที่เราเชื่อ</span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3">ค่านิยมของเรา</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {c.values.map((v, i) => {
                const Icon = VALUE_ICONS[i % VALUE_ICONS.length]
                return (
                  <div key={i} className="flex gap-4 bg-[#1C0D0D] border border-white/5 rounded-2xl p-6">
                    <div className="w-11 h-11 bg-[#DC2626]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-[#DC2626]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{v.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{v.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Boutique */}
      <section className="py-20 bg-[#0A0808]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">ทำไมถึงรับแบรนด์จำกัด</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3 mb-6">{c.boutique_title}</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">{c.boutique_desc}</p>
          {c.boutique_items.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {c.boutique_items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle2 size={15} className="text-[#DC2626] shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection lineOaHref={ctaHref} />
    </main>
  )
}
