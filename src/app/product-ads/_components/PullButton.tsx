"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Loader2, CheckCircle2, Plus, AlertTriangle, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { pullProduct } from "../actions"
import { RegisterPromptModal } from "./RegisterPromptModal"

type MissingItem = { key: "line" | "tiktok"; label: string; href: string }

export function PullButton({
  productId,
  isLoggedIn,
  isAffiliate,
  isPulled: initialPulled,
  hasLine,
  hasTiktok,
}: {
  productId: string
  isLoggedIn: boolean
  isAffiliate: boolean
  isPulled: boolean
  hasLine: boolean
  hasTiktok: boolean
}) {
  const pathname = usePathname()
  const [pulled, setPulled]       = useState(initialPulled)
  const [showModal, setShowModal] = useState(false)
  const [pending, start]          = useTransition()

  const missing: MissingItem[] = []
  if (isLoggedIn && isAffiliate) {
    if (!hasLine)   missing.push({ key: "line",   label: "เชื่อมต่อ LINE",     href: "/api/auth/line?returnTo=/member/profile" })
    if (!hasTiktok) missing.push({ key: "tiktok", label: "เพิ่มลิงก์ช่อง TikTok", href: "/member/profile#tiktok" })
  }
  const isBlocked = missing.length > 0

  function handleClick() {
    if (!isLoggedIn)  { setShowModal(true); return }
    if (!isAffiliate) { toast.error("เฉพาะสมาชิก Affiliate เท่านั้น"); return }
    if (isBlocked)    return  // blocker UI already visible — no-op
    doPull()
  }

  function doPull() {
    start(async () => {
      const result = await pullProduct(productId)
      if ("error" in result) {
        toast.error(result.error)
      } else {
        setPulled(true)
        toast.success("ดึงสินค้าแล้ว! ดูได้ที่ สินค้าของฉัน")
      }
    })
  }

  if (pulled) {
    return (
      <div className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold py-3 rounded-xl text-sm">
        <CheckCircle2 size={16} /> ดึงสินค้าแล้ว
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {isBlocked && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2.5 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-200 text-xs font-semibold leading-snug">
                อีกนิดเดียวก็พร้อมดึงสินค้า
              </p>
            </div>
            <div className="space-y-1">
              {missing.map(m => (
                <Link
                  key={m.key}
                  href={m.href}
                  className="group flex items-center gap-2 text-xs text-amber-200/90 hover:text-white bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/15 hover:border-amber-500/40 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <span className="flex-1">{m.label}</span>
                  <ChevronRight size={12} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={pending || isBlocked}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {pending
            ? <><Loader2 size={15} className="animate-spin" /> กำลังดึง...</>
            : <><Plus size={15} /> ดึงสินค้า</>}
        </button>
      </div>

      {showModal && (
        <RegisterPromptModal
          onClose={() => setShowModal(false)}
          returnTo={pathname}
        />
      )}
    </>
  )
}
