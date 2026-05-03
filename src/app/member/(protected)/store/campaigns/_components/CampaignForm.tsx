"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { createCampaign, updateCampaign, type CampaignInput } from "../actions"
import type { Campaign, Product } from "@/types/database"

export function CampaignForm({ campaign, products }: { campaign?: Campaign; products: Product[] }) {
  const router = useRouter()
  const isEdit = !!campaign

  const [title, setTitle] = useState(campaign?.title ?? "")
  const [description, setDescription] = useState(campaign?.description ?? "")
  const [commissionRate, setCommissionRate] = useState(campaign?.special_commission_rate?.toString() ?? "")
  const [startsAt, setStartsAt] = useState(campaign?.starts_at ? campaign.starts_at.slice(0,16) : "")
  const [endsAt, setEndsAt] = useState(campaign?.ends_at ? campaign.ends_at.slice(0,16) : "")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(campaign?.product_ids ?? [])
  const [script, setScript] = useState(campaign?.script ?? "")
  const [bannerUrl, setBannerUrl] = useState(campaign?.banner_url ?? "")
  const [isActive, setIsActive] = useState(campaign?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function toggleProduct(id: string) {
    setSelectedProductIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError("กรุณากรอกชื่อแคมเปญ"); return }
    if (!startsAt || !endsAt) { setError("กรุณาระบุวันที่เริ่มและสิ้นสุด"); return }
    if (new Date(endsAt) <= new Date(startsAt)) { setError("วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น"); return }
    setError(null)

    const data: CampaignInput = {
      title, description,
      special_commission_rate: commissionRate ? Number(commissionRate) : null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      product_ids: selectedProductIds,
      script, banner_url: bannerUrl,
      is_active: isActive,
    }

    start(async () => {
      try {
        if (isEdit && campaign) { await updateCampaign(campaign.id, data) }
        else { await createCampaign(data) }
        router.push("/member/store/campaigns")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-white font-semibold text-sm">ข้อมูลแคมเปญ</h2>
        <Field label="ชื่อแคมเปญ *">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น Flash Sale สุดสัปดาห์" required className={inputCls()} />
        </Field>
        <Field label="คำอธิบาย">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="รายละเอียดแคมเปญ..." className={cn(inputCls(), "resize-none")} />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="คอมมิชชันพิเศษ (%)">
            <div className="relative">
              <input type="number" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} min="0" max="100" step="0.1" placeholder="15" className={cn(inputCls(), "pr-8")} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F59E0B] font-bold text-sm">%</span>
            </div>
          </Field>
          <Field label="วันที่เริ่ม *">
            <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} required className={inputCls()} />
          </Field>
          <Field label="วันที่สิ้นสุด *">
            <input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} required className={inputCls()} />
          </Field>
        </div>
      </div>

      {products.length > 0 && (
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-3">
          <h2 className="text-white font-semibold text-sm">สินค้าที่เข้าร่วม ({selectedProductIds.length} เลือก)</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {products.map(p => (
              <label key={p.id} className={cn(
                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                selectedProductIds.includes(p.id)
                  ? "border-[#DC2626]/40 bg-[#DC2626]/5"
                  : "border-white/5 hover:border-white/10"
              )}>
                <input type="checkbox" checked={selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="accent-[#DC2626]" />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[#F59E0B] text-xs">฿{p.price.toLocaleString()} · {p.commission_rate}%</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-white font-semibold text-sm">Content สำหรับ Affiliate</h2>
        <Field label="Script แนะนำ (Affiliate ใช้พูดในคลิป)">
          <textarea value={script} onChange={e => setScript(e.target.value)} rows={4} placeholder="เขียน script ที่อยากให้ Affiliate พูดถึงสินค้าของคุณ..." className={cn(inputCls(), "resize-none")} />
        </Field>
        <Field label="URL แบนเนอร์ (รูปโปรโมท)">
          <input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="https://..." className={inputCls()} />
          {bannerUrl && <img src={bannerUrl} alt="" className="mt-2 h-24 object-cover rounded-xl bg-white/5 w-full" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />}
        </Field>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsActive(v => !v)}
            className={cn("relative w-12 h-6 rounded-full transition-colors shrink-0", isActive ? "bg-emerald-500" : "bg-white/10")}>
            <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", isActive ? "translate-x-6" : "translate-x-0.5")} />
          </button>
          <span className="text-sm text-slate-400">{isActive ? "แคมเปญ active" : "แคมเปญปิด"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {pending ? "กำลังบันทึก..." : isEdit ? "บันทึกการเปลี่ยนแปลง" : "สร้างแคมเปญ"}
        </button>
        <button type="button" onClick={() => router.back()} className="text-slate-400 hover:text-white text-sm transition-colors">
          ยกเลิก
        </button>
      </div>
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
