"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface Props {
  text: string
  label?: string
}

export function CopyAddressButton({ text, label = "คัดลอกที่อยู่" }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea")
      el.value = text
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium transition-all px-3 py-1.5 rounded-lg border"
      style={copied
        ? { color: "rgb(52 211 153)", borderColor: "rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)" }
        : { color: "rgb(148 163 184)", borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }
      }
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "คัดลอกแล้ว!" : label}
    </button>
  )
}
