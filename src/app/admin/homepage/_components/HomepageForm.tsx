"use client"

import { useState, useTransition } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
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
  { label: "ทอง", value: "#F59E0B" },
  { label: "ขาว", value: "#FFFFFF" },
  { label: "เขียว", value: "#10B981" },
  { label: "ม่วง", value: "#6366F1" },
]

interface Props {
  initial: HomepageSettings
}

export function HomepageForm({ initial }: Props) {
  const [s, setS] = useState<HomepageSettings>(initial)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generic section updater
  function patch<K extends keyof HomepageSettings>(
    section: K,
    value: Partial<HomepageSettings[K]>
  ) {
    setS((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as object), ...(value as object) },
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await updateHomepageSettings(s)
        setSaved(true)
        setTimeout(() => setSaved(false), 4000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Save bar — sticky so it stays visible while scrolling */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-[#1C0D0D]/95 backdrop-blur-sm border border-white/5 rounded-2xl px-5 py-3">
        <p className="text-slate-400 text-sm">แก้ไขเนื้อหาหน้าแรก — บันทึกแล้วอัปเดตทันที</p>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle2 size={14} /> บันทึกแล้ว
            </span>
          )}
          {error && <span className="text-red-400 text-sm">{error}</span>}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            บันทึกทั้งหมด
          </button>
        </div>
      </div>

      {/* ── Promotion badge ── */}
      <Section title="Promotion Badge (แถบข้อความบนสุด)">
        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={s.promo.visible}
              onChange={(e) => patch("promo", { visible: e.target.checked })}
              className="w-4 h-4 accent-[#DC2626]"
            />
            <span className="text-slate-300 text-sm">แสดงบนหน้าเว็บ</span>
          </label>
        </div>
        <Field label="ข้อความ">
          <input
            value={s.promo.text}
            onChange={(e) => patch("promo", { text: e.target.value })}
            placeholder="รับลูกค้าใหม่ เดือน พ.ค. นี้ — เหลืออีก 3 สล็อต"
            className={inputCls}
          />
        </Field>
        {/* Preview */}
        {s.promo.visible && (
          <div className="mt-3">
            <p className="text-slate-600 text-[10px] uppercase tracking-widest mb-1.5">ตัวอย่าง</p>
            <div className="inline-flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#FCA5A5] text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
              {s.promo.text || "ข้อความ..."}
            </div>
          </div>
        )}
      </Section>

      {/* ── Hero heading ── */}
      <Section title="Hero — ข้อความหลัก (H1)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="บรรทัด 1">
            <input
              value={s.hero.line1}
              onChange={(e) => patch("hero", { line1: e.target.value })}
              placeholder="ปั้นยอดขาย TikTok Shop"
              className={inputCls}
            />
          </Field>
          <Field label="บรรทัด 2 (สี)">
            <input
              value={s.hero.line2}
              onChange={(e) => patch("hero", { line2: e.target.value })}
              placeholder="ให้โต 10 เท่า"
              className={inputCls}
            />
          </Field>
          <Field label="บรรทัด 3">
            <input
              value={s.hero.line3}
              onChange={(e) => patch("hero", { line3: e.target.value })}
              placeholder="ด้วย GMV Max"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Color picker */}
        <Field label="สีบรรทัด 2">
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => patch("hero", { line2_color: c.value })}
                className={cn(
                  "w-8 h-8 rounded-lg border-2 transition-all",
                  s.hero.line2_color === c.value
                    ? "border-white scale-110"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
            <div className="flex items-center gap-2 ml-1">
              <input
                type="color"
                value={s.hero.line2_color}
                onChange={(e) => patch("hero", { line2_color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                title="เลือกสีเอง"
              />
              <input
                value={s.hero.line2_color}
                onChange={(e) => patch("hero", { line2_color: e.target.value })}
                placeholder="#DC2626"
                className="w-24 bg-[#0A0808] border border-white/10 rounded-lg px-2 py-1 text-white text-base font-mono focus:outline-none focus:border-[#DC2626]/50"
              />
            </div>
          </div>
        </Field>

        {/* Font size */}
        <Field label="ขนาดตัวอักษร">
          <div className="flex gap-2 flex-wrap mt-1">
            {(["sm", "md", "lg", "xl"] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => patch("hero", { size: sz })}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium border transition-all",
                  s.hero.size === sz
                    ? "bg-[#DC2626] border-[#DC2626] text-white"
                    : "border-white/10 text-slate-400 hover:text-white"
                )}
              >
                {sz === "sm" ? "เล็ก" : sz === "md" ? "กลาง" : sz === "lg" ? "ใหญ่" : "ใหญ่มาก"}
              </button>
            ))}
          </div>
        </Field>

        {/* Preview */}
        <div className="mt-3 bg-[#0A0808] rounded-xl p-5">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest mb-2">ตัวอย่าง</p>
          <h1 className={cn("font-bold leading-tight text-white", SIZE_CLASSES[s.hero.size])}>
            {s.hero.line1 || "บรรทัด 1"}
            <br />
            <span style={{ color: s.hero.line2_color }}>{s.hero.line2 || "บรรทัด 2"}</span>
            <br />
            {s.hero.line3 || "บรรทัด 3"}
          </h1>
        </div>
      </Section>

      {/* ── Hero subtext + CTA ── */}
      <Section title="Hero — คำอธิบายและปุ่ม">
        <Field label="คำอธิบาย (ใต้หัวเรื่อง)">
          <textarea
            value={s.hero.subtext}
            onChange={(e) => patch("hero", { subtext: e.target.value })}
            rows={3}
            className={cn(inputCls, "resize-none")}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="ปุ่มหลัก (Line OA)">
            <input
              value={s.hero.cta1_text}
              onChange={(e) => patch("hero", { cta1_text: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="ปุ่มรอง (Portfolio)">
            <input
              value={s.hero.cta2_text}
              onChange={(e) => patch("hero", { cta2_text: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* ── Stats ── */}
      <Section title="ตัวเลขสถิติ (3 ช่อง)">
        <div className="space-y-3">
          {s.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 items-end">
              <Field label={`ช่อง ${i + 1} — ตัวเลข`}>
                <input
                  value={stat.value}
                  onChange={(e) => {
                    const next = [...s.stats]
                    next[i] = { ...next[i], value: e.target.value }
                    setS((prev) => ({ ...prev, stats: next }))
                  }}
                  placeholder="800M+"
                  className={inputCls}
                />
              </Field>
              <Field label="คำบรรยาย">
                <input
                  value={stat.label}
                  onChange={(e) => {
                    const next = [...s.stats]
                    next[i] = { ...next[i], label: e.target.value }
                    setS((prev) => ({ ...prev, stats: next }))
                  }}
                  placeholder="GMV รวม (บาท)"
                  className={inputCls}
                />
              </Field>
            </div>
          ))}
        </div>
        {/* Preview */}
        <div className="mt-4 grid grid-cols-3 gap-4 bg-[#0A0808] rounded-xl p-4">
          {s.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-bold text-xl text-[#F59E0B]">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Services section header ── */}
      <Section title='ส่วน "บริการของเรา" — หัวข้อ'>
        <p className="text-slate-600 text-xs -mt-2 mb-3">การ์ดบริการจัดการได้ที่ /admin/services</p>
        <div className="space-y-3">
          <Field label="Badge">
            <input value={s.services_section.badge} onChange={(e) => patch("services_section", { badge: e.target.value })} className={inputCls} />
          </Field>
          <Field label="หัวข้อหลัก">
            <input value={s.services_section.heading} onChange={(e) => patch("services_section", { heading: e.target.value })} className={inputCls} />
          </Field>
          <Field label="คำอธิบาย">
            <input value={s.services_section.subtext} onChange={(e) => patch("services_section", { subtext: e.target.value })} className={inputCls} />
          </Field>
        </div>
      </Section>

      {/* ── Why us ── */}
      <Section title='ส่วน "ทำไมต้องเลือก NP Create"'>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
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

        <div className="mt-4 space-y-4">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">4 เหตุผล</p>
          {s.why_us.reasons.map((r, i) => (
            <div key={i} className="bg-[#0A0808] rounded-xl p-4 space-y-2">
              <Field label={`ข้อ ${i + 1} — หัวข้อ`}>
                <input
                  value={r.title}
                  onChange={(e) => {
                    const next = [...s.why_us.reasons]
                    next[i] = { ...next[i], title: e.target.value }
                    setS((prev) => ({ ...prev, why_us: { ...prev.why_us, reasons: next } }))
                  }}
                  className={inputCls}
                />
              </Field>
              <Field label="คำอธิบาย">
                <textarea
                  value={r.description}
                  rows={2}
                  onChange={(e) => {
                    const next = [...s.why_us.reasons]
                    next[i] = { ...next[i], description: e.target.value }
                    setS((prev) => ({ ...prev, why_us: { ...prev.why_us, reasons: next } }))
                  }}
                  className={cn(inputCls, "resize-none")}
                />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA section ── */}
      <Section title="ส่วน CTA (ล่างสุด)">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="หัวข้อบรรทัด 1">
            <input value={s.cta_section.heading} onChange={(e) => patch("cta_section", { heading: e.target.value })} className={inputCls} />
          </Field>
          <Field label="หัวข้อบรรทัด 2 (เน้นสี)">
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

      {/* Bottom save */}
      <div className="flex justify-end pb-8">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          บันทึกทั้งหมด
        </button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-4">
      <h2 className="text-white font-semibold text-sm">{title}</h2>
      {children}
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

const inputCls =
  "w-full bg-[#0A0808] border border-white/10 rounded-xl px-3 py-2 text-white text-base placeholder:text-slate-600 focus:outline-none focus:border-[#DC2626]/50 focus:ring-2 focus:ring-[#DC2626]/20 transition-colors"
