"use client"

import { useState, useTransition } from "react"
import { Link2, Loader2, Check, Copy } from "lucide-react"
import { pullProduct } from "../actions"

export function PullButton({ productId, initialPullCode }: {
  productId: string
  initialPullCode?: string
}) {
  const [pullCode, setPullCode] = useState<string | null>(initialPullCode ?? null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const trackingUrl = pullCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/go/${pullCode}`
    : null

  function handlePull() {
    setError(null)
    start(async () => {
      try {
        const code = await pullProduct(productId)
        setPullCode(code)
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  function handleCopy() {
    if (!trackingUrl) return
    navigator.clipboard.writeText(trackingUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (pullCode && trackingUrl) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          <Check size={13} className="text-emerald-400 shrink-0" />
          <span className="text-emerald-400 text-xs font-medium truncate flex-1">/go/{pullCode}</span>
          <button onClick={handleCopy}
            className="shrink-0 text-emerald-400 hover:text-emerald-300 transition-colors">
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <button onClick={handlePull} disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
        {pending ? "กำลังดึง..." : "ดึงสินค้า"}
      </button>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
    </div>
  )
}
