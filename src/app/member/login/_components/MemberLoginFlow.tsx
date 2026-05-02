"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, Lock, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { LineIcon } from "@/components/auth/LineIcon"

// ─── OTP Login Flow ──────────────────────────────────────────────────────────

function OtpLoginFlow({ next }: { next: string }) {
  const router = useRouter()
  const [step, setStep]       = useState<"email" | "otp">("email")
  const [email, setEmail]     = useState("")
  const [otp, setOtp]         = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
      if (error) throw error
      setStep("otp")
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่พบบัญชีที่ใช้ email นี้")
    } finally { setLoading(false) }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" })
      if (error) throw error
      router.push(next); router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP ไม่ถูกต้องหรือหมดอายุ")
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-3">
      {error && <ErrorBox msg={error} />}
      {step === "email" ? (
        <form onSubmit={sendOtp} className="space-y-3">
          <input type="email" value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            placeholder="example@gmail.com" required autoFocus className={inputCls()} />
          <button type="submit" disabled={loading || !email} className={btnCls("outline")}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังส่ง OTP...</> : "ส่ง OTP ไปที่ Gmail"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-3">
          <p className="text-slate-500 text-xs">ส่ง OTP 6 หลักไปที่ <span className="text-slate-300">{email}</span></p>
          <input type="text" value={otp} inputMode="numeric" maxLength={6}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(null) }}
            placeholder="000000" required autoFocus
            className={cn(inputCls(), "text-center text-2xl tracking-[0.5em] font-mono")} />
          <button type="submit" disabled={loading || otp.length < 6} className={btnCls("outline")}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังยืนยัน...</> : "ยืนยัน OTP"}
          </button>
          <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(null) }}
            className="w-full text-slate-500 hover:text-slate-300 text-xs transition-colors">
            ← เปลี่ยน email
          </button>
        </form>
      )}
    </div>
  )
}

// ─── Password Login Flow ─────────────────────────────────────────────────────

function PasswordLoginFlow({ next }: { next: string }) {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push(next); router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <ErrorBox msg={error} />}
      <input type="email" value={email}
        onChange={(e) => { setEmail(e.target.value); setError(null) }}
        placeholder="example@gmail.com" required autoFocus className={inputCls()} />
      <div className="relative">
        <input type={showPass ? "text" : "password"} value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null) }}
          placeholder="รหัสผ่าน" required className={cn(inputCls(), "pr-10")} />
        <button type="button" onClick={() => setShowPass(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      <button type="submit" disabled={loading || !email || !password} className={btnCls("outline")}>
        {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังเข้าสู่ระบบ...</> : "เข้าสู่ระบบ"}
      </button>
      <div className="text-center">
        <Link href="/member/forgot-password" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
          ลืมรหัสผ่าน?
        </Link>
      </div>
    </form>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MemberLoginFlow() {
  const searchParams   = useSearchParams()
  const next           = searchParams.get("next") ?? "/member"
  const [showEmail, setShowEmail] = useState(false)
  const [method, setMethod]       = useState<"password" | "otp">("password")

  const lineOauthHref = `/api/auth/line?mode=member&returnTo=${encodeURIComponent(next)}`

  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 space-y-5">

      {/* ── LINE OAuth — ปุ่มหลัก ── */}
      <div className="space-y-2.5">
        <a
          href={lineOauthHref}
          className="w-full flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05a847] active:bg-[#048a3c] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          <LineIcon size={18} />
          เข้าสู่ระบบด้วย LINE
        </a>
        <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
          <p className="text-slate-500 text-xs leading-relaxed text-center">
            📱 มือถือ: หน้าที่เปิดขึ้นให้กด <strong className="text-slate-300">เปิดด้วย LINE</strong> → กด <strong className="text-slate-300">อนุญาต</strong>
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-slate-700 text-xs">หรือ</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* ── อีเมล (ซ่อนอยู่ — กด expand) ── */}
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
          <div className="mt-4 space-y-4">
            {/* Method toggle */}
            <div className="flex rounded-xl bg-white/5 p-1 gap-1">
              <MethodTab active={method === "password"} onClick={() => setMethod("password")}>
                <Lock size={12} /> รหัสผ่าน
              </MethodTab>
              <MethodTab active={method === "otp"} onClick={() => setMethod("otp")}>
                <Mail size={12} /> OTP (Gmail)
              </MethodTab>
            </div>
            {method === "password"
              ? <PasswordLoginFlow next={next} />
              : <OtpLoginFlow next={next} />
            }
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Shared UI Helpers ───────────────────────────────────────────────────────

function MethodTab({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
        active ? "bg-[#DC2626] text-white shadow" : "text-slate-400 hover:text-slate-200"
      )}>
      {children}
    </button>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
      {msg}
    </div>
  )
}

function inputCls() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}

function btnCls(variant: "solid" | "outline" = "solid") {
  if (variant === "outline") {
    return "w-full inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
  }
  return "w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
}
