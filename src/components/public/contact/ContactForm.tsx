"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { CheckCircle2, Loader2, LogOut, User } from "lucide-react"

export type LineSession = {
  userId: string
  displayName: string
  pictureUrl: string
}

const schema = z.object({
  name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  phone: z.string().regex(/^0[6-9]\d{8}$/, "เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)"),
  brand: z.string().min(2, "กรุณากรอกชื่อแบรนด์หรือร้านค้า"),
  monthly_gmv: z.string().min(1, "กรุณาเลือกยอดขายปัจจุบัน"),
  service: z.string().min(1, "กรุณาเลือกบริการที่สนใจ"),
  message: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const gmvOptions = [
  { value: "ยังไม่เปิดร้าน", label: "ยังไม่เปิดร้าน" },
  { value: "น้อยกว่า 50K", label: "น้อยกว่า 50,000 บาท/เดือน" },
  { value: "50K-200K", label: "50,000 – 200,000 บาท/เดือน" },
  { value: "200K-1M", label: "200,000 – 1,000,000 บาท/เดือน" },
  { value: "1M+", label: "มากกว่า 1,000,000 บาท/เดือน" },
]

const serviceOptions = [
  { value: "ยิงแอด GMV Max", label: "ยิงแอด GMV Max" },
  { value: "วางกลยุทธ์ TikTok Shop", label: "วางกลยุทธ์ TikTok Shop" },
  { value: "Content & Creative", label: "Content & Creative" },
  { value: "ทั้งหมด", label: "ต้องการครบทุกบริการ" },
  { value: "ยังไม่แน่ใจ", label: "ยังไม่แน่ใจ อยากปรึกษาก่อน" },
]

interface Props {
  lineSession:    LineSession | null
  hasSubmitted:   boolean
  lineOaHref:     string
  hasAddedLineOa: boolean
}

export function ContactForm({ lineSession, hasSubmitted, lineOaHref, hasAddedLineOa }: Props) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: lineSession?.displayName ?? "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setApiError(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.status === 401) {
        setApiError("Session หมดอายุ กรุณา Login ด้วย Line ใหม่อีกครั้ง")
        return
      }
      if (!res.ok) {
        setApiError("เกิดข้อผิดพลาด กรุณาลองใหม่")
        return
      }

      setSubmitted(true)
    } catch {
      setApiError("ไม่สามารถส่งข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อ")
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const res = await fetch("/api/auth/line/logout", { method: "POST" })
      if (!res.ok) throw new Error("logout failed")
      router.refresh()
    } catch {
      setApiError("ออกจากระบบไม่สำเร็จ กรุณาลองใหม่")
      setLoggingOut(false)
    }
  }

  // ─── เคยส่งข้อมูลแล้ว ─────────────────────────────────────
  if (hasSubmitted && !submitted) {
    return (
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 sm:p-10 text-center">
        <div className="w-16 h-16 bg-[#06C755]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <LineIcon size={30} className="text-[#06C755]" />
        </div>
        <h3 className="font-display font-bold text-white text-xl mb-2">ส่งข้อมูลแล้ว</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          คุณเคยส่งข้อมูลติดต่อไว้แล้ว สามารถทักหาทีมงานผ่าน Line OA ได้เลยทันที
        </p>
        <a
          href={lineOaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05a847] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
        >
          <LineIcon size={20} className="text-white" />
          เปิด Line OA และส่งข้อความ
        </a>
      </div>
    )
  }

  // ─── ยังไม่ได้ Login ───────────────────────────────────────
  if (!lineSession) {
    return (
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 sm:p-10 text-center">
        <div className="w-16 h-16 bg-[#06C755]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <LineIcon size={30} className="text-[#06C755]" />
        </div>
        <h3 className="font-display font-bold text-white text-xl mb-2">
          เข้าสู่ระบบด้วย Line
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          เพื่อความแม่นยำในการติดต่อกลับ กรุณายืนยันตัวตนด้วย Line ก่อน — ใช้เวลาไม่ถึง 10 วินาที
        </p>
        <a
          href="/api/auth/line"
          className="inline-flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05a847] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
        >
          <LineIcon size={20} className="text-white" />
          เข้าสู่ระบบด้วย Line
        </a>
        <p className="text-slate-500 text-xs mt-5">
          เราจะใช้เฉพาะชื่อและรูปโปรไฟล์ Line เท่านั้น
        </p>
      </div>
    )
  }

  // ─── Login แล้วแต่ยังไม่ได้เพิ่มเพื่อน LINE OA ──────────────
  if (lineSession && !hasAddedLineOa) {
    return (
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 sm:p-10 text-center">
        <div className="w-16 h-16 bg-[#06C755]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <LineIcon size={30} className="text-[#06C755]" />
        </div>
        <h3 className="font-display font-bold text-white text-xl mb-2">
          เพิ่มเพื่อน Line OA ก่อน
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-2 max-w-sm mx-auto">
          กรุณาเพิ่ม <strong className="text-white">NP Create</strong> เป็นเพื่อนใน Line ก่อน
          เพื่อให้ทีมงานสามารถติดต่อกลับได้
        </p>
        <p className="text-slate-500 text-xs mb-8">
          เชื่อมต่อในชื่อ: <span className="text-[#06C755] font-mono">{lineSession.displayName}</span>
        </p>
        <a
          href={lineOaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05a847] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors mb-5"
        >
          <LineIcon size={20} className="text-white" />
          เพิ่มเพื่อน NP Create
        </a>
        <div>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="text-slate-400 hover:text-white text-sm transition-colors underline underline-offset-2"
          >
            เพิ่มเพื่อนแล้ว — ไปต่อ
          </button>
        </div>
      </div>
    )
  }

  // ─── Submit สำเร็จ ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 sm:p-10 text-center">
        <div className="w-16 h-16 bg-[#DC2626]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-[#DC2626]" />
        </div>
        <h3 className="font-display font-bold text-white text-xl mb-2">
          ส่งข้อมูลเรียบร้อยแล้ว!
        </h3>
        <p className="text-slate-400 text-sm mb-1">
          ขอบคุณ <strong className="text-white">{lineSession.displayName}</strong>
        </p>
        <p className="text-slate-400 text-sm mb-8">
          ทีมงานจะติดต่อกลับผ่าน Line ภายใน 1 ชั่วโมง
        </p>
        <a
          href={lineOaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05a847] text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
        >
          <LineIcon size={16} className="text-white" />
          ทักหาเราผ่าน Line OA ได้เลย →
        </a>
      </div>
    )
  }

  // ─── ฟอร์มหลัก ────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-5"
    >
      {/* Profile header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {lineSession.pictureUrl ? (
            <Image
              src={lineSession.pictureUrl}
              alt={lineSession.displayName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#DC2626]/20 flex items-center justify-center">
              <User size={18} className="text-[#DC2626]" />
            </div>
          )}
          <div>
            <p className="text-white text-sm font-medium">{lineSession.displayName}</p>
            <p className="text-[#06C755] text-xs">เชื่อมต่อ Line แล้ว ✓</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors"
        >
          <LogOut size={13} />
          {loggingOut ? "กำลังออก..." : "ออกจากระบบ"}
        </button>
      </div>

      {/* API error */}
      {apiError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {apiError}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="ชื่อ-นามสกุล" error={errors.name?.message} required>
          <input
            {...register("name")}
            placeholder="สมชาย ใจดี"
            className={inputClass(!!errors.name)}
          />
        </Field>

        <Field label="เบอร์โทรศัพท์" error={errors.phone?.message} required>
          <input
            {...register("phone")}
            placeholder="0812345678"
            inputMode="tel"
            className={inputClass(!!errors.phone)}
          />
        </Field>
      </div>

      <Field label="ชื่อแบรนด์ / ร้านค้า TikTok Shop" error={errors.brand?.message} required>
        <input
          {...register("brand")}
          placeholder="เช่น Daily Kitchen, Glow Beauty"
          className={inputClass(!!errors.brand)}
        />
      </Field>

      <Field label="ยอดขายปัจจุบัน (GMV/เดือน)" error={errors.monthly_gmv?.message} required>
        <select {...register("monthly_gmv")} className={inputClass(!!errors.monthly_gmv)}>
          <option value="">— เลือกยอดขายปัจจุบัน —</option>
          {gmvOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      <Field label="บริการที่สนใจ" error={errors.service?.message} required>
        <select {...register("service")} className={inputClass(!!errors.service)}>
          <option value="">— เลือกบริการ —</option>
          {serviceOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      <Field label="ข้อความเพิ่มเติม (ถ้ามี)">
        <textarea
          {...register("message")}
          placeholder="เล่าให้เราฟังได้เลยว่าตอนนี้ shop เป็นยังไง หรือมีคำถามอะไร"
          rows={4}
          className={cn(inputClass(false), "resize-none")}
        />
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            กำลังส่ง...
          </>
        ) : (
          "ส่งข้อมูลและรอการติดต่อกลับ"
        )}
      </button>

      <p className="text-center text-slate-500 text-xs">
        ทีมงานตอบกลับภายใน 1 ชั่วโมง ในเวลาทำการ 9:00–20:00 น.
      </p>
    </form>
  )
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-slate-300 text-sm font-medium">
        {label}
        {required && <span className="text-[#F59E0B] ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full bg-[#0A0808] border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500",
    "focus:outline-none focus:ring-2 transition-colors appearance-none",
    hasError
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-white/10 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20"
  )
}

function LineIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}
