"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { portfolioSchema, type PortfolioInput } from "../schema"
import { createPortfolio, updatePortfolio, uploadPortfolioCover } from "../actions"
import type { Portfolio } from "@/types/database"

function parseTikTokId(input: string): string | undefined {
  if (!input) return undefined
  const match = input.match(/\/video\/(\d+)/)
  return match ? match[1] : /^\d+$/.test(input.trim()) ? input.trim() : undefined
}

function toSlug(text: string) {
  return (
    text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || `portfolio-${Date.now()}`
  )
}

function toNum(v: unknown) {
  if (v === "" || v === null || v === undefined) return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function fmtGMV(val: number | null | undefined) {
  if (!val) return "—"
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${Math.round(val / 1_000)}K`
  return val.toLocaleString()
}

// These gradient strings must be here as literals so Tailwind's JIT includes them
const GRADIENT_OPTIONS = [
  "from-red-800 via-rose-700 to-red-600",
  "from-rose-500 via-pink-500 to-fuchsia-600",
  "from-amber-500 via-orange-500 to-red-500",
  "from-yellow-500 via-amber-500 to-orange-600",
  "from-slate-500 via-gray-600 to-zinc-700",
  "from-red-900 via-red-700 to-rose-600",
  "from-rose-600 via-red-500 to-red-700",
  "from-pink-500 via-rose-500 to-red-600",
  "from-red-700 via-rose-600 to-red-500",
]

const SERVICE_OPTIONS = [
  "ยิงแอด GMV Max",
  "วางกลยุทธ์ TikTok Shop",
  "Content & Creative",
  "รายงานผล & วิเคราะห์",
]

const INDUSTRY_OPTIONS = [
  { value: "fashion",   label: "แฟชั่น" },
  { value: "food",      label: "อาหาร" },
  { value: "beauty",    label: "ความงาม" },
  { value: "health",    label: "สุขภาพ" },
  { value: "lifestyle", label: "ไลฟ์สไตล์" },
  { value: "other",     label: "อื่นๆ" },
]

interface Props {
  portfolio?: Portfolio
}

export function PortfolioForm({ portfolio }: Props) {
  const isEdit = !!portfolio
  const [serverError, setServerError] = useState<string | null>(null)
  const [coverUploadMode, setCoverUploadMode] = useState<"upload" | "url">("upload")
  const [coverUploading, setCoverUploading]   = useState(false)
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PortfolioInput>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: portfolio
      ? {
          title:          portfolio.title,
          slug:           portfolio.slug,
          client_name:    portfolio.client_name ?? "",
          industry:       portfolio.industry ?? "",
          service_type:   portfolio.service_type ?? [],
          short_desc:     portfolio.short_desc ?? "",
          gmv_before:        portfolio.gmv_before,
          gmv_after:         portfolio.gmv_after,
          gmv_growth_pct:    portfolio.gmv_growth_pct,
          roas:              portfolio.roas,
          roas_before:       portfolio.roas_before ?? null,
          growth_pct_before: portfolio.growth_pct_before ?? null,
          duration_days:     portfolio.duration_days,
          cover_image:    portfolio.cover_image ?? "",
          media_type:     portfolio.media_type ?? "image",
          video_id:       portfolio.video_id ?? "",
          gradient:       portfolio.gradient ?? GRADIENT_OPTIONS[0],
          is_featured:    portfolio.is_featured,
          is_published:   portfolio.is_published,
          display_order:  portfolio.display_order,
        }
      : {
          title: "", slug: "", client_name: "", industry: "",
          service_type: [], short_desc: "",
          gmv_before: null, gmv_after: null, gmv_growth_pct: null,
          roas: null, roas_before: null, growth_pct_before: null, duration_days: null,
          cover_image: "",
          media_type: "image", video_id: "", gradient: GRADIENT_OPTIONS[0],
          is_featured: false, is_published: false, display_order: 0,
        },
  })

  const watched         = useWatch({ control })
  const serviceType     = watched.service_type ?? []
  const mediaType       = watched.media_type ?? "image"
  const gradient        = watched.gradient ?? GRADIENT_OPTIONS[0]
  const industryLabel   = INDUSTRY_OPTIONS.find((o) => o.value === watched.industry)?.label ?? ""
  const watchedVideoId  = watched.video_id ?? ""
  const tiktokPreviewId = mediaType === "tiktok" ? parseTikTokId(watchedVideoId) : undefined

  async function handleCoverUpload(file: File) {
    setCoverUploading(true)
    setCoverUploadError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const url = await uploadPortfolioCover(formData)
      setValue("cover_image", url)
    } catch (e) {
      setCoverUploadError(e instanceof Error ? e.message : "อัพโหลดล้มเหลว")
    } finally {
      setCoverUploading(false)
    }
  }

  const toggleService = (s: string) =>
    setValue(
      "service_type",
      serviceType.includes(s) ? serviceType.filter((x) => x !== s) : [...serviceType, s]
    )

  const onSubmit = async (data: PortfolioInput) => {
    setServerError(null)
    try {
      if (isEdit && portfolio) {
        await updatePortfolio(portfolio.id, data)
      } else {
        await createPortfolio(data)
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่")
    }
  }

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">

      {/* ── Left: form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        {/* ข้อมูลหลัก */}
        <Section title="ข้อมูลแบรนด์">
          <Field label="ชื่อ Portfolio" error={errors.title?.message} required>
            <input
              {...register("title", {
                onChange: (e) => { if (!isEdit) setValue("slug", toSlug(e.target.value)) },
              })}
              placeholder="เช่น Glow Beauty — GMV เพิ่ม 280%"
              className={inputClass(!!errors.title)}
            />
          </Field>

          <Field label="Slug (URL)" error={errors.slug?.message} required>
            <input {...register("slug")} placeholder="glow-beauty-gmv-280" className={inputClass(!!errors.slug)} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="ชื่อแบรนด์ / ลูกค้า">
              <input {...register("client_name")} placeholder="เช่น Glow Beauty" className={inputClass(false)} />
            </Field>
            <Field label="หมวดหมู่">
              <select {...register("industry")} className={inputClass(false)}>
                <option value="">— เลือก —</option>
                {INDUSTRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="คำอธิบายผลงาน (แสดงบนการ์ด)">
            <textarea
              {...register("short_desc")}
              rows={3}
              placeholder="สรุปผลงานใน 1–2 ประโยค เช่น เพิ่มยอดขายจาก 200K → 2.4M/เดือน ใน 3 เดือน ด้วยกลยุทธ์ GMV Max"
              className={cn(inputClass(false), "resize-none")}
            />
          </Field>
        </Section>

        {/* ── Section 1: ประเภทสื่อ ── */}
        <Section title="ประเภทสื่อ">
          <div className="flex gap-2">
            {([
              { value: "image",  label: "🖼 รูปภาพ",   desc: "แสดงรูปบนการ์ดและ popup" },
              { value: "video",  label: "▶ YouTube",   desc: "เล่น YouTube ใน popup" },
              { value: "tiktok", label: "♪ TikTok",    desc: "เล่น TikTok ใน popup" },
            ] as const).map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue("media_type", t.value)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all",
                  mediaType === t.value
                    ? "bg-[#DC2626] border-[#DC2626] text-white"
                    : "bg-transparent border-white/10 text-slate-400 hover:text-white"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-slate-500 text-xs -mt-1">
            {mediaType === "image"
              ? "รูปภาพปกจะแสดงบนการ์ดและ popup — ตั้งค่าได้ที่ section รูปภาพปกด้านล่าง"
              : mediaType === "video"
              ? "วิดีโอจะเปิดใน popup เมื่อคลิกการ์ด — รูปบนการ์ดตั้งค่าที่ section รูปภาพปก"
              : "วิดีโอจะเปิดใน popup เมื่อคลิกการ์ด — รูปบนการ์ดตั้งค่าที่ section รูปภาพปก"}
          </p>

          {mediaType === "video" && (
            <Field label="YouTube Video ID">
              <input
                {...register("video_id")}
                placeholder="เช่น dQw4w9WgXcQ"
                className={inputClass(false)}
              />
              <p className="text-slate-500 text-xs mt-1">
                copy จาก URL: youtube.com/watch?v=<span className="text-slate-400">VIDEO_ID</span>
              </p>
              {watchedVideoId && (
                <div className="rounded-xl overflow-hidden aspect-video bg-black mt-2">
                  <iframe
                    src={`https://www.youtube.com/embed/${watchedVideoId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube preview"
                  />
                </div>
              )}
            </Field>
          )}

          {mediaType === "tiktok" && (
            <Field label="TikTok Video URL">
              <input
                {...register("video_id")}
                placeholder="https://www.tiktok.com/@username/video/7123456789"
                className={inputClass(false)}
              />
              <p className="text-slate-500 text-xs mt-1">
                วาง URL เต็มจาก TikTok — ระบบจะดึง Video ID ให้อัตโนมัติ
              </p>
              {tiktokPreviewId ? (
                <div className="rounded-xl overflow-hidden bg-black mt-2 flex justify-center" style={{ minHeight: 560 }}>
                  <iframe
                    src={`https://www.tiktok.com/embed/v2/${tiktokPreviewId}`}
                    className="w-full"
                    style={{ minHeight: 560 }}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="TikTok preview"
                  />
                </div>
              ) : watchedVideoId ? (
                <p className="text-amber-400 text-xs mt-1">ไม่สามารถแยก Video ID จาก URL นี้ได้ — ตรวจสอบรูปแบบ URL อีกครั้ง</p>
              ) : null}
            </Field>
          )}
        </Section>

        {/* ── Section 2+3: รูปภาพปก + สีธีม (side by side) ── */}
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm">รูปภาพปกและสีธีมการ์ด</h2>

          <div className="grid sm:grid-cols-2 gap-6 items-start">

            {/* ── Left: รูปภาพปก ── */}
            <div className="space-y-3">
              <div>
                <p className="text-slate-300 text-xs font-medium">
                  {mediaType === "image" ? "รูปภาพปก *" : "รูปภาพปก / Thumbnail"}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {mediaType === "image"
                    ? "แสดงบนการ์ดและ popup"
                    : "แสดงบนการ์ด — ถ้าไม่มีใช้สีธีมแทน"}
                </p>
              </div>

              {/* Tab: upload / URL */}
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                {([
                  { key: "upload" as const, label: "อัพโหลดไฟล์" },
                  { key: "url"   as const, label: "ใส่ URL" },
                ]).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCoverUploadMode(key)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all text-center",
                      coverUploadMode === key ? "bg-[#DC2626] text-white" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {coverUploadMode === "upload" ? (
                <div className="space-y-2">
                  {watched.cover_image && !coverUploading ? (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={watched.cover_image} alt="cover preview" className="w-full object-cover aspect-[3/4]" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-white text-sm font-semibold bg-black/70 px-4 py-2 rounded-xl">
                          คลิกเพื่อเปลี่ยนรูป
                        </span>
                        <input type="file" accept="image/*" className="sr-only"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleCoverUpload(f) }} />
                      </label>
                    </div>
                  ) : (
                    <label className={cn(
                      "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-3 py-8 cursor-pointer transition-colors",
                      coverUploading ? "border-white/20 opacity-60 cursor-not-allowed" : "border-white/10 hover:border-[#DC2626]/50"
                    )}>
                      {coverUploading ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Loader2 size={16} className="animate-spin" />
                          กำลังอัพโหลด...
                        </div>
                      ) : (
                        <>
                          <span className="text-slate-400 text-sm">คลิกเพื่อเลือกรูปภาพ</span>
                          <span className="text-slate-600 text-[11px] text-center">JPG, PNG, WEBP<br />สูงสุด 10 MB · อัตราส่วน 3:4</span>
                        </>
                      )}
                      <input type="file" accept="image/*" disabled={coverUploading} className="sr-only"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleCoverUpload(f) }} />
                    </label>
                  )}
                  {coverUploadError && <p className="text-red-400 text-xs">{coverUploadError}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    {...register("cover_image")}
                    placeholder="https://example.com/cover.jpg"
                    className={inputClass(false)}
                  />
                  {watched.cover_image && (
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={watched.cover_image} alt="cover preview" className="w-full object-cover aspect-[3/4]" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Right: สีธีมการ์ด ── */}
            <div className="space-y-3">
              <div>
                <p className="text-slate-300 text-xs font-medium">สีธีมการ์ด</p>
                <p className="text-slate-500 text-[11px] mt-0.5">ใช้เป็น background เมื่อไม่มีรูปปก</p>
              </div>

              {/* Gradient preview */}
              <div className={cn(
                "w-full aspect-[3/4] rounded-xl bg-gradient-to-br transition-all",
                gradient
              )}>
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-bold text-[60px] text-white/10 select-none leading-none">
                    {(watched.client_name?.[0] ?? watched.title?.[0] ?? "N").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Swatches */}
              <div className="flex flex-wrap gap-2">
                {GRADIENT_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setValue("gradient", g)}
                    title={g}
                    className={cn(
                      "w-8 h-8 rounded-lg bg-gradient-to-br border-2 transition-all",
                      g,
                      gradient === g
                        ? "border-white shadow-lg scale-110"
                        : "border-transparent opacity-60 hover:opacity-90 hover:scale-105"
                    )}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ตัวเลขผลลัพธ์ */}
        <Section title="ตัวเลขผลลัพธ์ (แสดงบนการ์ด)">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-x-3 items-center mb-1 px-1">
            <span className="text-slate-500 text-[10px] text-center">ก่อนดูแล</span>
            <span className="invisible text-xl">→</span>
            <span className="text-[#10B981] text-[10px] text-center">หลังดูแล</span>
          </div>

          {/* GMV row */}
          <div>
            <p className="text-slate-400 text-[10px] font-medium mb-1.5 px-1">
              GMV <span className="text-slate-600">(บาท / 6 เดือน)</span>
            </p>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3">
              <input type="number" {...register("gmv_before", { setValueAs: toNum })} placeholder="200000" className={inputClass(false)} />
              <span className="text-[#F59E0B] font-bold text-xl">→</span>
              <input type="number" {...register("gmv_after", { setValueAs: toNum })} placeholder="2400000" className={inputClass(false)} />
            </div>
          </div>

          {/* ROI row */}
          <div>
            <p className="text-slate-400 text-[10px] font-medium mb-1.5 px-1">ROI (เท่า)</p>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3">
              <input type="number" step="0.1" {...register("roas_before", { setValueAs: toNum })} placeholder="—" className={inputClass(false)} />
              <span className="text-[#F59E0B] font-bold text-xl">→</span>
              <input type="number" step="0.1" {...register("roas", { setValueAs: toNum })} placeholder="9" className={inputClass(false)} />
            </div>
          </div>

          {/* Growth row */}
          <div>
            <p className="text-slate-400 text-[10px] font-medium mb-1.5 px-1">Growth (%)</p>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3">
              <input type="number" {...register("growth_pct_before", { setValueAs: toNum })} placeholder="—" className={inputClass(false)} />
              <span className="text-[#F59E0B] font-bold text-xl">→</span>
              <input type="number" {...register("gmv_growth_pct", { setValueAs: toNum })} placeholder="280" className={inputClass(false)} />
            </div>
          </div>

          <Field label="ระยะเวลา (วัน)">
            <input type="number" {...register("duration_days", { setValueAs: toNum })} placeholder="180" className={cn(inputClass(false), "max-w-[160px]")} />
          </Field>
        </Section>

        {/* แท็กบริการ */}
        <Section title="แท็ก / บริการที่ใช้">
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  serviceType.includes(s)
                    ? "bg-[#DC2626] border-[#DC2626] text-white"
                    : "bg-transparent border-white/10 text-slate-400 hover:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-1">แสดงเป็นแท็กใต้คำอธิบายในการ์ด</p>
        </Section>

        {/* การแสดงผล */}
        <Section title="การแสดงผล">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("is_published")} className="w-4 h-4 accent-[#DC2626]" />
              <span className="text-slate-300 text-sm">เผยแพร่ (แสดงบนหน้า Portfolio)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("is_featured")} className="w-4 h-4 accent-[#DC2626]" />
              <span className="text-slate-300 text-sm">Featured (แสดงในส่วนพิเศษ)</span>
            </label>
          </div>
          <Field label="ลำดับแสดงผล">
            <input type="number" {...register("display_order", { valueAsNumber: true })} placeholder="0" className={cn(inputClass(false), "max-w-[120px]")} />
          </Field>
        </Section>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "บันทึกการแก้ไข" : "สร้าง Portfolio"}
          </button>
          <a href="/admin/portfolios" className="text-slate-400 hover:text-white text-sm transition-colors">
            ยกเลิก
          </a>
        </div>
      </form>

      {/* ── Right: live preview ── */}
      <div className="xl:sticky xl:top-6 space-y-3">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
          ตัวอย่างการ์ด (hover state)
        </p>
        <CardPreview
          brand={watched.client_name || watched.title || "ชื่อแบรนด์"}
          category={industryLabel}
          mediaType={mediaType}
          gradient={gradient}
          gmv={fmtGMV(watched.gmv_after)}
          gmvBefore={fmtGMV(watched.gmv_before)}
          roi={watched.roas ? `${watched.roas}x` : "—"}
          roiBefore={watched.roas_before ? `${watched.roas_before}x` : "—"}
          growth={watched.gmv_growth_pct ? `+${watched.gmv_growth_pct}%` : "—"}
          growthBefore={watched.growth_pct_before ? `+${watched.growth_pct_before}%` : "—"}
          desc={watched.short_desc || "คำอธิบายสั้นของผลงาน จะแสดงเมื่อ hover บนการ์ด"}
          tags={serviceType}
        />
        <p className="text-slate-600 text-[10px] text-center leading-relaxed">
          การ์ดจะแสดงผลแบบนี้บนหน้า /portfolio<br />เมื่อผู้ใช้ hover เมาส์
        </p>
      </div>
    </div>
  )
}

