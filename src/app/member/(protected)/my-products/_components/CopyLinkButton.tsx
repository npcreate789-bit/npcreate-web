"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyLinkButton({ url, code }: { url: string; code: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button onClick={handleCopy}
      className="w-full flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg px-2.5 py-1.5 transition-colors text-left group">
      <span className="text-emerald-400 text-xs font-medium truncate flex-1">/go/{code}</span>
      {copied
        ? <Check size={12} className="text-emerald-400 shrink-0" />
        : <Copy size={12} className="text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors" />}
    </button>
  )
}
