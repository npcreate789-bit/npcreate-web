"use client"
import { useState } from "react"
import { MessageCircle, Send, X, Loader2, CheckCircle2 } from "lucide-react"

const DEFAULT_MESSAGE = `สวัสดีครับ/ค่ะ ทีมงาน NP Create ขอบคุณที่สนใจบริการของเราครับ 🙏

ทางเราได้รับข้อมูลของคุณแล้ว และจะติดต่อกลับเร็วๆ นี้ครับ หากมีคำถามเพิ่มเติมสามารถสอบถามได้เลยนะครับ 😊`

export function LinePushButton({ lineUserId, leadName }: { lineUserId: string; leadName: string }) {
  const [open, setOpen]       = useState(false)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSend = async () => {
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/line-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line_user_id: lineUserId, message }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "ส่งไม่สำเร็จ")
        return
      }
      setSent(true)
      setTimeout(() => { setOpen(false); setSent(false) }, 1500)
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้")
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-[#06C755] hover:text-[#05a847] border border-[#06C755]/30 hover:border-[#06C755]/60 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      >
        <MessageCircle size={13} />
        ส่ง LINE
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
      <div className="bg-[#1C0D0D] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">ส่งข้อความ LINE</p>
            <p className="text-slate-500 text-xs mt-0.5">ถึง: {leadName}</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>

        {sent ? (
          <div className="flex items-center gap-2 text-[#06C755] py-4 justify-center">
            <CheckCircle2 size={20} />
            <span className="font-medium">ส่งสำเร็จแล้ว</span>
          </div>
        ) : (
          <>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              className="w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#06C755]/30 focus:border-[#06C755]/40"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">
                ยกเลิก
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05a847] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {sending ? "กำลังส่ง..." : "ส่งข้อความ"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
