import type { PromoBanner } from "@/types/database"

interface Props {
  banners: PromoBanner[]
}

export function PromoBannersSection({ banners }: Props) {
  if (banners.length === 0) return null

  return (
    <section className="pt-4 pb-12 bg-[#0A0808]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        {banners.map((banner) => (
          <BannerCard key={banner.id} banner={banner} />
        ))}
      </div>
    </section>
  )
}

function BannerCard({ banner }: { banner: PromoBanner }) {
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-black/30">
      {/* Heading */}
      <div className="px-6 sm:px-8 pt-7 pb-5">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
          {banner.heading}
        </h2>
      </div>

      {/* Banner image */}
      {banner.banner_url && (
        <div className="w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.banner_url}
            alt={banner.heading}
            className="w-full h-auto block"
          />
        </div>
      )}

      {/* Detail + price + button */}
      <div className="px-6 sm:px-8 py-6 space-y-5">
        {banner.detail && (
          <p className="text-slate-400 text-base leading-relaxed whitespace-pre-line">
            {banner.detail}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
          {/* Price */}
          {banner.price_text && (
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-3xl sm:text-4xl text-[#F59E0B]">
                {banner.price_text}
              </span>
            </div>
          )}

          {/* Contact button */}
          <a
            href={banner.contact_url}
            className="inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-red-900/20 shrink-0"
          >
            {banner.contact_text}
          </a>
        </div>
      </div>
    </div>
  )
}
