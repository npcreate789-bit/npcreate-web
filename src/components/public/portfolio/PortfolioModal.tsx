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

  const isTikTok  = !!item.tiktokId
  const isYouTube = item.type === "video" && !!item.videoId

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal — hidden scrollbar so mobile can still scroll */}
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

          {/* ── LEFT PANEL ── */}
          {isTikTok ? (
            /* TikTok: iframe fills the entire left panel — natural clip, no hacks */
            <div className="relative min-h-[360px] md:min-h-full rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden bg-black">
              <iframe
                src={`https://www.tiktok.com/embed/v2/${item.tiktokId}`}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={`${item.brand} — TikTok`}
              />
            </div>
          ) : (
            /* Image / YouTube: bg image or gradient + stats overlay */
            <div
              className={cn(
                "relative min-h-56 md:min-h-full rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden",
                panelImage(item) ? "bg-black" : cn("bg-gradient-to-br", item.gradient)
              )}
            >
              {panelImage(item) && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${panelImage(item)})` }}
                />
              )}
              {/* readability overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

              {!panelImage(item) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="font-display font-black text-[120px] text-white/10 select-none">
                    {item.brand[0]}
                  </span>
                </div>
              )}

              {/* Stats overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <StatsTable item={item} />
              </div>
            </div>
          )}

          {/* ── RIGHT PANEL ── */}
          <div className="p-5 sm:p-6 flex flex-col gap-3">

            {/* Badges */}
            <div className="flex items-center gap-2 pr-10">
              <span className="text-xs bg-[#DC2626]/20 text-[#FCA5A5] px-2.5 py-1 rounded-full font-medium">
                {categoryLabel[item.category]}
              </span>
              <span className="text-xs bg-white/5 text-slate-400 px-2.5 py-1 rounded-full">
                {isTikTok ? "TikTok" : isYouTube ? "วิดีโอ" : "รูปภาพ"}
              </span>
            </div>

            {/* Brand + description */}
            <div>
              <h2 className="font-display font-bold text-white text-xl leading-snug mb-1.5">
                {item.brand}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-[#0A0808] text-slate-400 px-2.5 py-1 rounded-full border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats inside right panel for TikTok (no stats on left) */}
            {isTikTok && <StatsTable item={item} compact />}

            {/* YouTube embed — 16:9, clean */}
            {isYouTube && (
              <div className="rounded-xl overflow-hidden aspect-video bg-black ring-1 ring-white/10">
                <iframe
                  src={`https://www.youtube.com/embed/${item.videoId}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${item.brand} — YouTube`}
                />
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

// ── Reusable stats comparison table ────────────────────────────────────────────

function StatsTable({ item, compact }: { item: PortfolioItem; compact?: boolean }) {
  const rows = [
    { label: "GMV /6เดือน", before: item.stats.gmvBefore, after: item.stats.gmv,          gmvStyle: true },
    { label: "ROI",          before: item.stats.roasBefore, after: item.stats.roas,          gmvStyle: false },
    { label: "Growth",       before: item.stats.growthBefore, after: item.stats.growth,      gmvStyle: false },
  ]

  return (
    <div className={cn(
      "rounded-xl overflow-hidden",
      compact
        ? "bg-white/5 ring-1 ring-white/5"
        : "bg-black/55 backdrop-blur-md"
    )}>
      {/* Header */}
      <div className={cn(
        "grid grid-cols-[1fr_auto_1fr] text-center border-b border-white/10",
        compact ? "px-3 py-1.5" : "px-4 py-2"
      )}>
        <span className="text-white/50 text-[10px]">ก่อนดูแล</span>
        <span className="invisible text-[10px] px-3">→</span>
        <span className="text-[#10B981] text-[10px]">หลังดูแล</span>
      </div>

      {rows.map((row, i) => (
        <div
          key={row.label}
          className={cn(
            "grid grid-cols-[1fr_auto_1fr] items-center text-center",
            compact ? "px-3 py-2" : "px-4 py-2.5",
            i < rows.length - 1 && "border-b border-white/5"
          )}
        >
          <div>
            <div className="text-white/40 text-[9px] mb-0.5">{row.label}</div>
            <div className={cn("text-white/70 font-bold leading-none", compact ? "text-sm" : "text-base")}>
              {row.before}
            </div>
          </div>
          <span className="text-[#F59E0B] font-bold text-lg px-3">→</span>
          <div>
            <div className={cn("text-[9px] mb-0.5", row.gmvStyle ? "text-[#10B981]" : "text-white/40")}>
              {row.label}
            </div>
            <div className={cn("font-display font-bold text-[#F59E0B] leading-none", compact ? "text-base" : "text-lg")}>
              {row.after}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
