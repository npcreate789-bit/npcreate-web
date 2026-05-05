"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { Loader2, CheckCircle2, ChevronDown, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { type HomepageSettings } from "@/lib/data/homepage"
import { updateHomepageSettings } from "../actions"

// Tailwind class strings must be literals for JIT
const SIZE_CLASSES = {
  sm: "text-3xl sm:text-4xl lg:text-5xl",
  md: "text-4xl sm:text-5xl lg:text-6xl",
  lg: "text-5xl sm:text-6xl lg:text-7xl",
  xl: "text-6xl sm:text-7xl lg:text-8xl",
}

const COLOR_PRESETS = [
  { label: "แดง (brand)", value: "#DC2626" },
  { label: "ทอง",         value: "#F59E0B" },
  { label: "ขาว",         value: "#FFFFFF" },
  { label: "เขียว",       value: "#10B981" },
  { label: "ม่วง",        value: "#6366F1" },
]

const WEIGHT_OPTIONS = [
  { value: "light",     label: "บาง",     cls: "font-light"     },
  { value: "normal",    label: "ปกติ",    cls: "font-normal"    },
  { value: "semibold",  label: "กึ่งหนา", cls: "font-semibold"  },
  { value: "bold",      label: "หนา",     cls: "font-bold"      },
  { value: "extrabold", label: "หนามาก",  cls: "font-extrabold" },
] as const

interface Props {
  initial: HomepageSettings
}

