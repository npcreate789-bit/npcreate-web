"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { productSchema, type ProductInput } from "../schema"
import { createProduct, updateProduct } from "../actions"
import type { Product, Store } from "@/types/database"

function toNum(v: unknown) {
  if (v === "" || v === null || v === undefined) return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

interface Props {
  product?: Product
  stores: Pick<Store, "id" | "name">[]
}

export function ProductForm({ product, stores }: Props) {
  const isEdit = !!product
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          store_id:            product.store_id,
          name:                product.name,
          description:         product.description ?? "",
          price:               product.price,
          original_price:      product.original_price,
          commission_rate:     product.commission_rate,
          image_url:           product.image_url ?? "",
          tiktok_product_url:  product.tiktok_product_url ?? "",
          stock_status:        product.stock_status,
          is_active:           product.is_active,
          monthly_sales_est:   product.monthly_sales_est,
          promotion_text:      product.promotion_text ?? "",
          caption_suggestions: product.caption_suggestions ?? "",
          forbidden_words:     product.forbidden_words ?? "",
          tags:                product.tags ?? [],
        }
      : {
          store_id: stores[0]?.id ?? "",
          name: "",
          description: "",
          price: 0,
          original_price: null,
          commission_rate: 10,
          image_url: "",
          tiktok_product_url: "",
          stock_status: "in_stock",
          is_active: true,
          monthly_sales_est: 0,
          promotion_text: "",
          caption_suggestions: "",
          forbidden_words: "",
          tags: [],
        },
  })

  const watched = useWatch({ control })

  const commissionEarned = (watched.price ?? 0) > 0 && (watched.commission_rate ?? 0) > 0
    ? Math.round((watched.price ?? 0) * (watched.commission_rate ?? 0) / 100)
    : 0

  const discount = (watched.original_price ?? 0) > (watched.price ?? 0)
    ? Math.round((1 - (watched.price ?? 0) / (watched.original_price ?? 1)) * 100)
    : 0

  const tagsValue = (watched.tags ?? []).join(", ")

  const onSubmit = async (data: ProductInput) => {
    setServerError(null)
    try {
      if (isEdit && product) {
        await updateProduct(product.id, data)
      } else {
        await createProduct(data)
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่")
    }
  }

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_260px] gap-8 items-start">

      {/* ── Left: form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        {/* ร้านค้า */}
        <Section title="ร้านค้า">
          <Field label="เลือกร้านค้า" error={errors.store_id?.message} required>
            <select {...register("store_id")} className={inputClass(!!errors.store_id)}>
              <option value="">— เลือกร้านค้า —</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {stores.length === 0 && (
              <p className="text-amber-400 text-xs mt-1">
                ยังไม่มีร้านค้าในระบบ — Seller ต้องสร้างร้านก่อน
              </p>
            )}
          </Field>
        </Section>

        {/* ข้อมูลสินค้า */}
        <Section title="ข้อมูลสินค้า">
          <Field label="ชื่อสินค้า" error={errors.name?.message} required>
            <input
              {...register("name")}
              placeholder="เช่น ครีมบำรุงผิว XYZ 50ml"
              className={inputClass(!!errors.name)}
            />
          </Field>
          <Field label="คำอธิบายสินค้า">
            <textarea
              {...register("description")}
              rows={3}
              placeholder="อธิบายสินค้าให้ Affiliate เข้าใจ จุดเด่น วิธีใช้..."
              className={cn(inputClass(false), "resize-none")}
            />
          </Field>
        </Section>

        {/* ราคา */}
        <Section title="ราคาและค่าคอมมิชชั่น">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="ราคาขาย (฿)" error={errors.price?.message} required>
              <input
                type="number"
                step="0.01"
                {...register("price", { setValueAs: toNum })}
                placeholder="299"
                className={inputClass(!!errors.price)}
              />
            </Field>
            <Field label="ราคาเดิม (฿)">
              <input
                type="number"
                step="0.01"
                {...register("original_price", { setValueAs: toNum })}
                placeholder="399"
                className={inputClass(false)}
              />
            </Field>
            <Field label="ค่าคอม (%)" error={errors.commission_rate?.message} required>
              <input
                type="number"
                step="0.1"
                min="1"
                max="100"
                {...register("commission_rate", { setValueAs: toNum })}
                placeholder="10"
                className={inputClass(!!errors.commission_rate)}
              />
            </Field>
          </div>

          {commissionEarned > 0 && (
            <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-[#F59E0B] text-sm font-semibold">
                Affiliate จะได้รับ ≈ ฿{commissionEarned.toLocaleString()} / ชิ้น
              </p>
              {discount > 0 && (
                <span className="text-xs text-red-400 font-semibold bg-red-500/10 px-2.5 py-1 rounded-full">
                  ลด {discount}%
                </span>
              )}
            </div>
          )}
        </Section>

        {/* ลิงก์และรูป */}
        <Section title="ลิงก์และรูปภาพ">
          <Field label="URL รูปภาพสินค้า">
            <input
              {...register("image_url")}
              placeholder="https://..."
              className={inputClass(false)}
            />
          </Field>
          <Field label="ลิงก์สินค้า TikTok Shop">
            <input
              {...register("tiktok_product_url")}
              placeholder="https://shop.tiktok.com/..."
              className={inputClass(false)}
            />
          </Field>
        </Section>

        {/* สถานะ */}
        <Section title="สถานะและสต็อก">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="สถานะสต็อก">
              <select {...register("stock_status")} className={inputClass(false)}>
                <option value="in_stock">มีสินค้า</option>
                <option value="low_stock">ใกล้หมด</option>
                <option value="out_of_stock">หมดแล้ว</option>
              </select>
            </Field>
            <Field label="ยอดขาย/เดือน (ประมาณ)">
              <input
                type="number"
                min="0"
                {...register("monthly_sales_est", { setValueAs: (v) => Number(v) || 0 })}
                placeholder="500"
                className={inputClass(false)}
              />
            </Field>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register("is_active")} className="w-4 h-4 accent-[#DC2626]" />
            <span className="text-slate-300 text-sm">แสดงสินค้าใน ProductAds (เปิดขาย)</span>
          </label>
        </Section>

        {/* โปรโมชั่น */}
        <Section title="โปรโมชั่น">
          <Field label="ข้อความโปรโมชั่น (แสดงบนการ์ดสินค้า)">
            <textarea
              {...register("promotion_text")}
              rows={2}
              placeholder="เช่น ซื้อ 2 แถม 1 / ส่งฟรีทั่วไทย / ลด 20% เฉพาะสัปดาห์นี้"
              className={cn(inputClass(false), "resize-none")}
            />
          </Field>
        </Section>

        {/* Affiliate info */}
        <Section title="ข้อมูลสำหรับ Affiliate (เห็นเฉพาะสมาชิก)">
          <Field label="Caption แนะนำ">
            <textarea
              {...register("caption_suggestions")}
              rows={6}
              placeholder={"ตัวอย่าง caption ที่ Affiliate ใช้โพสต์ได้เลย...\n\nเช่น:\n\"ครีมที่ดีที่สุดที่เคยใช้! หน้าใสขึ้นใน 7 วัน ✨\n#ครีมบำรุงผิว #skincare\""}
              className={cn(inputClass(false), "resize-none font-mono text-xs leading-relaxed")}
            />
          </Field>
          <Field label="คำต้องห้าม ⚠️">
            <textarea
              {...register("forbidden_words")}
              rows={3}
              placeholder="คำหรือข้อความที่ห้าม Affiliate ใช้โดยเด็ดขาด เช่น คำอ้างทางการแพทย์ ชื่อคู่แข่ง..."
              className={cn(inputClass(false), "resize-none")}
            />
          </Field>
        </Section>

        {/* Tags */}
        <Section title="แท็ก">
          <Field label="Tags (คั่นด้วยเครื่องหมาย ,)">
            <input
              value={tagsValue}
              onChange={e =>
                setValue("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))
              }
              placeholder="เช่น ครีม, บำรุงผิว, ออแกนิค"
              className={inputClass(false)}
            />
            {(watched.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(watched.tags ?? []).map(t => (
                  <span key={t} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </Field>
        </Section>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
          </button>
          <a href="/admin/product-ads" className="text-slate-400 hover:text-white text-sm transition-colors">
            ยกเลิก
          </a>
        </div>
      </form>

      {/* ── Right: mini preview ── */}
      <div className="xl:sticky xl:top-6 space-y-3">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
          ตัวอย่างการ์ด
        </p>
        <MiniCardPreview
          name={watched.name || "ชื่อสินค้า"}
          imageUrl={watched.image_url || ""}
          price={watched.price ?? 0}
          originalPrice={watched.original_price ?? null}
          commissionRate={watched.commission_rate ?? 0}
          stockStatus={(watched.stock_status as string) || "in_stock"}
          promotionText={watched.promotion_text || ""}
          isActive={watched.is_active ?? true}
        />
      </div>
    </div>
  )
}

// ── Mini card preview ─────────────────────────────────────────────────────────

function MiniCardPreview({
  name, imageUrl, price, originalPrice, commissionRate, stockStatus, promotionText, isActive,
}: {
  name: string
  imageUrl: string
  price: number
  originalPrice: number | null
  commissionRate: number
  stockStatus: string
  promotionText: string
  isActive: boolean
}) {
  const discount = originalPrice && originalPrice > price
    ? Math.round((1 - price / originalPrice) * 100)
    : 0

  const stockColor: Record<string, string> = {
    in_stock:     "text-emerald-400",
    low_stock:    "text-[#F59E0B]",
    out_of_stock: "text-red-400",
  }
  const stockLabel: Record<string, string> = {
    in_stock:     "มีสินค้า",
    low_stock:    "ใกล้หมด",
    out_of_stock: "หมด",
  }

  return (
    <div className={cn(
      "bg-[#1C0D0D] border rounded-2xl overflow-hidden",
      isActive ? "border-white/5" : "border-white/5 opacity-60"
    )}>
      {/* Image */}
      <div className="relative aspect-square bg-white/[0.03]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={28} className="text-slate-700" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-[#0A0808]/90 border border-[#F59E0B]/30 rounded-lg px-2 py-0.5">
          <span className="text-[#F59E0B] font-bold text-xs">{commissionRate}%</span>
        </div>
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-[#DC2626] rounded-lg px-2 py-0.5">
            <span className="text-white font-bold text-[10px]">-{discount}%</span>
          </div>
        )}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-slate-300 text-xs font-semibold bg-black/70 px-3 py-1.5 rounded-lg">
              ปิดอยู่
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-white font-semibold text-xs leading-snug line-clamp-2">{name}</p>
        <div className="flex items-center justify-between gap-1">
          <div>
            <p className="text-white font-bold text-sm">฿{price.toLocaleString()}</p>
            {originalPrice && (
              <p className="text-slate-600 text-[10px] line-through">฿{originalPrice.toLocaleString()}</p>
            )}
          </div>
          <p className={cn("text-[10px]", stockColor[stockStatus] ?? "text-emerald-400")}>
            {stockLabel[stockStatus] ?? "มีสินค้า"}
          </p>
        </div>
        {promotionText && (
          <p className="text-[#F59E0B] text-[10px] bg-[#F59E0B]/5 rounded-lg px-2 py-1 line-clamp-1">
            {promotionText}
          </p>
        )}
        <div className="bg-[#DC2626] rounded-xl text-center py-1.5">
          <span className="text-white text-xs font-semibold">ดึงสินค้า</span>
        </div>
      </div>
    </div>
  )
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-4">
      <h2 className="text-white font-semibold text-sm">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label, error, required, children,
}: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-slate-300 text-xs font-medium">
        {label}{required && <span className="text-[#DC2626] ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full bg-[#0A0808] border rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600",
    "focus:outline-none focus:ring-2 transition-colors appearance-none",
    hasError
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-white/10 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20"
  )
}
