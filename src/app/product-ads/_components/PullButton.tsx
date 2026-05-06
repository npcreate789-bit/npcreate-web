"use client"

import { useState, useTransition } from "react"
import { usePathname } from "next/navigation"
import { Loader2, CheckCircle2, Plus, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { pullProduct } from "../actions"
import { RegisterPromptModal } from "./RegisterPromptModal"

export function PullButton({
  productId,
  isLoggedIn,
  isAffiliate,
  isPulled: initialPulled,
  hasTiktok,
}: {
  productId: string
  isLoggedIn: boolean
  isAffiliate: boolean
  isPulled: boolean
  hasTiktok: boolean
}) {
  const pathname = usePathname()
  const [pulled, setPulled]                   = useState(initialPulled)
  const [showModal, setShowModal]             = useState(false)
  const [showTiktokWarn, setShowTiktokWarn]   = useState(false)
  const [pending, start]                      = useTransition()

  function handleClick() {
    if (!isLoggedIn) { setShowModal(true); return }
    if (!isAffiliate) { toast.error("เฉพาะสมาชิก Affiliate เท่านั้น"); return }
    if (!hasTiktok && !showTiktokWarn) { setShowTiktokWarn(true); return }
    setShowTiktokWarn(false)
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
        {showTiktokWarn && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-amber-300 text-xs font-medium">แนะนำใส่ลิงก์ TikTok ก่อน</p>
              <p className="text-amber-400/70 text-xs mt-0.5">
                Seller จะได้เห็นช่องของคุณเพื่อพิจารณาส่งสินค้าตัวอย่าง
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={pending}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {pending
            ? <><Loader2 size={15} className="animate-spin" /> กำลังดึง...</>
            : <><Plus size={15} /> {showTiktokWarn ? "ดึงสินค้าต่อไป" : "ดึงสินค้า"}</>}
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
