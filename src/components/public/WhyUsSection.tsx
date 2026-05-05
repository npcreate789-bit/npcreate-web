import { CheckCircle2 } from "lucide-react"
import type { HomepageSettings } from "@/lib/data/homepage"

interface Props {
  settings: HomepageSettings["why_us"]
  lineHref?: string
}

export function WhyUsSection({ settings, lineHref = "/api/auth/line" }: Props) {
  return (
    <section className="py-14 bg-[#0A0404]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">
              {settings.badge}
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3 mb-6">
              {settings.heading}
            </h2>
            <p className="text-slate-400 leading-relaxed">{settings.subtext}</p>

            <a
              href={lineHref}
              className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold px-6 py-3 rounded-xl mt-8 transition-colors"
            >
              {settings.cta_text}
            </a>
          </div>

          <div className="space-y-5">
            {settings.reasons.map((reason) => (
              <div
                key={reason.title}
                className="flex gap-4 bg-[#1C0D0D]/50 border border-white/5 rounded-xl p-5"
              >
                <CheckCircle2 size={22} className="text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">{reason.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
