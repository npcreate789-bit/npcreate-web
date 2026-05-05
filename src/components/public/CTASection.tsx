import { Sparkles, Clock, Shield, CheckCircle } from "lucide-react"
import { DEFAULT_HOMEPAGE, type HomepageSettings } from "@/lib/data/homepage"

interface Props {
  settings?: HomepageSettings["cta_section"]
  lineOaHref?: string
}

const TRUST_BADGES = [
  { icon: CheckCircle, text: "ปรึกษาฟรี" },
  { icon: Clock,       text: "ตอบใน 1 ชม." },
  { icon: Shield,      text: "ไม่ผูกมัด" },
]

export function CTASection({ settings = DEFAULT_HOMEPAGE.cta_section, lineOaHref = "/api/auth/line" }: Props) {
  return (
    <section className="pt-4 pb-16 bg-[#0A0808]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#DC2626]/30 bg-gradient-to-br from-[#1C0808] via-[#150505] to-[#0A0808]">

          {/* Background glow blobs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#DC2626]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#DC2626]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#DC2626]/70 to-transparent" />

          <div className="relative z-10 px-8 py-12 sm:px-14 sm:py-16 text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={12} />
              เริ่มต้นวันนี้
            </div>

            {/* Heading */}
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight">
              {settings.heading}
            </h2>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[#DC2626] leading-tight mt-1 mb-5">
              {settings.heading_highlight}
            </h2>

            {/* Subtext */}
            <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
              {settings.subtext}
            </p>

            {/* CTA Button — with glow ring */}
            <div className="relative inline-block mb-3">
              <div className="absolute -inset-1 bg-[#DC2626]/25 rounded-2xl blur-md" />
              <a
                href={lineOaHref}
                className="relative inline-flex items-center justify-center gap-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-lg px-10 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-red-900/30 hover:shadow-red-900/50 hover:scale-[1.03]"
              >
                <LineIcon />
                {settings.cta_text}
              </a>
            </div>

            {/* Footer note */}
            <p className="text-slate-600 text-sm mt-4 mb-8">{settings.footer_text}</p>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-5 sm:gap-8 pt-6 border-t border-white/5">
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Icon size={13} className="text-[#DC2626]/60 shrink-0" />
                  {text}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

function LineIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}
