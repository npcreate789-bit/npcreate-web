"use client"

import { useState, useTransition } from "react"
import { Loader2, Save, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { updateTiktokUrl } from "../actions"

export function TiktokForm({ currentUrl }: { currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl ?? "")
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      try {
        await updateTiktokUrl(url)
        toast.success("บันทึก TikTok URL แล้ว")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">TT</span>
        </div>
        <h2 className="text-white font-semibold text-sm">ช่อง TikTok ของคุณ</h2>
      </div>

      <p className="text-slate-500 text-xs leading-relaxed">
        ใส่ลิงก์ช่อง TikTok เพื่อให้ Seller เห็นและพิจารณาส่งสินค้าตัวอย่างให้คุณ
      </p>

      <div className="space-y-1.5">
        <label className="text-slate-300 text-xs font-medium">URL ช่อง TikTok</label>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.tiktok.com/@yourusername"
          className={cn(
            "w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm",
            "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
          )}
        />
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#F59E0B] text-xs hover:text-[#FCD34D] transition-colors mt-1"
          >
            <ExternalLink size={11} /> เปิดลิงก์
          </a>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {pending ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </form>
  )
}
