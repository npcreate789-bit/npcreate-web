"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HeroMedia } from "@/types/database"

interface Props {
  items: HeroMedia[]
}

export function HeroMediaGallery({ items }: Props) {
  const [index, setIndex] = useState(0)

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + items.length) % items.length),
    [items.length],
  )

  // Auto-advance images only; pause when current item is a video
  useEffect(() => {
    if (items.length <= 1) return
    if (items[index]?.type === "video") return
    const t = setInterval(() => go(1), 4000)
    return () => clearInterval(t)
  }, [index, items, go])

  if (items.length === 0) return null

  return (
    <div className="flex flex-col items-center gap-3 mb-10">
      <div className="flex items-center gap-3">
        {items.length > 1 && (
          <button
            onClick={() => go(-1)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
          >
            <ChevronLeft size={16} className="text-white" />
          </button>
        )}

        {/* Slide track */}
        <div
          className="relative w-[min(240px,calc(100vw-7.5rem))] sm:w-[300px] md:w-[340px] overflow-hidden rounded-2xl"
          style={{ aspectRatio: "9/16" }}
        >
          <div
            className="absolute inset-y-0 left-0 flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${items.length * 100}%`,
              transform: `translateX(-${index * (100 / items.length)}%)`,
            }}
          >
            {items.map((item, i) =>
              item.type === "image" ? (
                <ImageCard key={item.id} item={item} totalItems={items.length} />
              ) : (
                <VideoCard key={item.id} item={item} totalItems={items.length} isActive={i === index} />
              ),
            )}
          </div>
        </div>

        {items.length > 1 && (
          <button
            onClick={() => go(1)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
          >
            <ChevronRight size={16} className="text-white" />
          </button>
        )}
      </div>

      {/* Dots */}
      {items.length > 1 && (
        <div className="flex gap-1.5 items-center">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === index ? "w-4 h-1.5 bg-[#DC2626]" : "w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ImageCard({ item, totalItems }: { item: HeroMedia; totalItems: number }) {
  return (
    <div className="relative h-full" style={{ width: `${100 / totalItems}%` }}>
      {/* Gradient border */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#DC2626]/60 via-rose-500/30 to-[#DC2626]/10 p-[2px] rounded-2xl">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.media_url}
            alt={item.caption ?? ""}
            className="w-full h-full object-cover"
          />
          {item.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-3 px-3">
              <p className="text-[#F59E0B] text-[10px] font-bold leading-tight text-center">
                {item.caption}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VideoCard({
  item,
  totalItems,
  isActive,
}: {
  item: HeroMedia
  totalItems: number
  isActive: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  // Play/pause based on whether this slide is active
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      v.play().catch(() => null)
    } else {
      v.pause()
    }
  }, [isActive])

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <div className="relative h-full" style={{ width: `${100 / totalItems}%` }}>
      {/* Phone frame */}
      <div className="absolute inset-0 rounded-[22px] border-[3px] border-slate-600 bg-black overflow-hidden shadow-xl shadow-black/50">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-slate-700 rounded-full z-10" />

        <video
          ref={videoRef}
          src={item.media_url}
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Sound toggle */}
        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-2 z-10 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
        >
          {muted ? (
            <VolumeX size={13} className="text-white" />
          ) : (
            <Volume2 size={13} className="text-white" />
          )}
        </button>

        {item.caption && (
          <div className="absolute bottom-3 left-2 right-10 z-10">
            <p className="text-[#F59E0B] text-[9px] font-bold text-center leading-tight bg-black/60 rounded-full px-2 py-0.5">
              {item.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
