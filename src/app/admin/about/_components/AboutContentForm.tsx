"use client"

import { useState, useTransition } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateAboutContent } from "../actions"
import type { AboutContent } from "@/lib/data/about-content"

export function AboutContentForm({ initial }: { initial: AboutContent }) {
  const [data, setData]   = useState<AboutContent>(initial)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [pending, startTransition] = useTransition()

  function set<K extends keyof AboutContent>(field: K, value: AboutContent[K]) {
    setData(prev => ({ ...prev, [field]: value }))
    setStatus("idle")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateAboutContent(data)
        setStatus("ok")
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
        setStatus("error")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "ok" && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">
          บันทึกสำเร็จ
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Hero */}
      <Card title="Hero Section">
        <Field label="Headline">
          <input value={data.hero_headline} onChange={e => set("hero_headline", e.target.value)}
            className={input()} placeholder="ทีมผู้เชี่ยวชาญ..." />
        </Field>
        <Field label="ย่อหน้าที่ 1">
          <textarea value={data.hero_desc1} onChange={e => set("hero_desc1", e.target.value)}
            rows={3} className={cn(input(), "resize-none")} />
        </Field>
        <Field label="ย่อหน้าที่ 2">
          <textarea value={data.hero_desc2} onChange={e => set("hero_desc2", e.target.value)}
            rows={3} className={cn(input(), "resize-none")} />
        </Field>
      </Card>

      {/* Stats */}
      <Card title="สถิติ (Stats)">
        <div className="space-y-3">
          {data.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <Field label={`ตัวเลข ${i + 1}`}>
                <input value={stat.value}
                  onChange={e => set("stats", data.stats.map((s, j) => j === i ? { ...s, value: e.target.value } : s))}
                  className={input()} placeholder="800M+" />
              </Field>
              <Field label="ชื่อ">
                <input value={stat.label}
                  onChange={e => set("stats", data.stats.map((s, j) => j === i ? { ...s, label: e.target.value } : s))}
                  className={input()} placeholder="GMV รวม (บาท)" />
              </Field>
            </div>
          ))}
        </div>
      </Card>

      {/* Story */}
      <Card title="เรื่องราว (Story)">
        <Field label="หัวข้อ">
          <input value={data.story_title} onChange={e => set("story_title", e.target.value)}
            className={input()} placeholder="จากการทดลอง สู่ผลลัพธ์..." />
        </Field>
        <Field label="ย่อหน้าที่ 1">
          <textarea value={data.story_desc1} onChange={e => set("story_desc1", e.target.value)}
            rows={3} className={cn(input(), "resize-none")} />
        </Field>
        <Field label="ย่อหน้าที่ 2">
          <textarea value={data.story_desc2} onChange={e => set("story_desc2", e.target.value)}
            rows={3} className={cn(input(), "resize-none")} />
        </Field>
      </Card>

      {/* Milestones */}
      <Card title="Timeline / Milestones">
        <div className="space-y-4">
          {data.milestones.map((m, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-medium">Milestone {i + 1}</span>
                <button type="button" onClick={() => set("milestones", data.milestones.filter((_, j) => j !== i))}
                  className="text-red-500/60 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="ปี">
                  <input value={m.year}
                    onChange={e => set("milestones", data.milestones.map((x, j) => j === i ? { ...x, year: e.target.value } : x))}
                    className={input()} placeholder="2024" />
                </Field>
                <div className="col-span-2">
                  <Field label="หัวข้อ">
                    <input value={m.title}
                      onChange={e => set("milestones", data.milestones.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                      className={input()} placeholder="GMV Max" />
                  </Field>
                </div>
              </div>
              <Field label="คำอธิบาย">
                <input value={m.desc}
                  onChange={e => set("milestones", data.milestones.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))}
                  className={input()} placeholder="..." />
              </Field>
            </div>
          ))}
          <button type="button"
            onClick={() => set("milestones", [...data.milestones, { year: "", title: "", desc: "" }])}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl transition-colors w-full justify-center">
            <Plus size={14} /> เพิ่ม Milestone
          </button>
        </div>
      </Card>

      {/* Values */}
      <Card title="ค่านิยม (Values)">
        <div className="space-y-4">
          {data.values.map((v, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-medium">ค่านิยม {i + 1}</span>
                <button type="button" onClick={() => set("values", data.values.filter((_, j) => j !== i))}
                  className="text-red-500/60 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <Field label="หัวข้อ">
                <input value={v.title}
                  onChange={e => set("values", data.values.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                  className={input()} placeholder="เน้นผลลัพธ์จริง" />
              </Field>
              <Field label="คำอธิบาย">
                <textarea value={v.description}
                  onChange={e => set("values", data.values.map((x, j) => j === i ? { ...x, description: e.target.value } : x))}
                  rows={2} className={cn(input(), "resize-none")} placeholder="..." />
              </Field>
            </div>
          ))}
          <button type="button"
            onClick={() => set("values", [...data.values, { title: "", description: "" }])}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl transition-colors w-full justify-center">
            <Plus size={14} /> เพิ่มค่านิยม
          </button>
        </div>
      </Card>

      {/* Boutique */}
      <Card title="ส่วน คุณภาพ > ปริมาณ">
        <Field label="หัวข้อ">
          <input value={data.boutique_title} onChange={e => set("boutique_title", e.target.value)}
            className={input()} placeholder="คุณภาพ > ปริมาณ" />
        </Field>
        <Field label="ข้อความ">
          <textarea value={data.boutique_desc} onChange={e => set("boutique_desc", e.target.value)}
            rows={3} className={cn(input(), "resize-none")} />
        </Field>
        <Field label="จุดเด่น (bullet points)">
          <div className="space-y-2">
            {data.boutique_items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={item}
                  onChange={e => set("boutique_items", data.boutique_items.map((x, j) => j === i ? e.target.value : x))}
                  className={cn(input(), "flex-1")} placeholder="จุดเด่น..." />
                <button type="button" onClick={() => set("boutique_items", data.boutique_items.filter((_, j) => j !== i))}
                  className="text-red-500/60 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button"
              onClick={() => set("boutique_items", [...data.boutique_items, ""])}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl transition-colors w-full justify-center">
              <Plus size={14} /> เพิ่มจุดเด่น
            </button>
          </div>
        </Field>
      </Card>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          {pending && <Loader2 size={14} className="animate-spin" />}
          บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </form>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-4">
      <h2 className="text-white font-semibold text-sm border-b border-white/5 pb-3">{title}</h2>
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

function input() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-3 py-2 text-white text-sm",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}
