"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import {
  CheckCircle2, Loader2, Mail, Eye, EyeOff, ChevronDown, ChevronUp,
} from "lucide-react"

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  name:        z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  phone:       z.string().regex(/^0[6-9]\d{8}$/, "เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)"),
  brand:       z.string().min(2, "กรุณากรอกชื่อแบรนด์หรือร้านค้า"),
  monthly_gmv: z.string().min(1, "กรุณาเลือกยอดขายปัจจุบัน"),
  service:     z.string().min(1, "กรุณาเลือกบริการที่สนใจ"),
  message:     z.string().optional(),
})

type FormData = z.infer<typeof schema>

const gmvOptions = [
  { value: "ยังไม่เปิดร้าน",  label: "ยังไม่เปิดร้าน" },
  { value: "น้อยกว่า 50K",    label: "น้อยกว่า 50,000 บาท/เดือน" },
  { value: "50K-200K",        label: "50,000 – 200,000 บาท/เดือน" },
  { value: "200K-1M",         label: "200,000 – 1,000,000 บาท/เดือน" },
  { value: "1M+",             label: "มากกว่า 1,000,000 บาท/เดือน" },
]

const serviceOptions = [
  { value: "ยิงแอด GMV Max",          label: "ยิงแอด GMV Max" },
  { value: "วางกลยุทธ์ TikTok Shop",  label: "วางกลยุทธ์ TikTok Shop" },
  { value: "Content & Creative",      label: "Content & Creative" },
  { value: "ทั้งหมด",                  label: "ต้องการครบทุกบริการ" },
  { value: "ยังไม่แน่ใจ",              label: "ยังไม่แน่ใจ อยากปรึกษาก่อน" },
]

type LineSession = { userId: string; displayName: string; pictureUrl: string }

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  hasSubmitted: boolean
  lineSession:  LineSession | null
  isMember:     boolean
}

// ─── Login Prompt — แสดงเมื่อยังไม่ได้ login ─────────────────────────────────

function LoginPrompt() {
  const router = useRouter()
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const lineHref = "/api/auth/line?mode=member&returnTo=/contact"

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const supabase = createClient()
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) throw authErr
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-5">

      {/* Header */}
      <div className="text-center space-y-1.5">
        <p className="text-white font-semibold text-base">กรุณาเข้าสู่ระบบก่อนส่งข้อมูล</p>
        <p className="text-slate-500 text-sm">เพื่อให้ทีมงานติดต่อกลับได้อย่างถูกต้อง</p>
      </div>

      {/* LINE */}
      <div className="space-y-2">
        <a
          href={lineHref}
          className="w-full flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05a847] active:bg-[#048a3c] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          <LineIcon size={18} />
          เข้าสู่ระบบด้วย LINE
        </a>
        <p className="text-center text-slate-600 text-xs">
          📱 มือถือ: กด <strong className="text-slate-500">เปิดด้วย LINE</strong> → กด <strong className="text-slate-500">อนุญาต</strong>
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-slate-700 text-xs">หรือ</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Email toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowEmail(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 border border-white/10 rounded-xl text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors text-sm"
        >
          <span className="flex items-center gap-2">
            <Mail size={14} />
            เข้าสู่ระบบด้วยอีเมล
          </span>
          {showEmail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showEmail && (
          <form onSubmit={handleLogin} className="mt-3 space-y-3">
            {error && <ErrorBox msg={error} />}
            <input
              type="email" value={email} autoFocus
              onChange={e => { setEmail(e.target.value); setError(null) }}
              placeholder="example@gmail.com" required
              className={inputClass(false)}
            />
            <div className="relative">
              <input
                type={showPass ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="รหัสผ่าน" required
                className={cn(inputClass(false), "pr-10")}
              />
              <button
                type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button
              type="submit" disabled={loading || !email || !password}
              className="w-full inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> กำลังเข้าสู่ระบบ...</>
                : "เข้าสู่ระบบ"
              }
            </button>
            <div className="text-center">
              <a href="/member/forgot-password" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                ลืมรหัสผ่าน?
              </a>
            </div>
          </form>
        )}
      </div>

      <p className="text-center text-slate-600 text-xs">
        ยังไม่มีบัญชี?{" "}
        <a href="/register" className="text-slate-400 hover:text-white underline transition-colors">
          สมัครสมาชิกฟรี
        </a>
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContactForm({ hasSubmitted, lineSession, isMember }: Props) {
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [apiError, setApiError]           = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setApiError(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...(lineSession ? {
            line_user_id: lineSession.userId,
            display_name: lineSession.displayName,
          } : {}),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setApiError(body?.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
        return
      }
      setJustSubmitted(true)
    } catch {
      setApiError("ไม่สามารถส่งข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต")
    }
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (hasSubmitted || justSubmitted) {
    return (
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 sm:p-10 text-center">
        <div className="w-16 h-16 bg-[#DC2626]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-[#DC2626]" />
        </div>
        <h3 className="font-display font-bold text-white text-xl mb-2">
          {justSubmitted ? "ส่งข้อมูลเรียบร้อยแล้ว!" : "คุณเคยส่งข้อมูลไว้แล้ว"}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
          ทีมงานได้รับข้อมูลของคุณแล้ว และจะติดต่อกลับภายใน 1 ชั่วโมง
          ในเวลาทำการ 9:00–20:00 น.
        </p>
        <p className="text-slate-600 text-xs mt-4">
          หรือรอทีมงานติดต่อกลับผ่านเบอร์โทรที่กรอกไว้
        </p>
      </div>
    )
  }

  // ── ยังไม่ได้ login → แสดง Login Prompt ─────────────────────────────────────
  if (!isMember) {
    return <LoginPrompt />
  }

  // ── Login แล้ว → แสดงฟอร์ม ──────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-5"
    >
      {apiError && <ErrorBox msg={apiError} />}

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
          {gmvOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      <Field label="บริการที่สนใจ" error={errors.service?.message} required>
        <select {...register("service")} className={inputClass(!!errors.service)}>
          <option value="">— เลือกบริการ —</option>
          {serviceOptions.map(o => (
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
        className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors"
      >
        {isSubmitting
          ? <><Loader2 size={16} className="animate-spin" /> กำลังส่ง...</>
          : "ส่งข้อมูลและรอการติดต่อกลับ"
        }
      </button>

      <p className="text-center text-slate-500 text-xs">
        ทีมงานตอบกลับภายใน 1 ชั่วโมง ในเวลาทำการ 9:00–20:00 น.
      </p>
    </form>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
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

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
      {msg}
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

function LineIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}
