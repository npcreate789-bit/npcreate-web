import { CheckCircle2, Zap, Eye, Users, Calendar } from "lucide-react"
import type { HomepageSettings } from "@/lib/data/homepage"

const REASON_ICONS = [Zap, Eye, Users, Calendar]

interface Props {
  settings: HomepageSettings["why_us"]
  lineHref?: string
}

export function WhyUsSection({ settings, lineHref = "/api/auth/line" }: Props) {
  return (
    <section className="pt-4 pb-14 bg-[#0A0404]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Section Header — full width centered */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-[#DC2626]/50" />
            <span className="text-[#DC2626] text-xs font-bold uppercase tracking-[0.2em]">
              {settings.badge}
            </span>
            <div className="h-px w-8 bg-[#DC2626]/50" />
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white leading-tight">
            {settings.heading}
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            {settings.subtext}
          </p>
        </div>

        {/* Reasons grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {settings.reasons.map((reason, i) => {
            const Icon = REASON_ICONS[i] ?? CheckCircle2
            return (
              <div
                key={reason.title}
                className="group relative bg-[#120808] border border-white/5 hover:border-[#DC2626]/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#DC2626]/5 overflow-hidden"
              >
                {/* Gradient top accent */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#DC2626]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-[#DC2626]/10 group-hover:bg-[#DC2626]/20 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                    <Icon size={18} className="text-[#DC2626]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base mb-1.5 leading-snug">
                      {reason.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA centered */}
        <div className="text-center">
          <a
            href={lineHref}
            className="inline-flex items-center gap-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-red-900/20 text-base"
          >
            <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
            {settings.cta_text}
          </a>
          <p className="text-slate-600 text-xs mt-3">ฟรี ไม่มีค่าใช้จ่าย · ตอบกลับภายใน 1 ชั่วโมง</p>
        </div>

      </div>
    </section>
  )
}
