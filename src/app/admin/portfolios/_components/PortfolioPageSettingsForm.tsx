"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { updatePortfolioPageSettings } from "../actions"
import type { PortfolioPageSettings, PortfolioStat } from "@/lib/data/portfolio-page"

export function PortfolioPageSettingsForm({ initial }: { initial: PortfolioPageSettings }) {
  const [data, setData] = useState<PortfolioPageSettings>(initial)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [pending, startTransition] = useTransition()

  function patch(partial: Partial<PortfolioPageSettings>) {
    setData((prev) => ({ ...prev, ...partial }))
    setDirty(true)
    setStatus("idle")
  }

  function patchStat(i: number, field: keyof PortfolioStat, value: string) {
    const next = data.stats.map((s, idx) => idx === i ? { ...s, [field]: value } : s)
    patch({ stats: next })
  }

  function addStat() {
    patch({ stats: [...data.stats, { value: "", label: "" }] })
  }

  function removeStat(i: number) {
    patch({ stats: data.stats.filter((_, idx) => idx !== i) })
  }

  const save = useCallback(() => {
    setStatus("idle")
    startTransition(async () => {
      try {
        await updatePortfolioPageSettings(data)
        setStatus("ok")
        setDirty(false)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
        setStatus("error")
      }
    })
  }, [data])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (dirty) save()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [dirty, save])

  return (
    <div className="space-y-4">
      {/* Header preview */}
      <div className="bg-[#0A0404] border border-white/5 rounded-2xl p-6 space-y-1.5">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-3">ตัวอย่างหน้าบ้าน</p>
        <p className="text-[#DC2626] text-xs font-bold uppercase tracking-widest">{data.label || "ผลงานของเรา"}</p>
        <p className="font-bold text-white text-xl">{data.heading || "ผลลัพธ์ที่พิสูจน์แล้ว"}</p>
        <p className="text-slate-400 text-sm">{data.subtext || "—"}</p>
        <div className="flex gap-6 pt-2">
          {data.stats.map((s, i) => (
            <div key={i}>
              <div className="font-bold text-[#F59E0B] text-base">{s.value || "—"}</div>
              <div className="text-slate-500 text-xs">{s.label || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-5">

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Label (บรรทัดเล็กสีแดง)">
            <input value={data.label} onChange={(e) => patch({ label: e.target.value })}
              className={input()} placeholder="ผลงานของเรา" />
          </Field>
          <Field label="Heading (หัวข้อหลัก)">
            <input value={data.heading} onChange={(e) => patch({ heading: e.target.value })}
              className={input()} placeholder="ผลลัพธ์ที่พิสูจน์แล้ว" />
          </Field>
        </div>

        <Field label="Subtext (คำอธิบาย)">
          <textarea value={data.subtext} onChange={(e) => patch({ subtext: e.target.value })}
            rows={2} className={cn(input(), "resize-none")}
            placeholder="ตัวเลขทุกตัวมาจาก TikTok Shop dashboard โดยตรง ไม่ใช่ตัวเลขที่สร้างขึ้น" />
        </Field>

        {/* Stats */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-slate-300 text-xs font-medium">ตัวเลขสถิติ</label>
            <button type="button" onClick={addStat}
              className="inline-flex items-center gap-1 text-[#DC2626] hover:text-[#FCA5A5] text-xs font-medium transition-colors">
              <Plus size={12} /> เพิ่มสถิติ
            </button>
          </div>
          <div className="space-y-2">
            {data.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <GripVertical size={14} className="text-slate-700 shrink-0" />
                <input value={stat.value} onChange={(e) => patchStat(i, "value", e.target.value)}
                  className={cn(input(), "w-28")} placeholder="800M+" />
                <input value={stat.label} onChange={(e) => patchStat(i, "label", e.target.value)}
                  className={cn(input(), "flex-1")} placeholder="GMV รวม (บาท)" />
                <button type="button" onClick={() => removeStat(i)}
                  className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {data.stats.length === 0 && (
              <p className="text-slate-600 text-xs py-2">ยังไม่มีสถิติ — กด "เพิ่มสถิติ" ด้านบน</p>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      {status === "ok" && (
        <p className="text-emerald-400 text-sm px-1">บันทึกสำเร็จ ✓</p>
      )}
      {status === "error" && (
        <p className="text-red-400 text-sm px-1">{errorMsg}</p>
      )}

      {/* Sticky save bar */}
      {dirty && (
        <div className="sticky bottom-4 z-10">
          <div className="bg-[#1C0D0D] border border-[#DC2626]/30 rounded-2xl px-5 py-3 flex items-center justify-between shadow-xl shadow-black/40">
            <p className="text-slate-400 text-sm">มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</p>
            <button onClick={save} disabled={pending}
              className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
              {pending && <Loader2 size={14} className="animate-spin" />}
              บันทึก
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-slate-300 text-xs font-medium">{label}</label>
      {children}
    </div>
  )
}

function input() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-3 py-2 text-white text-base",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50",
    "focus:ring-[#DC2626]/20 transition-colors",
  )
}
