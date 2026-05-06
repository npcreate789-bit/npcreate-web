"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PortfolioItem } from "@/lib/data/portfolio"
import { categoryLabel } from "@/lib/data/portfolio"

interface Props {
  item: PortfolioItem
  onClose: () => void
  lineHref?: string
}

// Modal left panel: bg_image (16:9 upload) takes priority, fallback to cover_image then gradient
function panelImage(item: PortfolioItem): string | undefined {
  return item.bgImage || item.coverImage || undefined
}

export function PortfolioModal({ item, onClose, lineHref = "/api/auth/line" }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal container — no visible scrollbar */}
      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1C0D0D] rounded-2xl shadow-2xl"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#DC2626] border border-white/20 hover:border-[#DC2626] flex items-center justify-center transition-all shadow-lg"
          aria-label="ปิด"
        >
          <X size={18} className="text-white" strokeWidth={2.5} />
        </button>

        <div className="grid md:grid-cols-2">

          {/* ── Left: visual panel ── */}
          <div
            className={cn(
              "relative min-h-56 md:min-h-full rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden",
              panelImage(item) ? "bg-black" : cn("bg-gradient-to-br", item.gradient)
            )}
          >
            {/* Background image */}
            {panelImage(item) && (
              <div
                className="absolute inset-0 bg-cover bg-top"
                style={{ backgroundImage: `url(${panelImage(item)})` }}
              />
            )}

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Brand watermark (only when no image) */}
            {!panelImage(item) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-display font-black text-[120px] text-white/10 select-none">
                  {item.brand[0]}
                </span>
              </div>
            )}

            {/* Stats overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="bg-black/55 backdrop-blur-md rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_1fr] text-center border-b border-white/10 px-4 py-2">
                  <span className="text-white/50 text-[10px]">ก่อนดูแล</span>
                  <span className="invisible text-[10px] px-3">→</span>
                  <span className="text-[#10B981] text-[10px]">หลังดูแล</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center px-4 py-2.5 border-b border-white/5">
                  <div>
                    <div className="text-white/40 text-[9px] mb-0.5">GMV /6เดือน</div>
                    <div className="text-white font-bold text-base leading-none">{item.stats.gmvBefore}</div>
                  </div>
                  <span className="text-[#F59E0B] font-bold text-lg px-3">→</span>
                  <div>
                    <div className="text-[#10B981] text-[9px] mb-0.5">GMV /6เดือน</div>
                    <div className="font-display font-bold text-[#F59E0B] text-lg leading-none">{item.stats.gmv}</div>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center px-4 py-2.5 border-b border-white/5">
                  <div>
                    <div className="text-white/40 text-[9px] mb-0.5">ROI</div>
                    <div className="text-white/70 font-bold text-base leading-none">{item.stats.roasBefore}</div>
                  </div>
                  <span className="text-[#F59E0B] font-bold text-lg px-3">→</span>
                  <div>
                    <div className="text-white/40 text-[9px] mb-0.5">ROI</div>
                    <div className="font-display font-bold text-[#F59E0B] text-lg leading-none">{item.stats.roas}</div>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center px-4 py-2.5">
                  <div>
                    <div className="text-white/40 text-[9px] mb-0.5">Growth</div>
                    <div className="text-white/70 font-bold text-base leading-none">{item.stats.growthBefore}</div>
                  </div>
                  <span className="text-[#F59E0B] font-bold text-lg px-3">→</span>
                  <div>
                    <div className="text-white/40 text-[9px] mb-0.5">Growth</div>
                    <div className="font-display font-bold text-[#F59E0B] text-lg leading-none">{item.stats.growth}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: info panel ── */}
          <div className="p-5 sm:p-7 flex flex-col gap-4">
            {/* Badge */}
            <div className="flex items-center gap-2 pr-10">
              <span className="text-xs bg-[#DC2626]/20 text-[#FCA5A5] px-2.5 py-1 rounded-full font-medium">
                {categoryLabel[item.category]}
              </span>
            </div>

            <div>
              <h2 className="font-display font-bold text-white text-xl leading-snug mb-2">{item.brand}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-[#0A0808] text-slate-400 px-2.5 py-1 rounded-full border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <a
              href={lineHref}
              className="mt-auto w-full inline-flex items-center justify-center bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              ต้องการผลลัพธ์แบบนี้ — ติดต่อเลย
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
