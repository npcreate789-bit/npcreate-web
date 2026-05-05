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
    <section className="relative bg-[#0A0808] overflow-x-hidden pt-24 pb-10">
      <GradientOrbs />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {promo.visible && promo.text && (
          <div className="inline-flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#FCA5A5] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-[#DC2626] rounded-full animate-pulse" />
            {promo.text}
          </div>
        )}

        <h1 className={cn("font-display font-bold leading-tight mb-6 text-white", SIZE_CLASSES[hero.size])}>
          {hero.line1}
          <br />
          <span style={{ color: hero.line2_color }}>{hero.line2}</span>
          <br />
          {hero.line3}
        </h1>

        {hero.subtext && (
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {hero.subtext}
          </p>
        )}

        {media && media.length > 0 && <HeroMediaGallery items={media} />}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={lineHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05a847] text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-green-900/20"
          >
            {hero.cta1_text}
          </a>
          <Link
            href="/portfolio"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors"
          >
            {hero.cta2_text}
          </Link>
        </div>

        {stats.length > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-2xl sm:text-3xl text-[#F59E0B]">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function GradientOrbs() {
  return (
    <>
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#DC2626]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#DC2626]/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DC2626]/5 rounded-full blur-3xl" />
    </>
  )
}
