import Link from "next/link"
import { cn } from "@/lib/utils"
import type { HomepageSettings } from "@/lib/data/homepage"
import type { HeroMedia } from "@/types/database"
import { HeroMediaGallery } from "@/components/public/HeroMediaGallery"

// Must be literals for Tailwind JIT
const SIZE_CLASSES = {
  sm: "text-3xl sm:text-4xl lg:text-5xl",
  md: "text-4xl sm:text-5xl lg:text-6xl",
  lg: "text-5xl sm:text-6xl lg:text-7xl",
  xl: "text-6xl sm:text-7xl lg:text-8xl",
}

interface Props {
  settings: HomepageSettings
  media?: HeroMedia[]
  lineHref?: string
}

export function HeroSection({ settings, media, lineHref = "/api/auth/line" }: Props) {
  const { promo, hero, stats } = settings

  return (
    <section className="relative flex items-center justify-center bg-[#0A0808] overflow-x-hidden pt-24 pb-14">
      <GradientOrbs />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">

        {/* 1 — Promo badge (ก่อน heading เพื่อ attention) */}
        {promo.visible && promo.text && (
          <div className="inline-flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#FCA5A5] text-sm font-medium px-4 py-1.5 rounded-full mb-7">
            <span className="w-2 h-2 bg-[#DC2626] rounded-full animate-pulse shrink-0" />
            {promo.text}
          </div>
        )}

        {/* 2 — H1 */}
        <h1
          className={cn(
            "font-display font-bold text-white mb-6 leading-[1.15] tracking-tight",
            SIZE_CLASSES[hero.size]
          )}
        >
          {hero.line1}
          <span className="block" style={{ color: hero.line2_color }}>
            {hero.line2}
          </span>
          <span className="block">{hero.line3}</span>
        </h1>

        {/* 3 — Subtext */}
        {hero.subtext && (
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            {hero.subtext}
          </p>
        )}

        {/* 4 — CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <a
            href={lineHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05a847] text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-green-900/20 hover:shadow-green-900/40 hover:scale-[1.02]"
          >
            <LineIcon />
            {hero.cta1_text}
          </a>
          <Link
            href="/portfolio"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.07] text-slate-200 hover:text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all duration-200"
          >
            {hero.cta2_text}
            <span className="text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all duration-200 inline-block">
              →
            </span>
          </Link>
        </div>

        {/* 5 — Stats row */}
        {stats.length > 0 && (
          <div className="inline-flex flex-wrap items-center justify-center mb-10">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center">
                <div className="px-5 sm:px-8 py-1 text-center">
                  <div className="font-display font-bold text-2xl sm:text-3xl text-[#F59E0B]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                    {stat.label}
                  </div>
                </div>
                {i < stats.length - 1 && (
                  <div className="w-px h-9 bg-white/10 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 6 — รูป/วิดีโอ (showcase ล่าง) */}
        {media && media.length > 0 && <HeroMediaGallery items={media} />}
      </div>
    </section>
  )
}

function GradientOrbs() {
  return (
    <>
      <div className="absolute top-1/3 -left-40 w-[520px] h-[520px] bg-[#DC2626]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-[#DC2626]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#DC2626]/5 rounded-full blur-3xl pointer-events-none" />
    </>
  )
}

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}
