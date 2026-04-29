"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { portfolioItems, categoryOptions, categoryLabel } from "@/lib/data/portfolio"
import type { PortfolioCategory, PortfolioMediaType, PortfolioItem } from "@/lib/data/portfolio"
import { PortfolioModal } from "./PortfolioModal"

export function PortfolioGrid() {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>("all")
  const [activeType, setActiveType] = useState<PortfolioMediaType>("all")
  const [selected, setSelected] = useState<PortfolioItem | null>(null)

  const filtered = portfolioItems.filter((item) => {
    const matchCat = activeCategory === "all" || item.category === activeCategory
    const matchType = activeType === "all" || item.type === activeType
    return matchCat && matchType
  })

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveCategory(opt.value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeCategory === opt.value
                  ? "bg-[#6366F1] text-white shadow-lg shadow-indigo-900/30"
                  : "bg-[#1E293B] text-slate-400 hover:text-white hover:bg-[#273549]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#1E293B] p-1 rounded-lg shrink-0">
          {(["all", "image", "video"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                activeType === type ? "bg-[#0F172A] text-white" : "text-slate-400 hover:text-white"
              )}
            >
              {type === "all" ? "ทั้งหมด" : type === "image" ? "รูปภาพ" : "วิดีโอ"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-slate-500 text-sm mb-8">{filtered.length} ผลงาน</p>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-slate-500">ไม่พบผลงานในหมวดหมู่นี้</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((item) => (
            <PortfolioCard key={item.id} item={item} onClick={() => setSelected(item)} />
          ))}
        </div>
      )}

      {selected && <PortfolioModal item={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function PortfolioCard({ item, onClick }: { item: PortfolioItem; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105", item.gradient)} />

      {/* Brand initial watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-display font-black text-[80px] text-white/10 select-none leading-none">
          {item.brand[0]}
        </span>
      </div>

      {/* Play button */}
      {item.type === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Play className="text-white fill-white ml-0.5" size={20} />
          </div>
        </div>
      )}

      {/* Type badge */}
      <div className="absolute top-3 right-3">
        <span className="text-[11px] bg-black/40 backdrop-blur-sm text-white/90 px-2.5 py-1 rounded-full font-medium">
          {item.type === "video" ? "วิดีโอ" : "รูปภาพ"}
        </span>
      </div>

      {/* Bottom label — always visible */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent translate-y-0 group-hover:translate-y-full transition-transform duration-300">
        <p className="font-display font-semibold text-white text-sm leading-tight">{item.brand}</p>
        <p className="text-white/50 text-xs mt-0.5">{categoryLabel[item.category]}</p>
      </div>

      {/* Hover stats overlay — slides up from bottom */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-center p-5">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "GMV", value: item.stats.gmv },
            { label: "ROAS", value: item.stats.roas },
            { label: "Growth", value: item.stats.growth },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-[#F59E0B] font-display font-bold text-base sm:text-xl leading-none mb-1">
                {stat.value}
              </div>
              <div className="text-white/40 text-[10px]">{stat.label}</div>
            </div>
          ))}
        </div>

        <p className="text-white/70 text-xs leading-relaxed line-clamp-3 mb-3">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <span className="text-[#818CF8] text-xs font-medium text-center">
          คลิกเพื่อดูเพิ่มเติม →
        </span>
      </div>
    </div>
  )
}
