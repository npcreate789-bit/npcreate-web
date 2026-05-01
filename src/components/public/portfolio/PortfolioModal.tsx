"use client"

import { useEffect } from "react"
import { X, BarChart2, Zap, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PortfolioItem } from "@/lib/data/portfolio"
import { categoryLabel } from "@/lib/data/portfolio"

interface Props {
  item: PortfolioItem
  onClose: () => void
  lineHref?: string
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1C0D0D] rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="ปิด"
        >
          <X size={15} className="text-white" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Left — visual panel */}
          <div
            className={cn(
              "relative min-h-64 md:min-h-full rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden",
              "bg-gradient-to-br",
              item.gradient
            )}
          >
            {/* Brand watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-display font-black text-[120px] text-white/10 select-none">
                {item.brand[0]}
              </span>
            </div>

            {/* Stats grid over visual */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { Icon: BarChart2, label: "GMV", value: item.stats.gmv },
                  { Icon: Zap, label: "ROI", value: item.stats.roas },
                  { Icon: TrendingUp, label: "Growth", value: item.stats.growth },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="bg-black/30 backdrop-blur-sm rounded-xl p-3 text-center">
                    <Icon size={13} className="text-[#F59E0B] mx-auto mb-1" />
                    <div className="font-display font-bold text-[#F59E0B] text-xl leading-none">
                      {value}
                    </div>
                    <div className="text-white/50 text-[10px] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — info panel */}
          <div className="p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-[#DC2626]/20 text-[#FCA5A5] px-2.5 py-1 rounded-full font-medium">
                {categoryLabel[item.category]}
              </span>
              <span className="text-xs bg-white/5 text-slate-400 px-2.5 py-1 rounded-full">
                {item.tiktokId ? "TikTok" : item.type === "video" ? "วิดีโอ" : "รูปภาพ"}
              </span>
            </div>

            <h2 className="font-display font-bold text-white text-2xl mb-3">{item.brand}</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">{item.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-[#0A0808] text-slate-400 px-3 py-1 rounded-full border border-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* YouTube embed */}
            {item.type === "video" && item.videoId && (
              <div className="rounded-xl overflow-hidden aspect-video bg-black mb-6">
                <iframe
                  src={`https://www.youtube.com/embed/${item.videoId}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${item.brand} — portfolio video`}
                />
              </div>
            )}

            {/* TikTok embed */}
            {item.tiktokId && (
              <div className="rounded-xl overflow-hidden bg-black mb-6 flex justify-center" style={{ minHeight: 560 }}>
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${item.tiktokId}`}
                  className="w-full"
                  style={{ minHeight: 560 }}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={`${item.brand} — TikTok`}
                />
              </div>
            )}

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
