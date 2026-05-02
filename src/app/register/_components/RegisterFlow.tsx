"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, KeyRound, User, Lock, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { LineLoginButton } from "@/components/auth/LineLoginButton"

type Method = "otp" | "password"
type OtpStep = "email" | "otp" | "profile"
type PasswordStep = "account" | "profile" | "done"

async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    return data?.exists === true
  } catch {
    return false
  }
}

// ─── OTP Register Flow ───────────────────────────────────────────────────────

function OtpRegisterFlow() {
  const router = useRouter()
  const [step, setStep]         = useState<OtpStep>("email")
  const [email, setEmail]       = useState("")
  const [otp, setOtp]           = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const steps: OtpStep[] = ["email", "otp", "profile"]
  const stepIdx = steps.indexOf(step)

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const alreadyExists = await checkEmailExists(email)
      if (alreadyExists) {
        setError("__duplicate__")
        return
      }
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
      if (error) throw error
      setStep("otp")
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่ง OTP ไม่สำเร็จ")
    } finally { setLoading(false) }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" })
      if (error) throw error
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles").select("full_name").eq("id", data.user.id).maybeSingle()
        if (profile?.full_name) { router.push("/member"); router.refresh(); return }
      }
      setStep("profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP ไม่ถูกต้องหรือหมดอายุ")
    } finally { setLoading(false) }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setError("กรุณากรอกชื่อ-สกุล"); return }
    setError(null); setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้")
      const { error } = await supabase.from("profiles")
        .update({ full_name: fullName.trim(), phone: phone.trim() })
        .eq("id", user.id)
      if (error) throw error
      router.push("/member"); router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกข้อมูลไม่สำเร็จ")
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              step === s ? "bg-[#DC2626] text-white" :
              stepIdx > i ? "bg-[#DC2626]/30 text-[#FCA5A5]" :
              "bg-white/5 text-slate-500"
            )}>{i + 1}</div>
            {i < 2 && <div className={cn("flex-1 h-px", stepIdx > i ? "bg-[#DC2626]/30" : "bg-white/5")} />}
          </div>
        ))}
      </div>

      {error && <ErrorBox msg={error} />}

      {step === "email" && (
        <form onSubmit={sendOtp} className="space-y-4">
          <StepHeader icon={<Mail size={15} className="text-[#DC2626]" />} title="Gmail ของคุณ" desc="ระบบจะส่งรหัส OTP ไปที่ Gmail" />
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null) }}
            placeholder="example@gmail.com" required autoFocus className={inputCls()} />
          <button type="submit" disabled={loading || !email} className={btnCls()}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังส่ง...</> : "ส่ง OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <StepHeader icon={<KeyRound size={15} className="text-[#DC2626]" />} title="กรอก OTP"
            desc={<>ส่งรหัส 6 หลักไปที่ <span className="text-slate-300">{email}</span></>} />
          <input type="text" value={otp} inputMode="numeric" maxLength={6}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(null) }}
            placeholder="000000" required autoFocus
            className={cn(inputCls(), "text-center text-2xl tracking-[0.5em] font-mono")} />
          <button type="submit" disabled={loading || otp.length < 6} className={btnCls()}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังยืนยัน...</> : "ยืนยัน OTP"}
          </button>
          <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(null) }}
            className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← เปลี่ยน email
          </button>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={saveProfile} className="space-y-4">
          <StepHeader icon={<User size={15} className="text-[#DC2626]" />} title="ข้อมูลสมาชิก" desc="กรอกข้อมูลเพื่อสมัครสมาชิก" />
          <Field label="ชื่อ-สกุล *">
            <input value={fullName} onChange={(e) => { setFullName(e.target.value); setError(null) }}
              placeholder="ชื่อ นามสกุล" required autoFocus className={inputCls()} />
          </Field>
          <Field label="เบอร์โทรศัพท์">
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="08x-xxx-xxxx" type="tel" className={inputCls()} />
          </Field>
          <button type="submit" disabled={loading || !fullName.trim()} className={btnCls()}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังบันทึก...</> : "สมัครสมาชิก"}
          </button>
        </form>
      )}
    </div>
  )
}

// ─── Password Register Flow ──────────────────────────────────────────────────