export function HomepageForm({ initial }: Props) {
  const [s, setS]               = useState<HomepageSettings>(initial)
  const [isPending, startTrans] = useTransition()
  const [saved, setSaved]       = useState(false)
  const [isDirty, setIsDirty]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const formRef                 = useRef<HTMLFormElement>(null)

  // Ctrl/Cmd+S keyboard shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  function patch<K extends keyof HomepageSettings>(section: K, value: Partial<HomepageSettings[K]>) {
    setIsDirty(true)
    setS((prev) => ({ ...prev, [section]: { ...(prev[section] as object), ...(value as object) } }))
  }

  function patchStats(i: number, field: "value" | "label", val: string) {
    setIsDirty(true)
    setS((prev) => {
      const next = [...prev.stats]
      next[i] = { ...next[i], [field]: val }
      return { ...prev, stats: next }
    })
  }

  function patchReason(i: number, field: "title" | "description", val: string) {
    setIsDirty(true)
    setS((prev) => {
      const next = [...prev.why_us.reasons]
      next[i] = { ...next[i], [field]: val }
      return { ...prev, why_us: { ...prev.why_us, reasons: next } }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    startTrans(async () => {
      try {
        await updateHomepageSettings(s)
        setSaved(true)
        setIsDirty(false)
        setTimeout(() => setSaved(false), 4000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 max-w-4xl">

      {/* ── Sticky save bar ── */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-[#1C0D0D]/95 backdrop-blur-sm border border-white/5 rounded-2xl px-5 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {isDirty && !saved ? (
            <span className="flex items-center gap-1.5 text-amber-400 text-xs">
              <AlertCircle size={12} className="shrink-0" />
              มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
            </span>
          ) : (
            <p className="text-slate-600 text-xs">แก้ไขเนื้อหาหน้าแรก · <kbd className="bg-white/5 px-1 rounded text-slate-500">Ctrl+S</kbd> บันทึก</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle2 size={14} /> บันทึกแล้ว
            </span>
          )}
          {error && <span className="text-red-400 text-xs max-w-[180px] truncate">{error}</span>}
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            บันทึกทั้งหมด
          </button>
        </div>
      </div>

      {/* ── Promotion badge ── */}
      <Section title="Promotion Badge" subtitle="แถบข้อความบนสุดของเว็บ">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={s.promo.visible}
              onChange={(e) => patch("promo", { visible: e.target.checked })}
              className="w-4 h-4 accent-[#DC2626]"
            />
            <span className="text-slate-300 text-sm">แสดงบนหน้าเว็บ</span>
          </label>
          <CharCount value={s.promo.text} max={60} />
        </div>
        <input
          value={s.promo.text}
          onChange={(e) => patch("promo", { text: e.target.value })}
          placeholder="รับลูกค้าใหม่ เดือน พ.ค. นี้ — เหลืออีก 3 สล็อต"
          className={inputCls}
        />
        {s.promo.visible && (
          <div className="pt-3 border-t border-white/5">
            <PreviewLabel />
            <div className="inline-flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#FCA5A5] text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
              {s.promo.text || "ข้อความ..."}
            </div>
          </div>
        )}
      </Section>

      {/* ── Hero heading ── */}
      <Section title="Hero — ข้อความหลัก (H1)" subtitle="หัวข้อ 3 บรรทัดกลางหน้าแรก">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="บรรทัด 1">
            <input value={s.hero.line1} onChange={(e) => patch("hero", { line1: e.target.value })} placeholder="ปั้นยอดขาย TikTok Shop" className={inputCls} />
          </Field>
          <Field label="บรรทัด 2 (มีสี)">
            <input value={s.hero.line2} onChange={(e) => patch("hero", { line2: e.target.value })} placeholder="ให้โต 10 เท่า" className={inputCls} />
          </Field>
          <Field label="บรรทัด 3">
            <input value={s.hero.line3} onChange={(e) => patch("hero", { line3: e.target.value })} placeholder="ด้วย GMV Max" className={inputCls} />
          </Field>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#0A0808] p-4 space-y-3">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold">Typography</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="สีบรรทัด 2">
              <ColorPicker value={s.hero.line2_color} onChange={(v) => patch("hero", { line2_color: v })} />
            </Field>
            <Field label="ขนาดตัวอักษร">
              <div className="flex gap-2 flex-wrap mt-1">
                {(["sm", "md", "lg", "xl"] as const).map((sz) => (
                  <button key={sz} type="button" onClick={() => patch("hero", { size: sz })}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      s.hero.size === sz ? "bg-[#DC2626] border-[#DC2626] text-white" : "border-white/10 text-slate-400 hover:text-white"
                    )}>
                    {sz === "sm" ? "เล็ก" : sz === "md" ? "กลาง" : sz === "lg" ? "ใหญ่" : "ใหญ่มาก"}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <div className="pt-1">
          <PreviewLabel />
          <div className="bg-[#0A0808] rounded-xl p-5">
            <h1 className={cn("font-bold leading-tight text-white", SIZE_CLASSES[s.hero.size])}>
              {s.hero.line1 || "บรรทัด 1"}<br />
              <span style={{ color: s.hero.line2_color }}>{s.hero.line2 || "บรรทัด 2"}</span><br />
              {s.hero.line3 || "บรรทัด 3"}
            </h1>
          </div>
        </div>
      </Section>

      {/* ── Hero subtext + CTA ── */}
      <Section title="Hero — คำอธิบายและปุ่ม" subtitle="ข้อความรองและปุ่ม CTA">
        <Field label="คำอธิบาย (ใต้หัวเรื่อง)">
          <textarea value={s.hero.subtext} onChange={(e) => patch("hero", { subtext: e.target.value })} rows={2} className={cn(inputCls, "resize-none")} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="ปุ่มหลัก (Line OA)">
            <input value={s.hero.cta1_text} onChange={(e) => patch("hero", { cta1_text: e.target.value })} className={inputCls} />
          </Field>
          <Field label="ปุ่มรอง (Portfolio)">
            <input value={s.hero.cta2_text} onChange={(e) => patch("hero", { cta2_text: e.target.value })} className={inputCls} />
          </Field>
        </div>
      </Section>

      {/* ── Stats ── */}
      <Section title="ตัวเลขสถิติ" subtitle="3 ช่องตัวเลขใต้ Hero">
        <div className="grid grid-cols-3 gap-3">
          {s.stats.map((stat, i) => (
            <div key={i} className="space-y-2">
              <Field label={`ช่อง ${i + 1} — ตัวเลข`}>
                <input value={stat.value} onChange={(e) => patchStats(i, "value", e.target.value)} placeholder="800M+" className={inputCls} />
              </Field>
              <Field label="คำบรรยาย">
                <input value={stat.label} onChange={(e) => patchStats(i, "label", e.target.value)} placeholder="GMV รวม" className={inputCls} />
              </Field>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 bg-[#0A0808] rounded-xl p-4">
          {s.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-bold text-xl text-[#F59E0B]">{stat.value || "—"}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label || "—"}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Services section header ── */}
      <Section title='บริการของเรา — หัวข้อ Section' subtitle="Badge, H2 และคำอธิบาย">
        <p className="text-slate-600 text-xs -mt-2">การ์ดบริการแต่ละใบจัดการได้ที่ /admin/services</p>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Badge (ป้ายบนสุด)">
            <input value={s.services_section.badge} onChange={(e) => patch("services_section", { badge: e.target.value })} className={inputCls} />
          </Field>
          <Field label="หัวข้อหลัก (H2)">
            <input value={s.services_section.heading} onChange={(e) => patch("services_section", { heading: e.target.value })} className={inputCls} />
          </Field>
        </div>

        {/* Typography group */}
        <div className="rounded-xl border border-white/5 bg-[#0A0808] p-4 space-y-3">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold">Typography — หัวข้อหลัก</p>
          <Field label="สี">
            <ColorPicker
              value={s.services_section.heading_color || "#FFFFFF"}
              onChange={(v) => patch("services_section", { heading_color: v })}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="ขนาด">
              <div className="flex gap-2 flex-wrap mt-1">
                {(["sm", "md", "lg", "xl"] as const).map((sz) => (
                  <button key={sz} type="button" onClick={() => patch("services_section", { heading_size: sz })}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      s.services_section.heading_size === sz ? "bg-[#DC2626] border-[#DC2626] text-white" : "border-white/10 text-slate-400 hover:text-white"
                    )}>
                    {sz === "sm" ? "เล็ก" : sz === "md" ? "กลาง" : sz === "lg" ? "ใหญ่" : "ใหญ่มาก"}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="น้ำหนัก">
              <div className="flex gap-2 flex-wrap mt-1">
                {WEIGHT_OPTIONS.map((w) => (
                  <button key={w.value} type="button" onClick={() => patch("services_section", { heading_weight: w.value })}
                    className={cn("px-3 py-1.5 rounded-lg text-xs border transition-all", w.cls,
                      s.services_section.heading_weight === w.value ? "bg-[#DC2626] border-[#DC2626] text-white" : "border-white/10 text-slate-400 hover:text-white"
                    )}>
                    {w.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <Field label="คำอธิบาย (ใต้หัวข้อ)">
          <textarea value={s.services_section.subtext} onChange={(e) => patch("services_section", { subtext: e.target.value })} rows={3} className={cn(inputCls, "resize-none")} />
        </Field>

        <div>
          <PreviewLabel />
          <div className="bg-[#0A0808] rounded-xl p-6 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/40 text-[#DC2626] text-sm font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                {s.services_section.badge || "บริการของเรา"}
              </span>
            </div>
            <h2
              className={cn("text-3xl leading-tight", {
                "font-light":     s.services_section.heading_weight === "light",
                "font-normal":    s.services_section.heading_weight === "normal",
                "font-semibold":  s.services_section.heading_weight === "semibold",
                "font-bold":      !s.services_section.heading_weight || s.services_section.heading_weight === "bold",
                "font-extrabold": s.services_section.heading_weight === "extrabold",
              })}
              style={{ color: s.services_section.heading_color || "#FFFFFF" }}
            >
              {s.services_section.heading || "หัวข้อหลัก"}
            </h2>
            <p className="text-slate-500 mt-4 max-w-lg mx-auto leading-loose font-light text-sm">
              {s.services_section.subtext || "คำอธิบาย..."}
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#DC2626]/50" />
              <div className="w-2 h-2 rounded-full bg-[#DC2626]/70" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#DC2626]/50" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Why us ── */}
      <Section title="ทำไมต้องเลือก NP Create" subtitle="หัวข้อ, คำอธิบาย, 4 เหตุผล">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Badge">
            <input value={s.why_us.badge} onChange={(e) => patch("why_us", { badge: e.target.value })} className={inputCls} />
          </Field>
          <Field label="หัวข้อหลัก">
            <input value={s.why_us.heading} onChange={(e) => patch("why_us", { heading: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="คำอธิบาย">
          <textarea value={s.why_us.subtext} onChange={(e) => patch("why_us", { subtext: e.target.value })} rows={2} className={cn(inputCls, "resize-none")} />
        </Field>
        <Field label="ปุ่ม CTA">
          <input value={s.why_us.cta_text} onChange={(e) => patch("why_us", { cta_text: e.target.value })} className={inputCls} />
        </Field>

        <div className="space-y-3">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold">4 เหตุผล</p>
          {s.why_us.reasons.map((r, i) => (
            <div key={i} className="bg-[#0A0808] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-[#DC2626]/20 text-[#DC2626] text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-slate-500 text-xs">เหตุผลข้อ {i + 1}</span>
              </div>
              <Field label="หัวข้อ">
                <input value={r.title} onChange={(e) => patchReason(i, "title", e.target.value)} className={inputCls} />
              </Field>
              <Field label="คำอธิบาย">
                <textarea value={r.description} rows={2} onChange={(e) => patchReason(i, "description", e.target.value)} className={cn(inputCls, "resize-none")} />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA section ── */}
      <Section title="CTA Section (ล่างสุด)" subtitle="ปุ่มเชิญชวนติดต่อ">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="หัวข้อบรรทัด 1">
            <input value={s.cta_section.heading} onChange={(e) => patch("cta_section", { heading: e.target.value })} className={inputCls} />
          </Field>
          <Field label="บรรทัด 2 (เน้นสี)">
            <input value={s.cta_section.heading_highlight} onChange={(e) => patch("cta_section", { heading_highlight: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="คำอธิบาย">
          <textarea value={s.cta_section.subtext} onChange={(e) => patch("cta_section", { subtext: e.target.value })} rows={2} className={cn(inputCls, "resize-none")} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="ปุ่ม CTA">
            <input value={s.cta_section.cta_text} onChange={(e) => patch("cta_section", { cta_text: e.target.value })} className={inputCls} />
          </Field>
          <Field label="ข้อความใต้ปุ่ม">
            <input value={s.cta_section.footer_text} onChange={(e) => patch("cta_section", { footer_text: e.target.value })} className={inputCls} />
          </Field>
        </div>
      </Section>

      <div className="pb-8" />
    </form>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div>
          <h2 className="text-white font-semibold text-sm">{title}</h2>
          {subtitle && <p className="text-slate-600 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown
          size={16}
          className={cn("text-slate-500 transition-transform shrink-0 ml-4", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-4 space-y-4 border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-slate-400 text-xs font-medium">{label}</label>
      {children}
    </div>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-1">
      {COLOR_PRESETS.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.label}
          onClick={() => onChange(c.value)}
          className={cn(
            "w-7 h-7 rounded-lg border-2 transition-all",
            value === c.value ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
          )}
          style={{ backgroundColor: c.value }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5"
        title="เลือกสีเอง"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#FFFFFF"
        className="w-24 bg-[#0A0808] border border-white/10 rounded-lg px-2 py-1 text-white text-base font-mono focus:outline-none focus:border-[#DC2626]/50"
      />
    </div>
  )
}

function CharCount({ value, max }: { value: string; max: number }) {
  const pct = value.length / max
  return (
    <span className={cn("text-[10px] tabular-nums",
      pct >= 1 ? "text-red-400" : pct >= 0.85 ? "text-amber-400" : "text-slate-600"
    )}>
      {value.length}/{max}
    </span>
  )
}

function PreviewLabel() {
  return <p className="text-slate-600 text-[10px] uppercase tracking-widest mb-2">ตัวอย่าง</p>
}

const inputCls =
  "w-full bg-[#0A0808] border border-white/10 rounded-xl px-3 py-2 text-white text-base placeholder:text-slate-600 focus:outline-none focus:border-[#DC2626]/50 focus:ring-2 focus:ring-[#DC2626]/20 transition-colors"
