"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function MemberError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[member-error]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0A0808] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-xl">เกิดข้อผิดพลาด</h1>
          <p className="text-slate-500 text-sm mt-2">
            {error.message && !error.message.includes("NEXT") ? error.message : "กรุณาลองใหม่อีกครั้ง"}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            <RefreshCw size={14} /> ลองใหม่
          </button>
          <Link href="/member"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  )
}
