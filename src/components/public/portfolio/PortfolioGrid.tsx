"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { categoryOptions, categoryLabel } from "@/lib/data/portfolio"
import type { PortfolioCategory, PortfolioItem } from "@/lib/data/portfolio"
import type { Portfolio } from "@/types/database"
import { PortfolioModal } from "./PortfolioModal"

function fmtGMV(val: number | null): string {
  if (!val) return "—"
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${Math.round(val / 1_000)}K`
  return val.toLocaleString()
}

function toItem(p: Portfolio): PortfolioItem {
  return {
    id:          p.id,
    brand:       p.client_name || p.title,
    category:    (p.industry ?? "other") as Exclude<PortfolioCategory, "all">,
    gradient:    p.gradient ?? "from-red-800 via-rose-700 to-red-600",
    stats: {
      gmv:          fmtGMV(p.gmv_after),
      gmvBefore:    fmtGMV(p.gmv_before),
      roas:         p.roas             ? `${p.roas}x`              : "—",
      roasBefore:   p.roas_before      ? `${p.roas_before}x`       : "—",
      growth:       p.gmv_growth_pct   ? `+${p.gmv_growth_pct}%`   : "—",
      growthBefore: p.growth_pct_before ? `+${p.growth_pct_before}%` : "—",
    },
    description: p.short_desc ?? "",
    tags:        p.service_type ?? [],
    coverImage:  p.cover_image || undefined,
    bgImage:     p.bg_image || undefined,
  }
}

interface Props {
  portfolios: Portfolio[]
  lineHref?: string
}

export function PortfolioGrid({ portfolios, lineHref = "/api/auth/line" }: Props) {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>("all")
  const [selected, setSelected] = useState<PortfolioItem | null>(null)

  const items = portfolios.map(toItem)

  const filtered = items.filter((item) =>
    activeCategory === "all" || item.category === activeCategory
  )

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categoryOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveCategory(opt.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              activeCategory === opt.value
                ? "bg-[#DC2626] text-white shadow-lg shadow-red-900/30"
                : "bg-[#1C0D0D] text-slate-400 hover:text-white hover:bg-[#1C0D0D]/80"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-slate-500 text-base">ยังไม่มีผลงาน</p>
          <p className="text-slate-600 text-sm mt-2">ติดต่อเราเพื่อเริ่มต้นสร้างยอดขาย</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          ไม่พบผลงานในหมวดหมู่นี้
        </div>
      ) : (
        <>
          <p className="text-slate-500 text-sm mb-8">{filtered.length} ผลงาน</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((item) => (
              <PortfolioCard key={item.id} item={item} onClick={() => setSelected(item)} />
            ))}
          </div>
        </>
      )}

      {selected && <PortfolioModal item={selected} onClose={() => setSelected(null)} lineHref={lineHref} />}
    </>
  )
}

function PortfolioCard({ item, onClick }: { item: PortfolioItem; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Background: cover image > bg image > gradient */}
      {item.coverImage || item.bgImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${item.coverImage ?? item.bgImage})` }}
        />
      ) : (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105",
          item.gradient
        )} />
      )}

      {/* Brand initial watermark (when no image) */}
      {!item.coverImage && !item.bgImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-display font-black text-[80px] text-white/10 select-none leading-none">
            {item.brand[0]}
          </span>
        </div>
      )}

      {/* Default bottom label — slides out on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent translate-y-0 group-hover:translate-y-full transition-transform duration-300">
        <p className="font-display font-semibold text-white text-sm leading-tight">{item.brand}</p>
        <p className="text-white/50 text-xs mt-0.5">{categoryLabel[item.category] ?? item.category}</p>
      </div>

      {/* Hover overlay — slides up on hover */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-center p-5">
        {/* Before → After comparison table */}
        <div className="bg-white/5 rounded-xl overflow-hidden mb-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_1fr] text-center border-b border-white/5 px-3 py-1.5">
            <span className="text-white/40 text-[9px]">ก่อนดูแล</span>
            <span className="invisible text-[9px] px-2">→</span>
            <span className="text-[#10B981] text-[9px]">หลังดูแล</span>
          </div>
          {/* GMV row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center px-3 py-2 border-b border-white/5">
            <div>
              <div className="text-white/30 text-[8px] leading-none mb-0.5">GMV</div>
              <div className="text-white/70 font-bold text-sm leading-none">{item.stats.gmvBefore}</div>
            </div>
            <span className="text-[#F59E0B] font-bold text-sm px-2">→</span>
            <div>
              <div className="text-white/30 text-[8px] leading-none mb-0.5">GMV</div>
              <div className="text-[#F59E0B] font-display font-bold text-sm leading-none">{item.stats.gmv}</div>
            </div>
          </div>
          {/* ROI row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center px-3 py-2 border-b border-white/5">
            <div>
              <div className="text-white/30 text-[8px] leading-none mb-0.5">ROI</div>
              <div className="text-white/60 font-bold text-sm leading-none">{item.stats.roasBefore}</div>
            </div>
            <span className="text-[#F59E0B] font-bold text-sm px-2">→</span>
            <div>
              <div className="text-white/30 text-[8px] leading-none mb-0.5">ROI</div>
              <div className="text-[#F59E0B] font-display font-bold text-sm leading-none">{item.stats.roas}</div>
            </div>
          </div>
          {/* Growth row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center px-3 py-2">
            <div>
              <div className="text-white/30 text-[8px] leading-none mb-0.5">Growth</div>
              <div className="text-white/60 font-bold text-sm leading-none">{item.stats.growthBefore}</div>
            </div>
            <span className="text-[#F59E0B] font-bold text-sm px-2">→</span>
            <div>
              <div className="text-white/30 text-[8px] leading-none mb-0.5">Growth</div>
              <div className="text-[#F59E0B] font-display font-bold text-sm leading-none">{item.stats.growth}</div>
            </div>
          </div>
        </div>

        <p className="text-white font-semibold text-sm mb-0.5">{item.brand}</p>
        {item.category && (
          <p className="text-white/50 text-xs mb-2">{categoryLabel[item.category] ?? item.category}</p>
        )}
        <p className="text-white/70 text-xs leading-relaxed line-clamp-3 mb-3">{item.description}</p>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <span className="text-[#FCA5A5] text-xs font-medium text-center">
          คลิกเพื่อดูเพิ่มเติม →
        </span>
      </div>
    </div>
  )
}
