"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { heroMediaSchema, type HeroMediaInput } from "../schema"
import { createHeroMedia, updateHeroMedia } from "../actions"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { HeroMedia } from "@/types/database"

interface Props {
  heroMedia?: HeroMedia
}

export function HeroMediaForm({ heroMedia }: Props) {
  const isEdit = !!heroMedia
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
  } = useForm<HeroMediaInput>({
    resolver: zodResolver(heroMediaSchema),
    defaultValues: heroMedia
      ? {
          type:          heroMedia.type,
          media_url:     heroMedia.media_url,
          caption:       heroMedia.caption ?? "",
          display_order: heroMedia.display_order,
          is_active:     heroMedia.is_active,
        }
      : {
          type:          "image",
          media_url:     "",
          caption:       "",
          display_order: 0,
          is_active:     true,
        },
  })

  const watchedType     = watch("type")
  const watchedMediaUrl = watch("media_url")

  async function handleFileUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const supabase = createBrowserClient()
      const ext  = file.name.split(".").pop() ?? "bin"
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from("hero-media")
        .upload(path, file, { upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from("hero-media").getPublicUrl(path)
      setValue("media_url", data.publicUrl)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "อัพโหลดล้มเหลว")
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: HeroMediaInput) => {
    setServerError(null)
    try {
      if (isEdit && heroMedia) {
        await updateHeroMedia(heroMedia.id, data)
      } else {
        await createHeroMedia(data)
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่")
    }
  }

  return (
    <div className="grid xl:grid-cols-[1fr_200px] gap-8 items-start">

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        {/* ประเภทสื่อ */}
        <Section title="ประเภทสื่อ">
          <div className="flex gap-3">
            {([
              { value: "image" as const, label: "🖼 รูปภาพ" },
              { value: "video" as const, label: "▶ วิดีโอ" },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("type", opt.value)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all",
                  watchedType === opt.value
                    ? "bg-[#DC2626] border-[#DC2626] text-white"
                    : "bg-transparent border-white/10 text-slate-400 hover:text-white"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* อัพโหลดสื่อ */}
        <Section title="สื่อ">
          {/* Tab switcher */}
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
                  uploadMode === key
                    ? "bg-[#DC2626] text-white"
                    : "text-slate-400 hover:text-white"
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
                  : "border-white/10 hover:border-[#DC2626]/50"
              )}>
                {uploading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    <span>กำลังอัพโหลด...</span>
                  </div>
                ) : (
                  <>
                    <span className="text-slate-400 text-sm">คลิกเพื่อเลือกไฟล์</span>
                    <span className="text-slate-600 text-xs">
                      {watchedType === "image" ? "JPG, PNG, WEBP, GIF" : "MP4, MOV, WEBM"} · สูงสุด 50 MB
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept={watchedType === "image" ? "image/*" : "video/*"}
                  disabled={uploading}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleFileUpload(file)
                  }}
                />
              </label>
              {uploadError && (
                <p className="text-red-400 text-xs mt-1.5">{uploadError}</p>
              )}
              {watchedMediaUrl && !uploading && (
                <p className="text-emerald-400 text-xs mt-1.5 truncate">อัพโหลดแล้ว: {watchedMediaUrl}</p>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <input
                {...register("media_url")}
                placeholder={watchedType === "image" ? "https://example.com/image.jpg" : "https://example.com/video.mp4"}
                className={inputClass(!!errors.media_url)}
              />
            </div>
          )}

          {errors.media_url && (
            <p className="text-red-400 text-xs mt-1">{errors.media_url.message}</p>
          )}
        </Section>

        {/* รายละเอียด */}
        <Section title="รายละเอียด">
          <Field label="ข้อความ / รางวัล">
            <textarea
              {...register("caption")}
              rows={2}
              placeholder="เช่น รางวัล TikTok Shop Partner 2024"
              className={cn(inputClass(false), "resize-none")}
            />
          </Field>

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
            {isEdit ? "บันทึกการแก้ไข" : "เพิ่มสื่อ"}
          </button>
          <a href="/admin/homepage/media" className="text-slate-400 hover:text-white text-sm transition-colors">
            ยกเลิก
          </a>
        </div>
      </form>

      {/* ── Preview ── */}
      <div className="xl:sticky xl:top-6 space-y-3">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
          ตัวอย่าง
        </p>
        <div className="flex justify-center">
          {watchedType === "image" ? (
            <ImagePreview url={watchedMediaUrl} caption={watch("caption") ?? null} />
          ) : (
            <VideoPreview url={watchedMediaUrl} caption={watch("caption") ?? null} />
          )}
        </div>
        <p className="text-slate-600 text-[10px] text-center">ขนาดจริง 9:16 แนวตั้ง</p>
      </div>
    </div>
  )
}

// ── Preview sub-components ────────────────────────────────────────────────────

function ImagePreview({ url, caption }: { url: string; caption: string | null }) {
  return (
    <div className="relative w-[120px]" style={{ aspectRatio: "9/16" }}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#DC2626]/60 via-rose-500/30 to-[#DC2626]/10 p-[1.5px]">
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-800">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={caption ?? ""} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-slate-600 text-[10px]">ไม่มีรูป</span>
            </div>
          )}
          {caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-6 pb-2 px-2">
              <p className="text-[#F59E0B] text-[8px] font-bold leading-tight text-center">{caption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VideoPreview({ url, caption }: { url: string; caption: string | null }) {
  return (
    <div className="relative w-[120px]" style={{ aspectRatio: "9/16" }}>
      <div className="absolute inset-0 rounded-[22px] border-[3px] border-slate-600 bg-black overflow-hidden shadow-xl shadow-black/50">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-slate-700 rounded-full z-10" />
        {url ? (
          <video
            src={url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-slate-600 text-[10px]">ไม่มีวิดีโอ</span>
          </div>
        )}
        {caption && (
          <div className="absolute bottom-3 left-0 right-0 px-2">
            <p className="text-[#F59E0B] text-[8px] font-bold text-center leading-tight bg-black/60 rounded-full px-2 py-0.5">{caption}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shared helpers ────────────────────────────────────────────────────────────

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

function inputClass(hasError: boolean) {
  return cn(
    "w-full bg-[#0A0808] border rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600",
    "focus:outline-none focus:ring-2 transition-colors appearance-none",
    hasError
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-white/10 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20"
  )
}
