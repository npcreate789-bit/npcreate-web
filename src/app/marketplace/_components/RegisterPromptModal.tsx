"use client"

import { useEffect } from "react"
import Link from "next/link"
import { X, Gift, Star, TrendingUp } from "lucide-react"

export function RegisterPromptModal({
  onClose,
  returnTo,
}: {
  onClose: () => void
  returnTo?: string
}) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const registerUrl = returnTo
    ? `/register?next=${encodeURIComponent(returnTo)}`
    : "/register"
  const loginUrl = returnTo
    ? `/member/login?next=${encodeURIComponent(returnTo)}`
    : "/member/login"

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#1C0D0D] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 bg-[#DC2626]/10 rounded-2xl flex items-center justify-center mx-auto">
          <Gift size={28} className="text-[#DC2626]" />
        </div>

        {/* Heading */}
        <div className="text-center space-y-1.5">
          <h2 className="font-display font-bold text-white text-lg">สมัครสมาชิกฟรี</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            เพื่อรับข้อมูลสินค้า Caption แนะนำ<br />และมีสิทธิ์รับสินค้าตัวอย่างจากร้านค้า
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          {[
            { icon: <TrendingUp size={14} className="text-[#F59E0B]" />, text: "ดึงสินค้าและรับค่าคอมมิชชั่น" },
            { icon: <Star size={14} className="text-emerald-400" />, text: "Caption แนะนำและคำต้องห้ามสำหรับ Affiliate" },
            { icon: <Gift size={14} className="text-[#DC2626]" />, text: "สิทธิ์รับสินค้าตัวอย่างจากร้านค้า" },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-2.5 bg-white/[0.03] rounded-xl px-3 py-2">
              {b.icon}
              <span className="text-slate-300 text-xs">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link href={registerUrl}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            สมัครสมาชิกฟรี →
          </Link>
          <Link href={loginUrl}
            className="w-full inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 font-medium py-2.5 rounded-xl transition-colors text-sm">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  )
}
