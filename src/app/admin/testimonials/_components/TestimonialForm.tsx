"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { testimonialSchema, type TestimonialInput } from "../schema"
import { createTestimonial, updateTestimonial } from "../actions"
import type { Testimonial } from "@/types/database"

interface Props {
  testimonial?: Testimonial
}

export function TestimonialForm({ testimonial }: Props) {
  const isEdit = !!testimonial
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: testimonial
      ? {
          client_name:    testimonial.client_name,
          client_role:    testimonial.client_role    ?? "",
          client_company: testimonial.client_company ?? "",
          client_avatar:  testimonial.client_avatar  ?? "",
          content:        testimonial.content,
          short_quote:    testimonial.short_quote    ?? "",
          rating:         testimonial.rating,
          is_featured:    testimonial.is_featured,
          is_published:   testimonial.is_published,
          display_order:  testimonial.display_order,
        }
      : {
          client_name: "", client_role: "", client_company: "",
          client_avatar: "", content: "", short_quote: "",
          rating: null, is_featured: false, is_published: true, display_order: 0,
        },
  })

  const watched  = useWatch({ control })
  const rating   = watched.rating ?? null
  const initials = (watched.client_name ?? "").charAt(0).toUpperCase() || "?"

  const onSubmit = async (data: TestimonialInput) => {
    setServerError(null)
    try {
      if (isEdit && testimonial) {
        await updateTestimonial(testimonial.id, data)
      } else {
        await createTestimonial(data)
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่")
    }
  }

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_260px] gap-8 items-start">

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        {/* ข้อมูลลูกค้า */}
        <Section title="ข้อมูลลูกค้า">
          <Field label="ชื่อ" error={errors.client_name?.message} required>
            <input {...register("client_name")} placeholder="เช่น คุณสมชาย" className={inputCls(!!errors.client_name)} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="ตำแหน่ง / Role">
              <input {...register("client_role")} placeholder="เช่น เจ้าของแบรนด์" className={inputCls(false)} />
            </Field>
            <Field label="บริษัท / แบรนด์">
              <input {...register("client_company")} placeholder="เช่น BrandName" className={inputCls(false)} />
            </Field>
          </div>
          <Field label="URL รูปโปรไฟล์ (ถ้ามี)">
            <input {...register("client_avatar")} placeholder="https://..." className={inputCls(false)} />
          </Field>
        </Section>

        {/* รีวิว */}
        <Section title="รีวิว">
          <Field label="ข้อความรีวิว (เต็ม)" error={errors.content?.message} required>
            <textarea
              {...register("content")}
              rows={4}
              placeholder="ประสบการณ์การใช้บริการ NP Create..."
              className={cn(inputCls(!!errors.content), "resize-none")}
            />
          </Field>
          <Field label='Quote สั้น (สำหรับแสดงบนการ์ด — ถ้าว่างใช้ข้อความเต็ม)'>
            <textarea
              {...register("short_quote")}
              rows={2}
              placeholder="ยอดขายเพิ่มขึ้น 3 เท่าใน 2 เดือน..."
              className={cn(inputCls(false), "resize-none")}
            />
          </Field>

          {/* Star rating */}
          <Field label="คะแนน (1–5 ดาว)">
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setValue("rating", rating === n ? null : n)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={22}
                    className={cn(
                      "transition-colors",
                      rating && rating >= n
                        ? "text-[#F59E0B] fill-[#F59E0B]"
                        : "text-slate-600 hover:text-slate-400"
                    )}
                  />
                </button>
              ))}
              {rating && (
                <button
                  type="button"
                  onClick={() => setValue("rating", null)}
                  className="text-slate-500 hover:text-white text-xs ml-2 transition-colors"
                >
                  ล้าง
                </button>
              )}
            </div>
          </Field>
        </Section>

        {/* การแสดงผล */}
        <Section title="การแสดงผล">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("is_published")} className="w-4 h-4 accent-[#DC2626]" />
              <span className="text-slate-300 text-sm">เผยแพร่ (แสดงบนหน้าเว็บ)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("is_featured")} className="w-4 h-4 accent-[#DC2626]" />
              <span className="text-slate-300 text-sm">Featured (เน้นการ์ดนี้)</span>
            </label>
          </div>
          <Field label="ลำดับแสดงผล">
            <input
              type="number"
              {...register("display_order", { valueAsNumber: true })}
              placeholder="0"
              className={cn(inputCls(false), "max-w-[120px]")}
            />
          </Field>
        </Section>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "บันทึกการแก้ไข" : "เพิ่มรีวิว"}
          </button>
          <a href="/admin/testimonials" className="text-slate-400 hover:text-white text-sm transition-colors">ยกเลิก</a>
        </div>
      </form>

      {/* ── Preview ── */}
      <div className="xl:sticky xl:top-6 space-y-3">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">ตัวอย่างการ์ด</p>
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5">
          {/* Stars */}
          {rating && (
            <div className="flex gap-0.5 mb-3">
              {[1,2,3,4,5].map((n) => (
                <Star key={n} size={14} className={rating >= n ? "text-[#F59E0B] fill-[#F59E0B]" : "text-slate-700"} />
              ))}
            </div>
          )}
          {/* Quote */}
          <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">
            &ldquo;{watched.short_quote || watched.content || "ข้อความรีวิว..."}&rdquo;
          </p>
          {/* Client */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#DC2626]/20 flex items-center justify-center text-[#DC2626] font-bold text-sm shrink-0 overflow-hidden">
              {watched.client_avatar
                ? <img src={watched.client_avatar} alt="" className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">
                {watched.client_name || "ชื่อลูกค้า"}
              </p>
              {(watched.client_role || watched.client_company) && (
                <p className="text-slate-500 text-xs mt-0.5">
                  {[watched.client_role, watched.client_company].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
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

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
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

function inputCls(hasError: boolean) {
  return cn(
    "w-full bg-[#0A0808] border rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600",
    "focus:outline-none focus:ring-2 transition-colors",
    hasError
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-white/10 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20"
  )
}
