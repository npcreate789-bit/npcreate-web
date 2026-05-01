"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { promoBannerSchema, type PromoBannerInput } from "../schema"
import { createPromoBanner, updatePromoBanner } from "../actions"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { PromoBanner } from "@/types/database"

interface Props {
  banner?: PromoBanner
}

export function PromoBannerForm({ banner }: Props) {
  const isEdit = !!banner
  const [serverError, setServerError] = useState<string | null>(null)
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PromoBannerInput>({
    resolver: zodResolver(promoBannerSchema),
    defaultValues: banner
      ? {
          heading:       banner.heading,
          banner_url:    banner.banner_url    ?? "",
          detail:        banner.detail        ?? "",
          price_text:    banner.price_text    ?? "",
          contact_text:  banner.contact_text,
          contact_url:   banner.contact_url,
          display_order: banner.display_order,
          is_active:     banner.is_active,
        }
      : {
          heading:       "",
          banner_url:    "",
          detail:        "",
          price_text:    "",
          contact_text:  "ติดต่อเรา",
          contact_url:   "/api/auth/line",
          display_order: 0,
          is_active:     true,
        },
  })

  const watchedUrl = watch("banner_url")

  async function handleFileUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const supabase = createBrowserClient()
      const ext  = file.name.split(".").pop() ?? "bin"
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from("promo-banners")
        .upload(path, file, { upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from("promo-banners").getPublicUrl(path)
      setValue("banner_url", data.publicUrl)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "อัพโหลดล้มเหลว")
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: PromoBannerInput) => {
    setServerError(null)
    try {
      if (isEdit && banner) {
        await updatePromoBanner(banner.id, data)
      } else {
        await createPromoBanner(data)
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่")
    }
  }

  return (
    <div className="grid xl:grid-cols-[1fr_320px] gap-8 items-start">

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        {/* หัวข้อ */}
        <Section title="หัวข้อ">
          <Field label="ข้อความหัวข้อ" error={errors.heading?.message}>
            <input
              {...register("heading")}
              placeholder="เช่น แพ็กเกจ GMV Max Pro"
              className={inputClass(!!errors.heading)}
            />
          </Field>
        </Section>

        {/* รูปแบนเนอร์ */}
        <Section title="รูปแบนเนอร์ (แนวนอน)">
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
            {([
              { key: "upload" as const, label: "อัพโหลดไฟล์" },
              { key: "url"    as const, label: "ใส่ URL" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setUploadMode(key)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                  uploadMode === key ? "bg-[#DC2626] text-white" : "text-slate-400 hover:text-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {uploadMode === "upload" ? (
            <div className="mt-3">
              <label className={cn(
                "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-8 cursor-pointer transition-colors",
                uploading
                  ? "border-white/20 opacity-60 cursor-not-allowed"
                  : "border-white/10 hover:border-[#DC2626]/50",
              )}>
                {uploading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    กำลังอัพโหลด...
                  </div>
                ) : (
                  <>
                    <span className="text-slate-400 text-sm">คลิกเพื่อเลือกรูปแบนเนอร์</span>
                    <span className="text-slate-600 text-xs">JPG, PNG, WEBP · สูงสุด 10 MB · แนะนำสัดส่วน 16:9</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleFileUpload(file)
                  }}
                />
              </label>
              {uploadError && <p className="text-red-400 text-xs mt-1.5">{uploadError}</p>}
              {watchedUrl && !uploading && (
                <p className="text-emerald-400 text-xs mt-1.5 truncate">อัพโหลดแล้ว: {watchedUrl}</p>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <input
                {...register("banner_url")}
                placeholder="https://example.com/banner.jpg"
                className={inputClass(!!errors.banner_url)}
              />
            </div>
          )}
        </Section>

        {/* รายละเอียด */}
        <Section title="รายละเอียด">
          <Field label="ข้อความอธิบาย">
            <textarea
              {...register("detail")}
              rows={4}
              placeholder="รายละเอียดโปรโมชัน / บริการ / ข้อเสนอ"
              className={cn(inputClass(false), "resize-none")}
            />
          </Field>
        </Section>

        {/* ราคาและปุ่ม */}
        <Section title="ราคาและปุ่มติดต่อ">
          <Field label="ข้อความราคา">
            <input
              {...register("price_text")}
              placeholder="เช่น เริ่มต้น 15,000 บาท/เดือน"
              className={inputClass(false)}
            />
          </Field>
          <Field label="ข้อความปุ่ม" error={errors.contact_text?.message}>
            <input
              {...register("contact_text")}
              placeholder="เช่น ติดต่อเรา / สนใจแพ็กเกจนี้"
              className={inputClass(!!errors.contact_text)}
            />
          </Field>
          <Field label="ลิงก์ปุ่ม">
            <input
              {...register("contact_url")}
              placeholder="/api/auth/line"
              className={inputClass(false)}
            />
          </Field>
        </Section>

        {/* ตั้งค่า */}
        <Section title="ตั้งค่า">
          <Field label="ลำดับแสดงผล">
            <input
              type="number"
              {...register("display_order", { valueAsNumber: true })}
              placeholder="0"
              className={cn(inputClass(false), "max-w-[120px]")}
            />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register("is_active")} className="w-4 h-4 accent-[#DC2626]" />
            <span className="text-slate-300 text-sm">เปิดใช้งาน</span>
          </label>
        </Section>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "บันทึกการแก้ไข" : "สร้างแบนเนอร์"}
          </button>
          <a href="/admin/homepage/banners" className="text-slate-400 hover:text-white text-sm transition-colors">
            ยกเลิก
          </a>
        </div>
      </form>

      {/* ── Preview ── */}
      <div className="xl:sticky xl:top-6 space-y-3">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">ตัวอย่าง</p>
        <BannerPreview
          heading={watch("heading")}
          bannerUrl={watchedUrl}
          detail={watch("detail")}
          priceText={watch("price_text")}
          contactText={watch("contact_text")}
        />
      </div>
    </div>
  )
}

function BannerPreview({
  heading,
  bannerUrl,
  detail,
  priceText,
  contactText,
}: {
  heading: string
  bannerUrl: string
  detail: string
  priceText: string
  contactText: string
}) {
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden text-sm">
      {heading && (
        <div className="px-4 pt-4 pb-2">
          <p className="font-display font-bold text-white text-base leading-tight">{heading}</p>
        </div>
      )}
      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerUrl} alt="" className="w-full aspect-video object-cover" />
      ) : (
        <div className="w-full aspect-video bg-white/5 flex items-center justify-center">
          <span className="text-slate-600 text-xs">รูปแบนเนอร์</span>
        </div>
      )}
      {(detail || priceText || contactText) && (
        <div className="px-4 py-4 space-y-3">
          {detail && (
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{detail}</p>
          )}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {priceText && (
              <span className="font-bold text-[#F59E0B] text-sm">{priceText}</span>
            )}
            {contactText && (
              <span className="bg-[#DC2626] text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                {contactText}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
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

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-slate-300 text-xs font-medium">{label}</label>
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
      : "border-white/10 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20",
  )
}
