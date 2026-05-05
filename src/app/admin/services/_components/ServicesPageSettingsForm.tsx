"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, ChevronDown, Settings2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ServicesPageSettings } from "@/lib/data/services-page"
import { updateServicesPageSettings } from "../actions"

const COLOR_PRESETS = ["#DC2626", "#F59E0B", "#10B981", "#6366F1", "#EC4899", "#38BDF8"]

interface Props {
  initial: ServicesPageSettings
}

export function ServicesPageSettingsForm({ initial }: Props) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(initial)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function patch<K extends keyof ServicesPageSettings>(key: K, val: ServicesPageSettings[K]) {
    setData((prev) => ({ ...prev, [key]: val }))
    setIsDirty(true)
    setSaved(false)
    setError(null)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await updateServicesPageSettings(data)
      setIsDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Settings2 size={15} className="text-[#DC2626]" />
          <span className="text-white font-semibold text-sm">ตั้งค่าหัวหน้าหน้าบริการ</span>
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />}
          {saved && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs">
              <CheckCircle2 size={12} /> บันทึกแล้ว
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={cn("text-slate-500 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="border-t border-white/5 px-5 pb-6 pt-5">
          <div className="grid xl:grid-cols-[minmax(0,1fr)_260px] gap-6 items-start">

            {/* ── Form ── */}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Label */}
              <Field label="ป้ายกำกับเล็ก (แสดงเหนือหัวข้อ)">
                <input
                  value={data.label}
                  onChange={(e) => patch("label", e.target.value)}
                  placeholder="บริการของเรา"
                  className={inputCls()}
                />
              </Field>

              {/* Heading line 1 */}
              <Field label="หัวข้อบรรทัดที่ 1 (สีขาว)">
                <input
                  value={data.heading1}
                  onChange={(e) => patch("heading1", e.target.value)}
                  placeholder="ครบทุกขั้นตอน"
                  className={inputCls()}
                />
              </Field>

              {/* Heading line 2 + color */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="หัวข้อบรรทัดที่ 2 (มีสี)">
                  <input
                    value={data.heading2}
                    onChange={(e) => patch("heading2", e.target.value)}
                    placeholder="ดูแลถึง Result"
                    className={inputCls()}
                  />
                </Field>

                <Field label="สีหัวข้อบรรทัดที่ 2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="color"
                      value={data.heading2_color}
                      onChange={(e) => patch("heading2_color", e.target.value)}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer shrink-0"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => patch("heading2_color", c)}
                          title={c}
                          className={cn(
                            "w-6 h-6 rounded-md border-2 transition-all",
                            data.heading2_color === c
                              ? "border-white scale-110 shadow-md"
                              : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                          )}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </Field>
              </div>

              {/* Description */}
              <Field label="คำอธิบายใต้หัวข้อ">
                <textarea
                  value={data.description}
                  onChange={(e) => patch("description", e.target.value)}
                  rows={3}
                  placeholder="ไม่ใช่แค่ยิงแอด — เราวางกลยุทธ์..."
                  className={cn(inputCls(), "resize-none")}
                />
                <p className="text-slate-600 text-xs mt-1">
                  {data.description.length} ตัวอักษร
                </p>
              </Field>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!isDirty || saving}
                  className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  บันทึก
                </button>
                <span className="text-slate-600 text-xs">Ctrl+S</span>
              </div>
            </form>

            {/* ── Preview ── */}
            <div className="space-y-2">
              <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
                ตัวอย่าง
              </p>
              <div className="bg-[#0A0808] rounded-xl p-5 border border-white/5 space-y-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: data.heading2_color }}
                >
                  {data.label || "บริการของเรา"}
                </span>
                <h2 className="font-bold text-white text-lg leading-snug mt-1">
                  {data.heading1 || "ครบทุกขั้นตอน"}
                  <br />
                  <span style={{ color: data.heading2_color }}>
                    {data.heading2 || "ดูแลถึง Result"}
                  </span>
                </h2>
                <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-3">
                  {data.description}
                </p>
              </div>
              <p className="text-slate-600 text-[10px] text-center">ตัวอย่างส่วนหัว /services</p>
            </div>
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

function inputCls() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-3 py-2.5 text-white text-base",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}
