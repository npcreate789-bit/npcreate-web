"use client"

import { useState, useTransition } from "react"
import { Loader2, CheckCircle2, XCircle, Truck, MessageSquare, Save, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateSampleStatus, updateSellerNote } from "../actions"
import type { SampleStatus } from "@/types/database"

interface Props {
  pullId: string
  status: SampleStatus
  note: string | null
}

export function PullActions({ pullId, status, note: initialNote }: Props) {
  const [note, setNote] = useState(initialNote ?? "")
  const [showNote, setShowNote] = useState(!!initialNote)
  const [noteSaved, setNoteSaved] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [noteError, setNoteError] = useState<string | null>(null)
  const [pendingStatus, startStatus] = useTransition()
  const [pendingNote, startNote] = useTransition()

  function handleStatus(newStatus: SampleStatus) {
    setStatusError(null)
    startStatus(async () => {
      try {
        await updateSampleStatus(pullId, newStatus)
      } catch (e) {
        setStatusError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  function handleSaveNote() {
    setNoteError(null)
    setNoteSaved(false)
    startNote(async () => {
      try {
        await updateSellerNote(pullId, note)
        setNoteSaved(true)
      } catch (e) {
        setNoteError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <div className="space-y-2 pt-2 border-t border-white/5">
      {/* Status action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {status === "pending" && (
          <>
            <button
              onClick={() => handleStatus("approved")}
              disabled={pendingStatus}
              className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {pendingStatus ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
              อนุมัติตัวอย่าง
            </button>
            <button
              onClick={() => handleStatus("rejected")}
              disabled={pendingStatus}
              className="inline-flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {pendingStatus ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
              ปฏิเสธ
            </button>
          </>
        )}

        {status === "approved" && (
          <button
            onClick={() => handleStatus("sent")}
            disabled={pendingStatus}
            className="inline-flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {pendingStatus ? <Loader2 size={11} className="animate-spin" /> : <Truck size={11} />}
            ส่งสินค้าแล้ว
          </button>
        )}

        {/* Toggle note */}
        <button
          onClick={() => setShowNote(v => !v)}
          className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors ml-auto"
        >
          <MessageSquare size={11} />
          โน้ต
          {showNote ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      </div>

      {statusError && (
        <p className="text-red-400 text-xs">{statusError}</p>
      )}

      {/* Note editor */}
      {showNote && (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); setNoteSaved(false) }}
            rows={2}
            placeholder="โน้ตถึง Affiliate (จะแสดงในหน้าสินค้าของพวกเขา)"
            className={cn(
              "w-full bg-[#0A0808] border border-white/10 rounded-xl px-3 py-2 text-white text-xs",
              "placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:border-white/20 transition-colors resize-none"
            )}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveNote}
              disabled={pendingNote}
              className="inline-flex items-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {pendingNote ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
              บันทึก
            </button>
            {noteSaved && <span className="text-emerald-400 text-xs">บันทึกแล้ว</span>}
            {noteError && <span className="text-red-400 text-xs">{noteError}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