// ── Live preview card ──────────────────────────────────────────────────────────

function CardPreview({
  brand, category, mediaType, gradient,
  gmv, gmvBefore, roi, roiBefore, growth, growthBefore, desc, tags,
}: {
  brand: string; category: string; mediaType: string; gradient: string
  gmv: string; gmvBefore: string; roi: string; roiBefore: string
  growth: string; growthBefore: string; desc: string; tags: string[]
}) {
  return (
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden w-full max-w-[260px] mx-auto ring-1 ring-white/10">
      {/* Gradient bg */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />

      {/* Brand initial watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-bold text-[80px] text-white/10 leading-none">
          {(brand[0] ?? "N").toUpperCase()}
        </span>
      </div>

      {/* Video play button */}
      {mediaType === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="text-white fill-white ml-0.5" size={18} />
          </div>
        </div>
      )}

      {/* Type badge */}
      <div className="absolute top-3 right-3">
        <span className="text-[10px] bg-black/40 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-full">
          {mediaType === "tiktok" ? "TikTok" : mediaType === "video" ? "วิดีโอ" : "รูปภาพ"}
        </span>
      </div>

      {/* Hover overlay — always visible in preview */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] flex flex-col justify-center p-4">
        {/* Before → After comparison table */}
        <div className="bg-black/30 rounded-lg overflow-hidden mb-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_1fr] text-center border-b border-white/5 px-2 py-1">
            <span className="text-white/40 text-[8px]">ก่อนดูแล</span>
            <span className="invisible text-[8px]">→</span>
            <span className="text-[#10B981] text-[8px]">หลังดูแล</span>
          </div>
          {/* GMV row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center px-2 py-1.5 border-b border-white/5">
            <div>
              <div className="text-white/30 text-[7px] leading-none mb-0.5">GMV</div>
              <div className="text-white/70 font-bold text-[11px] leading-none">{gmvBefore}</div>
            </div>
            <span className="text-[#F59E0B] font-bold text-xs mx-1">→</span>
            <div>
              <div className="text-white/30 text-[7px] leading-none mb-0.5">GMV</div>
              <div className="text-[#F59E0B] font-bold text-[11px] leading-none">{gmv}</div>
            </div>
          </div>
          {/* ROI row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center px-2 py-1.5 border-b border-white/5">
            <div>
              <div className="text-white/30 text-[7px] leading-none mb-0.5">ROI</div>
              <div className="text-white/60 font-bold text-[11px] leading-none">{roiBefore}</div>
            </div>
            <span className="text-[#F59E0B] font-bold text-xs mx-1">→</span>
            <div>
              <div className="text-white/30 text-[7px] leading-none mb-0.5">ROI</div>
              <div className="text-[#F59E0B] font-bold text-[11px] leading-none">{roi}</div>
            </div>
          </div>
          {/* Growth row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center px-2 py-1.5">
            <div>
              <div className="text-white/30 text-[7px] leading-none mb-0.5">Growth</div>
              <div className="text-white/60 font-bold text-[11px] leading-none">{growthBefore}</div>
            </div>
            <span className="text-[#F59E0B] font-bold text-xs mx-1">→</span>
            <div>
              <div className="text-white/30 text-[7px] leading-none mb-0.5">Growth</div>
              <div className="text-[#F59E0B] font-bold text-[11px] leading-none">{growth}</div>
            </div>
          </div>
        </div>

        <p className="text-white font-semibold text-sm leading-tight mb-0.5">{brand}</p>
        {category && <p className="text-white/50 text-[10px] mb-2">{category}</p>}
        <p className="text-white/70 text-[11px] leading-relaxed line-clamp-3 mb-3">{desc}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <span className="text-[#FCA5A5] text-[10px] font-medium text-center">
          คลิกเพื่อดูเพิ่มเติม →
        </span>
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
    "w-full bg-[#0A0808] border rounded-xl px-3 py-2 text-white text-base placeholder:text-slate-600",
    "focus:outline-none focus:ring-2 transition-colors appearance-none",
    hasError
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-white/10 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20"
  )
}
