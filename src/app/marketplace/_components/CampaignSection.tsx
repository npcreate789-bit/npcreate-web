"use client"

import { useState } from "react"
import { Megaphone, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CampaignWithStore } from "../actions"

const INITIAL_VISIBLE = 5

function getDaysLeft(endsAt: string) {
  return Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000)
}

function urgencyTheme(daysLeft: number) {
  if (daysLeft <= 0)  return { dot: "bg-[#DC2626]", text: "text-[#DC2626]", pill: "bg-[#DC2626]/10 text-[#DC2626]",   label: "หมดวันนี้!" }
  if (daysLeft <= 3)  return { dot: "bg-[#DC2626]", text: "text-[#DC2626]", pill: "bg-[#DC2626]/10 text-[#DC2626]",   label: `เหลือ ${daysLeft} วัน` }
  if (daysLeft <= 7)  return { dot: "bg-[#F59E0B]", text: "text-[#F59E0B]", pill: "bg-[#F59E0B]/10 text-[#F59E0B]",   label: `${daysLeft} วัน` }
  return               { dot: "bg-emerald-500",   text: "text-emerald-400", pill: "bg-emerald-500/10 text-emerald-400", label: `${daysLeft} วัน` }
}

function CampaignRow({ campaign }: { campaign: CampaignWithStore }) {
  const days  = getDaysLeft(campaign.ends_at)
  const theme = urgencyTheme(days)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      {/* Urgency dot */}
      <div className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", theme.dot)} />

      {/* Title + store */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold leading-snug line-clamp-1">
          {campaign.title}
        </p>
        <p className="text-slate-500 text-xs mt-0.5 truncate">{campaign.store.name}</p>
      </div>

      {/* Badges — right side */}
      <div className="flex items-center gap-1.5 shrink-0">
        {campaign.special_commission_rate && (
          <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", theme.pill)}>
            +{campaign.special_commission_rate}%
          </span>
        )}
        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", theme.pill)}>
          {theme.label}
        </span>
      </div>
    </div>
  )
}

export function CampaignSection({ campaigns }: { campaigns: CampaignWithStore[] }) {
  const [showAll, setShowAll] = useState(false)

  if (campaigns.length === 0) return null

  const sorted      = [...campaigns].sort((a, b) => getDaysLeft(a.ends_at) - getDaysLeft(b.ends_at))
  const visible     = showAll ? sorted : sorted.slice(0, INITIAL_VISIBLE)
  const hiddenCount = sorted.length - INITIAL_VISIBLE

  return (
    <section className="bg-[#1C0D0D] border border-white/5 rounded-2xl px-4 py-3">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Megaphone size={13} className="text-[#F59E0B]" />
          <h2 className="text-white font-semibold text-sm">แคมเปญที่กำลังดำเนิน</h2>
        </div>
        <span className="text-[10px] text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">
          {campaigns.length} แคมเปญ
        </span>
      </div>

      {/* List */}
      <div>
        {visible.map(c => <CampaignRow key={c.id} campaign={c} />)}
      </div>

      {/* Show more / less */}
      {campaigns.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 pt-2.5 text-slate-500 hover:text-slate-300 text-xs transition-colors"
        >
          {showAll
            ? <><ChevronUp size={11} /> แสดงน้อยลง</>
            : <><ChevronDown size={11} /> ดูอีก {hiddenCount} แคมเปญ</>}
        </button>
      )}

    </section>
  )
}
