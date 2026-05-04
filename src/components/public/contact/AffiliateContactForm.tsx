"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { CheckCircle2, Loader2, MessageCircle, RotateCcw, Music } from "lucide-react"

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name:       z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  phone:      z.string().regex(/^0[6-9]\d{8}$/, "เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)"),
  tiktok_url: z.string().url("ลิงก์ไม่ถูกต้อง").max(300).optional().or(z.literal("")),
  service:    z.string().min(1, "กรุณาเลือกสิ่งที่สนใจ"),
  message:    z.string().optional(),
})

type FormData = z.infer<typeof schema>

const serviceOptions = [
  { value: "คอร์สเรียน TikTok Affiliate",      label: "คอร์สเรียน TikTok Affiliate" },
  { value: "บริการวางแผน Affiliate",             label: "บริการวางแผนกลยุทธ์ Affiliate" },
  { value: "สมัครเป็น Affiliate กับ NP Create", label: "สมัครเป็น Affiliate กับ NP Create" },
  { value: "ที่ปรึกษา Affiliate",                label: "ขอคำปรึกษา Affiliate" },
  { value: "ยังไม่แน่ใจ",                        label: "ยังไม่แน่ใจ อยากสอบถามก่อน" },
]

type LineSession = { userId: string; displayName: string; pictureUrl: string }

interface Props {
  hasSubmitted: boolean
  lineSession:  LineSession | null
  lineOaHref:   string
}

export function AffiliateContactForm({ hasSubmitted, lineSession, lineOaHref }: Props) {
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [allowResubmit, setAllowResubmit] = useState(false)
  const [apiError, setApiError]           = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setApiError(null)
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...data,
          lead_type: "affiliate",
          tiktok_url: data.tiktok_url || undefined,
          ...(lineSession ? { line_user_id: lineSession.userId, display_name: lineSession.displayName } : {}),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setApiError(body?.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
        return
      }
      setJustSubmitted(true)
      setAllowResubmit(false)
    } catch {
      setApiError("ไม่สามารถส่งข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต")
    }
  }

  if ((hasSubmitted || justSubmitted) && !allowResubmit) {
    return (
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 sm:p-10 text-center space-y-5">
        <div>
          <div className="w-16 h-16 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-[#F59E0B]" />
          </div>
          <h3 className="font-display font-bold text-white text-xl mb-2">
            {justSubmitted ? "ส่งข้อมูลเรียบร้อยแล้ว!" : "คุณเคยส่งข้อมูลไว้แล้ว"}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            ทีมงานได้รับข้อมูลของคุณแล้ว และจะติดต่อกลับภายใน 1 ชั่วโมง
            ในเวลาทำการ 9:00–20:00 น.
          </p>
        </div>
        <a
          href={lineOaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05a847] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          <MessageCircle size={17} />
          ทักหาทีมงานผ่าน LINE OA
        </a>
        <p className="text-slate-600 text-xs">หรือรอทีมงานโทรกลับที่เบอร์ที่กรอกไว้</p>
        <button
          type="button"
          onClick={() => { setAllowResubmit(true); reset() }}
          className="flex items-center gap-1.5 mx-auto text-slate-600 hover:text-slate-400 text-xs transition-colors"
        >
          <RotateCcw size={11} />
          ต้องการส่งข้อมูลใหม่อีกครั้ง
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-5"
    >
      {apiError && <ErrorBox msg={apiError} />}

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="ชื่อ-นามสกุล" error={errors.name?.message} required>
          <input {...register("name")} placeholder="สมชาย ใจดี" className={inputCls(!!errors.name)} />
        </Field>
        <Field label="เบอร์โทรศัพท์" error={errors.phone?.message} required>
          <input {...register("phone")} placeholder="0812345678" inputMode="tel" className={inputCls(!!errors.phone)} />
        </Field>
      </div>

      <Field
        label="ลิงก์ช่อง TikTok ของคุณ"
        error={errors.tiktok_url?.message}
        hint="ไม่บังคับ — ใส่ถ้ามีช่องอยู่แล้ว"
      >
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <Music size={14} />
          </div>
          <input
            {...register("tiktok_url")}
            type="url"
            placeholder="https://www.tiktok.com/@yourusername"
            className={cn(inputCls(!!errors.tiktok_url), "pl-9")}
          />
        </div>
      </Field>

      <Field label="สิ่งที่สนใจ" error={errors.service?.message} required>
        <select {...register("service")} className={inputCls(!!errors.service)}>
          <option value="">— เลือกสิ่งที่สนใจ —</option>
          {serviceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="ข้อความเพิ่มเติม (ถ้ามี)">
        <textarea
          {...register("message")}
          placeholder="เล่าให้เราฟังว่าตอนนี้ทำ TikTok อยู่ไหม หรืออยากทำแต่ยังไม่รู้จะเริ่มยังไง"
          rows={4}
          className={cn(inputCls(false), "resize-none")}
        />
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-black font-semibold py-3.5 rounded-xl transition-colors"
      >
        {isSubmitting
          ? <><Loader2 size={16} className="animate-spin" /> กำลังส่ง...</>
          : "ส่งข้อมูลและรอการติดต่อกลับ"}
      </button>

      <p className="text-center text-slate-500 text-xs">
        ไม่ต้องสมัครสมาชิก — กรอกแล้วส่งได้เลย ทีมงานตอบกลับภายใน 1 ชม.
      </p>
    </form>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Field({ label, error, required, hint, children }: {
  label: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-slate-300 text-sm font-medium">
          {label}{required && <span className="text-[#F59E0B] ml-1">*</span>}
        </label>
        {hint && <span className="text-slate-600 text-xs shrink-0">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
      {msg}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full bg-[#0A0808] border rounded-xl px-4 py-2.5 text-white text-base placeholder:text-slate-500",
    "focus:outline-none focus:ring-2 transition-colors appearance-none",
    hasError
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-white/10 focus:border-[#F59E0B]/50 focus:ring-[#F59E0B]/20"
  )
}
