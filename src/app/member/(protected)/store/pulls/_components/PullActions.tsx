"use client"

import { useState, useTransition } from "react"
import {
  Loader2, CheckCircle2, XCircle, Truck,
  MessageSquare, Save, ChevronDown, ChevronUp,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { updateSampleStatus, updateSellerNote } from "../actions"
import type { SampleStatus } from "@/types/database"

interface Props {
  pullId: string
  status: SampleStatus
  note:   string | null
  hasAddress: boolean
}

export function PullActions({ pullId, status, note: initialNote, hasAddress }: Props) {
  const [note, setNote]         = useState(initialNote ?? "")
  const [showNote, setShowNote] = useState(!!initialNote)
  const [pendingStatus, startStatus] = useTransition()
  const [pendingNote,   startNote]   = useTransition()

  function handleStatus(newStatus: SampleStatus) {
    startStatus(async () => {
      try {
        await updateSampleStatus(pullId, newStatus)
        const labels: Record<SampleStatus, string> = {
          approved: "อนุมัติตัวอย่างแล้ว ✓",
          rejected: "ปฏิเสธแล้ว",
          sent:     "บันทึกว่าส่งแล้ว ✓",
          pending:  "รีเซ็ตสถานะแล้ว",
        }
        toast.success(labels[newStatus])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  function handleSaveNote() {
    startNote(async () => {
      try {
        await updateSellerNote(pullId, note)
        toast.success("บันทึกโน้ตแล้ว")
        setShowNote(!!note.trim())
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <div className="space-y-2.5 pt-3 border-t border-white/5">

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">

        {status === "pending" && (
          <>
            <button
              onClick={() => handleStatus("approved")}
              disabled={pendingStatus}
              className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {pendingStatus ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
              อนุมัติตัวอย่าง
            </button>
            <button
              onClick={() => handleStatus("rejected")}
              disabled={pendingStatus}
              className="inline-flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {pendingStatus ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
              ปฏิเสธ
            </button>
          </>
        )}

        {status === "approved" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatus("sent")}
              disabled={pendingStatus || !hasAddress}
              title={!hasAddress ? "Affiliate ยังไม่กรอกที่อยู่" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50",
                hasAddress
                  ? "bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400"
                  : "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
              )}
            >
              {pendingStatus ? <Loader2 size={11} className="animate-spin" /> : <Truck size={11} />}
              ส่งสินค้าแล้ว
            </button>
            {!hasAddress && (
              <span className="text-amber-400/70 text-[10px]">รอที่อยู่จาก Affiliate</span>
            )}
          </div>
        )}

        {status === "sent" && (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/5 border border-blue-500/10 px-3 py-2 rounded-xl">
            <Truck size={11} /> ส่งสินค้าแล้ว
          </span>
        )}

        {status === "rejected" && (
          <button
            onClick={() => handleStatus("pending")}
            disabled={pendingStatus}
            className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {pendingStatus ? <Loader2 size={11} className="animate-spin" /> : null}
            ยกเลิกการปฏิเสธ
          </button>
        )}

        {/* Note toggle — always available */}
        <button
          onClick={() => setShowNote(v => !v)}
          className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs px-3 py-2 rounded-xl transition-colors ml-auto"
        >
          <MessageSquare size={11} />
          โน้ต
          {showNote ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      </div>

      {/* Note editor */}
      {showNote && (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            placeholder="โน้ตถึง Affiliate (จะแสดงในหน้าสินค้าของพวกเขา)"
            className={cn(
              "w-full bg-[#0A0808] border border-white/10 rounded-xl px-3 py-2 text-white text-xs",
              "placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:border-white/20 transition-colors resize-none"
            )}
          />
          <button
            onClick={handleSaveNote}
            disabled={pendingNote}
            className="inline-flex items-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {pendingNote ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
            บันทึกโน้ต
          </button>
        </div>
      )}

    </div>
  )
}
