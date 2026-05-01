"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, KeyRound, Lock, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

type Method = "otp" | "password"

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
      setError(err instanceof Error ? err.message : "ส่ง OTP ไม่สำเร็จ กรุณาตรวจสอบ email")
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
    <div className="space-y-4">
      {error && <ErrorBox msg={error} />}

      {step === "email" && (
        <form onSubmit={sendOtp} className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail size={15} className="text-[#DC2626]" />
            <span className="text-white font-semibold text-sm">Gmail ของคุณ</span>
          </div>
          <input type="email" value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            placeholder="example@gmail.com" required autoFocus className={inputCls()} />
          <button type="submit" disabled={loading || !email} className={btnCls()}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังส่ง OTP...</> : "ส่ง OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <KeyRound size={15} className="text-[#DC2626]" />
              <span className="text-white font-semibold text-sm">กรอก OTP</span>
            </div>
            <p className="text-slate-500 text-xs mb-4">ส่งรหัส 6 หลักไปที่ <span className="text-slate-300">{email}</span></p>
            <input type="text" value={otp} inputMode="numeric" maxLength={6}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(null) }}
              placeholder="000000" required autoFocus
              className={cn(inputCls(), "text-center text-2xl tracking-[0.5em] font-mono")} />
          </div>
          <button type="submit" disabled={loading || otp.length < 6} className={btnCls()}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังยืนยัน...</> : "เข้าสู่ระบบ"}
          </button>
          <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(null) }}
            className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors">
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBox msg={error} />}

      <div className="flex items-center gap-2 mb-1">
        <Lock size={15} className="text-[#DC2626]" />
        <span className="text-white font-semibold text-sm">อีเมลและรหัสผ่าน</span>
      </div>

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

      <button type="submit" disabled={loading || !email || !password} className={btnCls()}>
        {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังเข้าสู่ระบบ...</> : "เข้าสู่ระบบ"}
      </button>

      <div className="text-center">
        <Link href="/member/forgot-password"
          className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
          ลืมรหัสผ่าน?
        </Link>
      </div>
    </form>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MemberLoginFlow() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/member"
  const [method, setMethod] = useState<Method>("password")

  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 space-y-6">
      {/* Method toggle */}
      <div className="flex rounded-xl bg-white/5 p-1 gap-1">
        <MethodTab active={method === "password"} onClick={() => setMethod("password")}>
          <Lock size={13} /> รหัสผ่าน
        </MethodTab>
        <MethodTab active={method === "otp"} onClick={() => setMethod("otp")}>
          <Mail size={13} /> OTP (Gmail)
        </MethodTab>
      </div>

      {method === "password"
        ? <PasswordLoginFlow next={next} />
        : <OtpLoginFlow next={next} />
      }
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

function btnCls() {
  return "w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
}
