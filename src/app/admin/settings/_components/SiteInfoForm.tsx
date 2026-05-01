"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateSiteInfo } from "../actions"
import type { SiteInfo } from "@/lib/data/site-info"

export function SiteInfoForm({ initial }: { initial: SiteInfo }) {
  const [data, setData] = useState<SiteInfo>(initial)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [pending, startTransition] = useTransition()

  function set(field: keyof SiteInfo, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
    setStatus("idle")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("idle")
    startTransition(async () => {
      try {
        await updateSiteInfo(data)
        setStatus("ok")
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
        setStatus("error")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {/* ชื่อและ Tagline */}
      <Card title="ชื่อและ Tagline">
        <Field label="ชื่อบริษัท">
          <input value={data.site_name} onChange={(e) => set("site_name", e.target.value)}
            className={input()} placeholder="NP Create" />
        </Field>
        <Field label="Tagline (แสดงใน Footer และ SEO)">
          <textarea value={data.tagline} onChange={(e) => set("tagline", e.target.value)}
            rows={2} className={cn(input(), "resize-none")}
            placeholder="ปั้นยอดขาย TikTok Shop ของคุณให้โต 10 เท่า ด้วย GMV Max" />
        </Field>
      </Card>

      {/* ช่องทางติดต่อ */}
      <Card title="ช่องทางติดต่อ">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="LINE OA ID" hint="ใส่ ID เพื่อ generate ลิงก์อัตโนมัติ เช่น @npcreate">
            <input value={data.line_oa_id} onChange={(e) => set("line_oa_id", e.target.value)}
              className={input()} placeholder="@npcreate" />
          </Field>
          <Field label="LINE OA URL (optional)" hint="ปล่อยว่างเพื่อ auto-generate จาก ID ด้านซ้าย">
            <input value={data.line_oa_url} onChange={(e) => set("line_oa_url", e.target.value)}
              className={input()} placeholder="https://line.me/R/ti/p/~npcreate" />
          </Field>
          <Field label="เบอร์โทรศัพท์">
            <input value={data.phone} onChange={(e) => set("phone", e.target.value)}
              className={input()} placeholder="0xx-xxx-xxxx" />
          </Field>
          <Field label="อีเมล">
            <input type="email" value={data.email} onChange={(e) => set("email", e.target.value)}
              className={input()} placeholder="hello@npcreate.co.th" />
          </Field>
        </div>
        <Field label="ที่อยู่">
          <textarea value={data.address} onChange={(e) => set("address", e.target.value)}
            rows={2} className={cn(input(), "resize-none")} placeholder="ที่อยู่บริษัท" />
        </Field>
      </Card>

      {/* Social Media */}
      <Card title="Social Media">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Facebook URL">
            <input value={data.facebook_url} onChange={(e) => set("facebook_url", e.target.value)}
              className={input()} placeholder="https://facebook.com/..." />
          </Field>
          <Field label="TikTok URL">
            <input value={data.tiktok_url} onChange={(e) => set("tiktok_url", e.target.value)}
              className={input()} placeholder="https://tiktok.com/@..." />
          </Field>
          <Field label="Instagram URL">
            <input value={data.instagram_url} onChange={(e) => set("instagram_url", e.target.value)}
              className={input()} placeholder="https://instagram.com/..." />
          </Field>
          <Field label="YouTube URL">
            <input value={data.youtube_url} onChange={(e) => set("youtube_url", e.target.value)}
              className={input()} placeholder="https://youtube.com/@..." />
          </Field>
        </div>
      </Card>

      {/* Tracking */}
      <Card title="Analytics & Tracking">
        <p className="text-slate-500 text-xs -mt-1">รหัสจะถูกเพิ่มอัตโนมัติในทุกหน้าของเว็บไซต์</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Google Analytics 4 ID">
            <input value={data.ga4_id} onChange={(e) => set("ga4_id", e.target.value)}
              className={input()} placeholder="G-XXXXXXXXXX" />
          </Field>
          <Field label="Facebook Pixel ID">
            <input value={data.fb_pixel_id} onChange={(e) => set("fb_pixel_id", e.target.value)}
              className={input()} placeholder="XXXXXXXXXXXXXXXX" />
          </Field>
        </div>
      </Card>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          บันทึกการตั้งค่า
        </button>
      </div>
    </form>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-4">
      <h2 className="text-white font-semibold text-sm">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-slate-300 text-xs font-medium">{label}</label>
      {children}
      {hint && <p className="text-slate-600 text-xs">{hint}</p>}
    </div>
  )
}

function input() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-3 py-2 text-white text-sm",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50",
    "focus:ring-[#DC2626]/20 transition-colors appearance-none",
  )
}