function PasswordRegisterFlow() {
  const router = useRouter()
  const [step, setStep]             = useState<PasswordStep>("account")
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [confirm, setConfirm]       = useState("")
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fullName, setFullName]     = useState("")
  const [phone, setPhone]           = useState("")
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const steps: PasswordStep[] = ["account", "profile", "done"]
  const stepIdx = steps.indexOf(step)

  function validateAccount() {
    if (password.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return false }
    if (password !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return false }
    return true
  }

  async function nextStep(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!validateAccount()) return
    setLoading(true)
    try {
      const alreadyExists = await checkEmailExists(email)
      if (alreadyExists) { setError("__duplicate__"); return }
    } finally { setLoading(false) }
    setStep("profile")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setError("กรุณากรอกชื่อ-สกุล"); return }
    setError(null); setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      // Update profile with provided info
      if (data.user) {
        await supabase.from("profiles")
          .update({ full_name: fullName.trim(), phone: phone.trim() })
          .eq("id", data.user.id)
      }

      // Immediate session = email confirm disabled, log in right away
      if (data.session) {
        router.push("/member"); router.refresh()
      } else {
        setStep("done")
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already been registered")) {
        setError("__duplicate__")
      } else {
        setError(msg || "สมัครสมาชิกไม่สำเร็จ")
      }
    } finally { setLoading(false) }
  }

  if (step === "done") {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <Mail size={28} className="text-emerald-400" />
        </div>
        <h2 className="text-white font-semibold text-base">ยืนยัน Email ของคุณ</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          ส่งลิงก์ยืนยันไปที่<br />
          <span className="text-white font-medium">{email}</span><br />
          กรุณาคลิกลิงก์ในอีเมลเพื่อเปิดใช้งานบัญชี
        </p>
        <p className="text-slate-600 text-xs">ตรวจสอบโฟลเดอร์ Spam หากไม่พบอีเมล</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(["account", "profile"] as PasswordStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              step === s ? "bg-[#DC2626] text-white" :
              stepIdx > i ? "bg-[#DC2626]/30 text-[#FCA5A5]" :
              "bg-white/5 text-slate-500"
            )}>{i + 1}</div>
            {i < 1 && <div className={cn("flex-1 h-px", stepIdx > i ? "bg-[#DC2626]/30" : "bg-white/5")} />}
          </div>
        ))}
      </div>

      {error && <ErrorBox msg={error} />}

      {step === "account" && (
        <form onSubmit={nextStep} className="space-y-4">
          <StepHeader icon={<Lock size={15} className="text-[#DC2626]" />} title="ข้อมูลบัญชี" desc="อีเมลและรหัสผ่านสำหรับเข้าสู่ระบบ" />
          <Field label="อีเมล">
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="example@gmail.com" required autoFocus className={inputCls()} />
          </Field>
          <Field label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)">
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder="••••••••" required className={cn(inputCls(), "pr-10")} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="ยืนยันรหัสผ่าน">
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(null) }}
                placeholder="••••••••" required className={cn(inputCls(), "pr-10")} />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <button type="submit" disabled={!email || !password || !confirm} className={btnCls()}>
            ถัดไป →
          </button>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <StepHeader icon={<User size={15} className="text-[#DC2626]" />} title="ข้อมูลสมาชิก" desc="กรอกข้อมูลเพื่อสมัครสมาชิก" />
          <Field label="ชื่อ-สกุล *">
            <input value={fullName} onChange={(e) => { setFullName(e.target.value); setError(null) }}
              placeholder="ชื่อ นามสกุล" required autoFocus className={inputCls()} />
          </Field>
          <Field label="เบอร์โทรศัพท์">
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="08x-xxx-xxxx" type="tel" className={inputCls()} />
          </Field>
          <button type="submit" disabled={loading || !fullName.trim()} className={btnCls()}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังสมัคร...</> : "สมัครสมาชิก"}
          </button>
          <button type="button" onClick={() => { setStep("account"); setError(null) }}
            className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← แก้ไขข้อมูลบัญชี
          </button>
        </form>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function RegisterFlow() {
  const [method, setMethod] = useState<Method>("password")

  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 space-y-6">

      {/* LINE register — primary CTA */}
      <LineLoginButton label="สมัครสมาชิกด้วย LINE" next="/member" />

      <Divider label="หรือสมัครด้วยอีเมล" />

      {/* Method toggle */}
      <div className="flex rounded-xl bg-white/5 p-1 gap-1">
        <MethodTab active={method === "password"} onClick={() => setMethod("password")}>
          <Lock size={13} /> รหัสผ่าน
        </MethodTab>
        <MethodTab active={method === "otp"} onClick={() => setMethod("otp")}>
          <Mail size={13} /> OTP (Gmail)
        </MethodTab>
      </div>

      {method === "password" ? <PasswordRegisterFlow /> : <OtpRegisterFlow />}
    </div>
  )
}

// ─── Shared UI Helpers ───────────────────────────────────────────────────────

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-slate-600 text-xs">{label}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  )
}

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

function StepHeader({ icon, title, desc }: {
  icon: React.ReactNode; title: string; desc: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-white font-semibold text-sm">{title}</span>
      </div>
      <p className="text-slate-500 text-xs">{desc}</p>
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

function ErrorBox({ msg }: { msg: string }) {
  if (msg === "__duplicate__") {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm px-4 py-3 rounded-xl text-center leading-relaxed">
        อีเมลนี้มีบัญชีอยู่แล้ว{" "}
        <Link href="/member/login" className="underline underline-offset-2 hover:text-amber-300 transition-colors font-medium">
          เข้าสู่ระบบ
        </Link>{" "}
        แทน
      </div>
    )
  }
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
