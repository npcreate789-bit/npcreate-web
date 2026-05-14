import Link from "next/link"
import { CheckCircle2, Circle, ChevronRight, Sparkles, AlertCircle } from "lucide-react"
import type { OnboardingStatus } from "@/lib/onboarding"
import { cn } from "@/lib/utils"

const itemAccent: Record<string, { icon: string; iconBg: string; border: string }> = {
  line:   { icon: "text-[#06C755]", iconBg: "bg-[#06C755]/10", border: "hover:border-[#06C755]/40" },
  tiktok: { icon: "text-white",     iconBg: "bg-white/5",      border: "hover:border-white/20" },
}

export function OnboardingCard({ status }: { status: OnboardingStatus }) {
  if (status.isComplete || status.totalCount === 0) return null

  const isAlmostDone = status.completedCount > 0 && status.completedCount === status.totalCount - 1

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#F59E0B]/25 bg-gradient-to-br from-[#F59E0B]/10 via-[#1C0D0D] to-[#1C0D0D]">
      <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#F59E0B]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 w-36 h-36 rounded-full bg-[#DC2626]/10 blur-3xl" />

      <div className="relative p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/25 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-[#F59E0B]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-white text-base leading-tight">
              {isAlmostDone ? "อีกขั้นเดียวก็เริ่มใช้งานได้เต็มที่!" : "เปิดใช้งานบัญชีของคุณให้ครบ"}
            </h2>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              ตั้งค่าให้ครบเพื่อเริ่มดึงสินค้า/รับ Affiliate และให้ทีมงานติดต่อคุณได้
            </p>
          </div>
          <span className="shrink-0 text-[#F59E0B] font-bold text-sm tabular-nums">
            {status.completedCount}/{status.totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FCD34D] rounded-full transition-all duration-500"
            style={{ width: `${status.progressPct}%` }}
          />
        </div>

        {/* Items */}
        <div className="space-y-2">
          {status.items.map(item => {
            const accent = itemAccent[item.key] ?? itemAccent.tiktok

            if (item.done) {
              return (
                <div
                  key={item.key}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15"
                >
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-emerald-300 text-sm font-medium leading-tight">{item.label}</p>
                    <p className="text-emerald-400/60 text-[11px] mt-0.5">เสร็จแล้ว</p>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 transition-colors",
                  accent.border
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", accent.iconBg)}>
                  <Circle size={14} className={cn("transition-colors", accent.icon)} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold leading-tight">{item.label}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">{item.description}</p>
                </div>
                <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-white transition-colors" />
              </Link>
            )
          })}
        </div>

        {/* Tip footer */}
        <div className="flex items-start gap-2 pt-1">
          <AlertCircle size={11} className="text-slate-600 shrink-0 mt-0.5" />
          <p className="text-slate-500 text-[11px] leading-relaxed">
            ระบบจะใช้ข้อมูลนี้เพื่อยืนยันตัวตนและให้ทีม Seller / NP Create ติดต่อคุณได้
          </p>
        </div>
      </div>
    </div>
  )
}
