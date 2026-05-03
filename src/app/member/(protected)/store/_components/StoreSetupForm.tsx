"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { createStore } from "../actions"

const CATEGORIES = ["แฟชัน","ความงาม","สุขภาพ","อาหารและเครื่องดื่ม","อิเล็กทรอนิกส์","บ้านและสวน","กีฬา","เด็กและทารก","สัตว์เลี้ยง","อื่นๆ"]

export function StoreSetupForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("อื่นๆ")
  const [tiktokUrl, setTiktokUrl] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError("กรุณากรอกชื่อร้านค้า"); return }
    setError(null)
    start(async () => {
      try {
        await createStore({ name, description, category, tiktok_shop_url: tiktokUrl, logo_url: logoUrl })
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <Field label="ชื่อร้านค้า *">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อร้านของคุณ" required className={inputCls()} />
      </Field>
      <Field label="หมวดหมู่">
        <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls()}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="คำอธิบายร้าน">
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="บอกเล่าเกี่ยวกับร้านของคุณ..." className={cn(inputCls(), "resize-none")} />
      </Field>
      <Field label="ลิงก์ TikTok Shop (ถ้ามี)">
        <input value={tiktokUrl} onChange={e => setTiktokUrl(e.target.value)} placeholder="https://shop.tiktok.com/..." className={inputCls()} />
      </Field>
      <Field label="URL โลโก้ร้านค้า (ถ้ามี)">
        <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className={inputCls()} />
      </Field>

      <button type="submit" disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
        {pending ? <><Loader2 size={14} className="animate-spin" /> กำลังสร้าง...</> : <><Store size={14} /> สร้างร้านค้า</>}
      </button>
    </form>
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
  return cn("w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-base placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors")
}
