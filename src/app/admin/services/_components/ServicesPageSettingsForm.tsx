"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Loader2, ChevronDown, Settings2, CheckCircle2,
  GitBranch, HelpCircle, Plus, Trash2, ChevronUp, Pencil, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ServicesPageSettings, ProcessStep, FAQItem } from "@/lib/data/services-page"
import { updateServicesPageSettings } from "../actions"

const COLOR_PRESETS = ["#DC2626", "#F59E0B", "#10B981", "#6366F1", "#EC4899", "#38BDF8"]

type Section = "header" | "process" | "faq"

interface Props {
  initial: ServicesPageSettings
}

export function ServicesPageSettingsForm({ initial }: Props) {
  const [data, setData] = useState(initial)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openSection, setOpenSection] = useState<Section | null>(null)
  const [editingStep, setEditingStep] = useState<number | null>(null)
  const [editingFaq, setEditingFaq] = useState<number | null>(null)

  const markDirty = () => { setIsDirty(true); setSaved(false); setError(null) }

  // ── Header patch ────────────────────────────────────────────────────────────
  function patchHeader<K extends keyof Omit<ServicesPageSettings, "process_steps" | "faqs">>(
    key: K, val: ServicesPageSettings[K]
  ) {
    setData((prev) => ({ ...prev, [key]: val }))
    markDirty()
  }

  // ── Process steps ───────────────────────────────────────────────────────────
  function updateStep(i: number, patch: Partial<ProcessStep>) {
    setData((prev) => {
      const steps = [...prev.process_steps]
      steps[i] = { ...steps[i], ...patch }
      return { ...prev, process_steps: steps }
    })
    markDirty()
  }

  function addStep() {
    const idx = data.process_steps.length
    setData((prev) => ({
      ...prev,
      process_steps: [
        ...prev.process_steps,
        { step: String(idx + 1).padStart(2, "0"), title: "", duration: "", description: "" },
      ],
    }))
    setEditingStep(idx)
    markDirty()
  }

  function removeStep(i: number) {
    if (!confirm("ลบขั้นตอนนี้ใช่ไหม?")) return
    setData((prev) => ({ ...prev, process_steps: prev.process_steps.filter((_, j) => j !== i) }))
    if (editingStep === i) setEditingStep(null)
    markDirty()
  }

  function moveStep(i: number, dir: -1 | 1) {
    const n = i + dir
    if (n < 0 || n >= data.process_steps.length) return
    setData((prev) => {
      const steps = [...prev.process_steps]
      ;[steps[i], steps[n]] = [steps[n], steps[i]]
      return { ...prev, process_steps: steps }
    })
    markDirty()
  }

  // ── FAQs ────────────────────────────────────────────────────────────────────
  function updateFaq(i: number, patch: Partial<FAQItem>) {
    setData((prev) => {
      const faqs = [...prev.faqs]
      faqs[i] = { ...faqs[i], ...patch }
      return { ...prev, faqs }
    })
    markDirty()
  }

  function addFaq() {
    const idx = data.faqs.length
    setData((prev) => ({ ...prev, faqs: [...prev.faqs, { q: "", a: "" }] }))
    setEditingFaq(idx)
    markDirty()
  }

  function removeFaq(i: number) {
    if (!confirm("ลบคำถามนี้ใช่ไหม?")) return
    setData((prev) => ({ ...prev, faqs: prev.faqs.filter((_, j) => j !== i) }))
    if (editingFaq === i) setEditingFaq(null)
    markDirty()
  }

  function moveFaq(i: number, dir: -1 | 1) {
    const n = i + dir
    if (n < 0 || n >= data.faqs.length) return
    setData((prev) => {
      const faqs = [...prev.faqs]
      ;[faqs[i], faqs[n]] = [faqs[n], faqs[i]]
      return { ...prev, faqs }
    })
    markDirty()
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
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
  }, [data])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        if (isDirty) handleSave()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isDirty, handleSave])

  const toggle = (s: Section) => setOpenSection((prev) => (prev === s ? null : s))

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* ── 1. Header ── */}
      <Accordion
        icon={<Settings2 size={14} className="text-[#DC2626]" />}
        title="ตั้งค่าหัวหน้าหน้าบริการ"
        open={openSection === "header"}
        onToggle={() => toggle("header")}
      >
        <div className="grid xl:grid-cols-[minmax(0,1fr)_260px] gap-6 items-start">
          <div className="space-y-4">
            <Field label="ป้ายกำกับเล็ก (เหนือหัวข้อ)">
              <input
                value={data.label}
                onChange={(e) => patchHeader("label", e.target.value)}
                placeholder="บริการของเรา"
                className={inputCls()}
              />
            </Field>
            <Field label="หัวข้อบรรทัดที่ 1 (สีขาว)">
              <input
                value={data.heading1}
                onChange={(e) => patchHeader("heading1", e.target.value)}
                placeholder="ครบทุกขั้นตอน"
                className={inputCls()}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="หัวข้อบรรทัดที่ 2 (มีสี)">
                <input
                  value={data.heading2}
                  onChange={(e) => patchHeader("heading2", e.target.value)}
                  placeholder="ดูแลถึง Result"
                  className={inputCls()}
                />
              </Field>
              <Field label="สีหัวข้อบรรทัดที่ 2">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="color"
                    value={data.heading2_color}
                    onChange={(e) => patchHeader("heading2_color", e.target.value)}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer shrink-0"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => patchHeader("heading2_color", c)}
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
            <Field label="คำอธิบาย">
              <textarea
                value={data.description}
                onChange={(e) => patchHeader("description", e.target.value)}
                rows={3}
                placeholder="ไม่ใช่แค่ยิงแอด..."
                className={cn(inputCls(), "resize-none")}
              />
              <p className="text-slate-600 text-xs mt-1">{data.description.length} ตัวอักษร</p>
            </Field>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">ตัวอย่าง</p>
            <div className="bg-[#0A0808] rounded-xl p-5 border border-white/5">
              <span className="text-[10px] font-bold uppercase" style={{ color: data.heading2_color }}>
                {data.label || "บริการของเรา"}
              </span>
              <h2 className="font-bold text-white text-lg leading-snug mt-1">
                {data.heading1 || "ครบทุกขั้นตอน"}
                <span className="block" style={{ color: data.heading2_color }}>
                  {data.heading2 || "ดูแลถึง Result"}
                </span>
              </h2>
              <p className="text-slate-400 text-[11px] mt-2 leading-relaxed line-clamp-3">
                {data.description}
              </p>
            </div>
            <p className="text-slate-600 text-[10px] text-center">ตัวอย่างส่วนหัว /services</p>
          </div>
        </div>
      </Accordion>

      {/* ── 2. Process Steps ── */}
      <Accordion
        icon={<GitBranch size={14} className="text-[#DC2626]" />}
        title="ขั้นตอนการทำงาน"
        badge={`${data.process_steps.length} ขั้นตอน`}
        open={openSection === "process"}
        onToggle={() => toggle("process")}
      >
        <div className="space-y-2">
          {data.process_steps.map((step, i) => (
            <div key={i} className="bg-[#0A0808] border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="font-display font-bold text-[#DC2626] text-xs w-6 shrink-0">
                  {step.step}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {step.title || <span className="text-slate-600 italic">ยังไม่มีชื่อ</span>}
                  </p>
                  {step.duration && (
                    <p className="text-slate-500 text-xs mt-0.5">{step.duration}</p>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <IconBtn onClick={() => moveStep(i, -1)} disabled={i === 0} title="เลื่อนขึ้น">
                    <ChevronUp size={13} />
                  </IconBtn>
                  <IconBtn onClick={() => moveStep(i, 1)} disabled={i === data.process_steps.length - 1} title="เลื่อนลง">
                    <ChevronDown size={13} />
                  </IconBtn>
                  <IconBtn
                    onClick={() => setEditingStep(editingStep === i ? null : i)}
                    active={editingStep === i}
                    title="แก้ไข"
                  >
                    {editingStep === i ? <X size={13} /> : <Pencil size={13} />}
                  </IconBtn>
                  <IconBtn onClick={() => removeStep(i)} danger title="ลบ">
                    <Trash2 size={13} />
                  </IconBtn>
                </div>
              </div>

              {editingStep === i && (
                <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-3 bg-[#120404]">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="หมายเลข">
                      <input
                        value={step.step}
                        onChange={(e) => updateStep(i, { step: e.target.value })}
                        placeholder="01"
                        className={inputCls()}
                      />
                    </Field>
                    <Field label="ระยะเวลา">
                      <input
                        value={step.duration}
                        onChange={(e) => updateStep(i, { duration: e.target.value })}
                        placeholder="วันที่ 1–2"
                        className={inputCls()}
                      />
                    </Field>
                  </div>
                  <Field label="ชื่อขั้นตอน">
                    <input
                      value={step.title}
                      onChange={(e) => updateStep(i, { title: e.target.value })}
                      placeholder="วิเคราะห์ Shop ของคุณ"
                      className={inputCls()}
                    />
                  </Field>
                  <Field label="คำอธิบาย">
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(i, { description: e.target.value })}
                      rows={3}
                      placeholder="รายละเอียดขั้นตอนนี้..."
                      className={cn(inputCls(), "resize-none")}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => setEditingStep(null)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    ✓ เสร็จแล้ว
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addStep}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-white/10 hover:border-[#DC2626]/40 text-slate-500 hover:text-[#DC2626] text-sm py-3 rounded-xl transition-colors"
          >
            <Plus size={14} /> เพิ่มขั้นตอน
          </button>
        </div>
      </Accordion>

      {/* ── 3. FAQ ── */}
      <Accordion
        icon={<HelpCircle size={14} className="text-[#DC2626]" />}
        title="คำถามที่พบบ่อย (FAQ)"
        badge={`${data.faqs.length} ข้อ`}
        open={openSection === "faq"}
        onToggle={() => toggle("faq")}
      >
        <div className="space-y-2">
          {data.faqs.map((faq, i) => (
            <div key={i} className="bg-[#0A0808] border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-slate-600 text-xs shrink-0 font-mono w-6">Q{i + 1}</span>
                <p className="flex-1 text-white text-sm line-clamp-1 min-w-0">
                  {faq.q || <span className="text-slate-600 italic">ยังไม่มีคำถาม</span>}
                </p>
                <div className="flex items-center gap-0.5 shrink-0">
                  <IconBtn onClick={() => moveFaq(i, -1)} disabled={i === 0} title="เลื่อนขึ้น">
                    <ChevronUp size={13} />
                  </IconBtn>
                  <IconBtn onClick={() => moveFaq(i, 1)} disabled={i === data.faqs.length - 1} title="เลื่อนลง">
                    <ChevronDown size={13} />
                  </IconBtn>
                  <IconBtn
                    onClick={() => setEditingFaq(editingFaq === i ? null : i)}
                    active={editingFaq === i}
                    title="แก้ไข"
                  >
                    {editingFaq === i ? <X size={13} /> : <Pencil size={13} />}
                  </IconBtn>
                  <IconBtn onClick={() => removeFaq(i)} danger title="ลบ">
                    <Trash2 size={13} />
                  </IconBtn>
                </div>
              </div>

              {editingFaq === i && (
                <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-3 bg-[#120404]">
                  <Field label="คำถาม">
                    <input
                      value={faq.q}
                      onChange={(e) => updateFaq(i, { q: e.target.value })}
                      placeholder="ตั้งคำถามที่ลูกค้ามักถาม..."
                      className={inputCls()}
                    />
                  </Field>
                  <Field label="คำตอบ">
                    <textarea
                      value={faq.a}
                      onChange={(e) => updateFaq(i, { a: e.target.value })}
                      rows={4}
                      placeholder="ตอบอย่างชัดเจน..."
                      className={cn(inputCls(), "resize-none")}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => setEditingFaq(null)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    ✓ เสร็จแล้ว
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addFaq}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-white/10 hover:border-[#DC2626]/40 text-slate-500 hover:text-[#DC2626] text-sm py-3 rounded-xl transition-colors"
          >
            <Plus size={14} /> เพิ่มคำถาม
          </button>
        </div>
      </Accordion>

      {/* ── Sticky save bar ── */}
      {isDirty && (
        <div className="sticky bottom-4 z-20">
          <div className="bg-[#1C0D0D] border border-[#DC2626]/30 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl shadow-black/50">
            <p className="text-slate-400 text-sm">มีการเปลี่ยนแปลงที่ยังไม่บันทึก</p>
            <div className="flex items-center gap-3">
              <span className="text-slate-600 text-xs hidden sm:block">Ctrl+S</span>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                บันทึกทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}

      {saved && !isDirty && (
        <div className="flex items-center justify-end gap-1.5 text-emerald-400 text-sm">
          <CheckCircle2 size={14} /> บันทึกแล้ว
        </div>
      )}
    </div>
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function Accordion({
  icon, title, badge, open, onToggle, children,
}: {
  icon: React.ReactNode
  title: string
  badge?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-white font-semibold text-sm">{title}</span>
          {badge && (
            <span className="text-[10px] bg-white/5 text-slate-500 px-2 py-0.5 rounded-full">
              {badge}
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
          {children}
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

function IconBtn({
  children, onClick, disabled, active, danger, title,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  danger?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-lg transition-colors disabled:opacity-30",
        active
          ? "text-[#DC2626] bg-[#DC2626]/10"
          : danger
          ? "text-slate-600 hover:text-red-400 hover:bg-red-500/5"
          : "text-slate-500 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </button>
  )
}

function inputCls() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-3 py-2.5 text-white text-base",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}
