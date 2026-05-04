"use client"

import { useState } from "react"
import { Megaphone, Clock, Flame, ChevronDown, ChevronUp, Zap, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CampaignWithStore } from "../actions"

const INITIAL_VISIBLE = 4

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysLeft(endsAt: string) {
  return Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000)
}

function getProgress(startsAt: string, endsAt: string) {
  const total   = new Date(endsAt).getTime() - new Date(startsAt).getTime()
  const elapsed = Date.now() - new Date(startsAt).getTime()
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

function urgencyTheme(daysLeft: number) {
  if (daysLeft <= 3) return { bar: "bg-[#DC2626]", text: "text-[#DC2626]", border: "border-[#DC2626]/25", bg: "bg-[#DC2626]/5" }
  if (daysLeft <= 7) return { bar: "bg-[#F59E0B]", text: "text-[#F59E0B]", border: "border-[#F59E0B]/25", bg: "bg-[#F59E0B]/5" }
  return              { bar: "bg-emerald-500",   text: "text-emerald-400", border: "border-white/8",        bg: "bg-white/[0.03]" }
}

function daysLabel(daysLeft: number) {
  if (daysLeft <= 0) return "หมดวันนี้!"
  if (daysLeft === 1) return "เหลือ 1 วัน!"
  return `${daysLeft} วัน`
}

// ─── Urgent strip card ────────────────────────────────────────────────────────

function UrgentCard({ campaign }: { campaign: CampaignWithStore }) {
  const days = getDaysLeft(campaign.ends_at)
  return (
    <div className="shrink-0 flex items-center gap-3 bg-[#DC2626]/8 border border-[#DC2626]/25 rounded-xl px-3.5 py-2.5 w-[240px]">
      <div className="w-7 h-7 rounded-lg bg-[#DC2626]/15 flex items-center justify-center shrink-0">
        <Zap size={13} className="text-[#DC2626]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white text-xs font-semibold line-clamp-1">{campaign.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-slate-500 text-[10px] truncate">{campaign.store.name}</span>
          <span className="text-[#DC2626] text-[10px] font-bold shrink-0">{daysLabel(days)}</span>
        </div>
      </div>
      {campaign.special_commission_rate && (
        <span className="shrink-0 text-[10px] font-bold text-[#DC2626] bg-[#DC2626]/10 px-1.5 py-0.5 rounded-md">
          +{campaign.special_commission_rate}%
        </span>
      )}
    </div>
  )
}

// ─── Main grid card ───────────────────────────────────────────────────────────

function CampaignCard({ campaign }: { campaign: CampaignWithStore }) {
  const days         = getDaysLeft(campaign.ends_at)
  const progress     = getProgress(campaign.starts_at, campaign.ends_at)
  const theme        = urgencyTheme(days)
  const productCount = campaign.product_ids?.length ?? 0
  const label        = daysLabel(days)

  return (
    <div className={cn("rounded-2xl border overflow-hidden flex flex-col", theme.bg, theme.border)}>
      {/* Progress bar — elapsed time */}
      <div className="w-full h-1 bg-white/8">
        <div className={cn("h-full", theme.bar)} style={{ width: `${progress}%` }} />
      </div>

      {/* Banner image or placeholder */}
      {campaign.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={campaign.banner_url} alt={campaign.title} className="w-full h-20 object-cover" />
      ) : (
        <div className="w-full h-20 flex items-center justify-center">
          <Megaphone size={22} className="text-white/10" />
        </div>
      )}

      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Title + store */}
        <div>
          <p className="text-white font-semibold text-xs leading-snug line-clamp-2">{campaign.title}</p>
          <p className="text-slate-500 text-[10px] mt-0.5 truncate">{campaign.store.name}</p>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
            {campaign.special_commission_rate && (
              <span className={cn("text-xs font-bold", theme.text)}>
                +{campaign.special_commission_rate}% คอม
              </span>
            )}
            {productCount > 0 && (
              <span className="text-slate-600 text-[10px] flex items-center gap-0.5">
                {campaign.special_commission_rate && <span className="mx-0.5 opacity-40">·</span>}
                <Package size={9} /> {productCount}
              </span>
            )}
          </div>
          <span className={cn("text-[10px] font-medium flex items-center gap-0.5 shrink-0", theme.text)}>
            <Clock size={9} /> {label}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function CampaignSection({ campaigns }: { campaigns: CampaignWithStore[] }) {
  const [showAll, setShowAll] = useState(false)

  if (campaigns.length === 0) return null

  const urgent        = campaigns.filter(c => getDaysLeft(c.ends_at) <= 3)
  const visible       = showAll ? campaigns : campaigns.slice(0, INITIAL_VISIBLE)
  const hiddenCount   = campaigns.length - INITIAL_VISIBLE

  return (
    <section className="space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Megaphone size={14} className="text-[#F59E0B]" />
        <h2 className="text-white font-semibold text-sm">แคมเปญที่กำลังดำเนิน</h2>
        <span className="text-[10px] text-slate-600 font-normal bg-white/5 px-1.5 py-0.5 rounded-md">
          {campaigns.length}
        </span>
      </div>

      {/* Urgent strip */}
      {urgent.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Flame size={11} className="text-[#DC2626]" />
            <span className="text-[#DC2626] text-[10px] font-semibold uppercase tracking-wider">
              ใกล้หมดแล้ว — {urgent.length} แคมเปญ
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-hide">
            {urgent.map(c => <UrgentCard key={c.id} campaign={c} />)}
          </div>
        </div>
      )}

      {/* All campaigns grid (2 col) */}
      <div className="grid grid-cols-2 gap-3">
        {visible.map(c => <CampaignCard key={c.id} campaign={c} />)}
      </div>

      {/* Show more / less */}
      {campaigns.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-white/8 hover:border-white/15 rounded-xl text-slate-500 hover:text-slate-300 text-xs transition-colors"
        >
          {showAll
            ? <><ChevronUp size={12} /> แสดงน้อยลง</>
            : <><ChevronDown size={12} /> ดูเพิ่มเติม {hiddenCount} แคมเปญ</>
          }
        </button>
      )}

    </section>
  )
}
