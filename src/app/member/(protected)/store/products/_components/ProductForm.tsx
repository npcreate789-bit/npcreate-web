"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { createProduct, updateProduct, type ProductInput } from "../actions"
import type { Product } from "@/types/database"

const TAGS_PRESET = ["best_seller","flash_sale","new","limited","recommended"]
const STOCK_OPTIONS = [
  { value: "in_stock", label: "มีสินค้า" },
  { value: "low_stock", label: "สินค้าใกล้หมด" },
  { value: "out_of_stock", label: "สินค้าหมด" },
]

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const isEdit = !!product

  const [name, setName] = useState(product?.name ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [price, setPrice] = useState(product?.price?.toString() ?? "")
  const [originalPrice, setOriginalPrice] = useState(product?.original_price?.toString() ?? "")
  const [commissionRate, setCommissionRate] = useState(product?.commission_rate?.toString() ?? "8")
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "")
  const [tiktokUrl, setTiktokUrl] = useState(product?.tiktok_product_url ?? "")
  const [tags, setTags] = useState(product?.tags?.join(", ") ?? "")
  const [stockStatus, setStockStatus] = useState(product?.stock_status ?? "in_stock")
  const [monthlySales, setMonthlySales] = useState(product?.monthly_sales_est?.toString() ?? "0")
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [promotionText, setPromotionText] = useState(product?.promotion_text ?? "")
  const [captionSuggestions, setCaptionSuggestions] = useState(product?.caption_suggestions ?? "")
  const [forbiddenWords, setForbiddenWords] = useState(product?.forbidden_words ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError("กรุณากรอกชื่อสินค้า"); return }
    if (!price || isNaN(Number(price))) { setError("กรุณากรอกราคาสินค้า"); return }
    if (isNaN(Number(commissionRate)) || Number(commissionRate) < 0 || Number(commissionRate) > 100) {
      setError("คอมมิชชันต้องเป็น 0–100"); return
    }
    setError(null)

    const data: ProductInput = {
      name, description,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      commission_rate: Number(commissionRate),
      image_url: imageUrl,
      tiktok_product_url: tiktokUrl,
      tags,
      stock_status: stockStatus,
      monthly_sales_est: Number(monthlySales) || 0,
      is_active: isActive,
      promotion_text:      promotionText,
      caption_suggestions: captionSuggestions,
      forbidden_words:     forbiddenWords,
    }

    start(async () => {
      try {
        if (isEdit && product) {
          await updateProduct(product.id, data)
        } else {
          await createProduct(data)
        }
        router.push("/member/store/products")
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
        <h2 className="text-white font-semibold text-sm">ข้อมูลสินค้า</h2>
        <Field label="ชื่อสินค้า *">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อสินค้า" required className={inputCls()} />
        </Field>
        <Field label="คำอธิบาย">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="อธิบายสินค้า..." className={cn(inputCls(), "resize-none")} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="ราคาขาย (บาท) *">
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="299" min="0" step="0.01" required className={inputCls()} />
          </Field>
          <Field label="ราคาเดิม (บาท)">
            <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="399" min="0" step="0.01" className={inputCls()} />
          </Field>
        </div>
      </div>

      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-white font-semibold text-sm">Affiliate & คอมมิชชัน</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="คอมมิชชัน (%) *">
            <div className="relative">
              <input type="number" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} min="0" max="100" step="0.1" placeholder="8" required className={cn(inputCls(), "pr-8")} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F59E0B] font-bold text-sm">%</span>
            </div>
          </Field>
          <Field label="ยอดขายโดยประมาณ/เดือน">
            <input type="number" value={monthlySales} onChange={e => setMonthlySales(e.target.value)} min="0" placeholder="0" className={inputCls()} />
          </Field>
        </div>
        <Field label="ลิงก์สินค้า TikTok">
          <input value={tiktokUrl} onChange={e => setTiktokUrl(e.target.value)} placeholder="https://www.tiktok.com/..." className={inputCls()} />
        </Field>
      </div>

      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-white font-semibold text-sm">รายละเอียดเพิ่มเติม</h2>
        <Field label="URL รูปสินค้า">
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className={inputCls()} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {imageUrl && <img src={imageUrl} alt="" className="mt-2 h-24 w-24 object-cover rounded-xl bg-white/5" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />}
        </Field>
        <Field label="แท็ก (คั่นด้วยจุลภาค)">
          <div className="flex flex-wrap gap-2 mb-2">
            {TAGS_PRESET.map(t => (
              <button key={t} type="button"
                onClick={() => setTags(prev => prev ? `${prev}, ${t}` : t)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5">
                + {t}
              </button>
            ))}
          </div>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="best_seller, flash_sale" className={inputCls()} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="สถานะสต็อก">
            <select value={stockStatus} onChange={e => setStockStatus(e.target.value as "in_stock" | "low_stock" | "out_of_stock")} className={inputCls()}>
              {STOCK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="แสดงสินค้า">
            <div className="flex items-center gap-3 h-[46px]">
              <button type="button" onClick={() => setIsActive(v => !v)}
                className={cn("relative w-12 h-6 rounded-full transition-colors shrink-0", isActive ? "bg-emerald-500" : "bg-white/10")}>
                <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200", isActive ? "translate-x-6" : "translate-x-0")} />
              </button>
              <span className="text-sm text-slate-400">{isActive ? "แสดงอยู่" : "ซ่อนอยู่"}</span>
            </div>
          </Field>
        </div>
      </div>

      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-white font-semibold text-sm">ข้อมูลสำหรับ Affiliate</h2>
        <Field label="ข้อความโปรโมชัน">
          <textarea value={promotionText} onChange={e => setPromotionText(e.target.value)} rows={2} placeholder="เช่น ลด 20% เฉพาะ Affiliate ที่ร่วมรายการ..." className={cn(inputCls(), "resize-none")} />
        </Field>
        <Field label="แนะนำ Caption">
          <textarea value={captionSuggestions} onChange={e => setCaptionSuggestions(e.target.value)} rows={3} placeholder="ตัวอย่าง caption สำหรับ Affiliate ใช้ในการทำคอนเทนต์..." className={cn(inputCls(), "resize-none")} />
        </Field>
        <Field label="คำต้องห้าม">
          <textarea value={forbiddenWords} onChange={e => setForbiddenWords(e.target.value)} rows={2} placeholder="คำหรือข้อความที่ห้าม Affiliate ใช้..." className={cn(inputCls(), "resize-none")} />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {pending ? "กำลังบันทึก..." : isEdit ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มสินค้า"}
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
