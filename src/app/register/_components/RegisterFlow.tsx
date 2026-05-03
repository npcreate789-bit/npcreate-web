"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import {
  Loader2, Mail, KeyRound, User, Lock, Eye, EyeOff,
  Store, TrendingUp, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LineLoginButton } from "@/components/auth/LineLoginButton"
import { saveRoleAndInfo, type RoleInfoInput } from "../actions"

type Method = "otp" | "password"
type OtpStep = "email" | "otp" | "profile" | "role" | "role_info"
type PasswordStep = "account" | "profile" | "role" | "role_info" | "done"
type RoleChoice = "seller" | "affiliate" | null

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

// ─── Shared: Role Selection ───────────────────────────────────────────────────

function RoleSelector({ selected, onSelect }: {
  selected: RoleChoice
  onSelect: (r: "seller" | "affiliate") => void
}) {
  return (
    <div className="space-y-4">
      <StepHeader
        icon={<User size={15} className="text-[#DC2626]" />}
        title="คุณเข้าร่วมในฐานะ?"
        desc="เลือกประเภทบัญชีให้ตรงกับบทบาทของคุณ"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <RoleCard
          active={selected === "seller"}
          onClick={() => onSelect("seller")}
          icon={<Store size={24} className={selected === "seller" ? "text-emerald-400" : "text-slate-500"} />}
          color={selected === "seller" ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 hover:border-white/20"}
          title="Seller"
          titleColor={selected === "seller" ? "text-emerald-400" : "text-white"}
          desc="เจ้าของร้านค้า / แบรนด์ที่ต้องการหา Affiliate มาช่วยโปรโมทสินค้า"
        />
        <RoleCard
          active={selected === "affiliate"}
          onClick={() => onSelect("affiliate")}
          icon={<TrendingUp size={24} className={selected === "affiliate" ? "text-[#F59E0B]" : "text-slate-500"} />}
          color={selected === "affiliate" ? "border-[#F59E0B]/40 bg-[#F59E0B]/5" : "border-white/10 hover:border-white/20"}
          title="Affiliate"
          titleColor={selected === "affiliate" ? "text-[#F59E0B]" : "text-white"}
          desc="Content Creator / TikTok ที่ต้องการโปรโมทสินค้าและรับค่าคอมมิชชั่น"
        />
      </div>
    </div>
  )
}

function RoleCard({ active, onClick, icon, color, title, titleColor, desc }: {
  active: boolean; onClick: () => void
  icon: React.ReactNode; color: string
  title: string; titleColor: string; desc: string
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "relative text-left rounded-2xl border-2 p-4 transition-all space-y-2",
        color,
        active && "ring-1 ring-offset-1 ring-offset-[#0A0808]",
        active && title === "Seller" && "ring-emerald-500/30",
        active && title === "Affiliate" && "ring-[#F59E0B]/30",
      )}>
      {active && (
        <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-current flex items-center justify-center">
          <span className={cn("w-2 h-2 rounded-full bg-[#0A0808]")} />
        </span>
      )}
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{icon}</div>
      <p className={cn("font-bold text-sm", titleColor)}>{title}</p>
      <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
    </button>
  )
}

// ─── Shared: Role Info Form ───────────────────────────────────────────────────

function RoleInfoForm({ role, onSubmit, loading, error }: {
  role: "seller" | "affiliate"
  onSubmit: (data: { storeName?: string; storeTiktokUrl?: string; tiktokChannelUrl?: string }) => void
  loading: boolean
  error: string | null
}) {
  const [storeName, setStoreName] = useState("")
  const [storeTiktokUrl, setStoreTiktokUrl] = useState("")
  const [tiktokChannelUrl, setTiktokChannelUrl] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (role === "seller") {
      onSubmit({ storeName, storeTiktokUrl })
    } else {
      onSubmit({ tiktokChannelUrl })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {role === "seller" ? (
        <>
          <StepHeader
            icon={<Store size={15} className="text-emerald-400" />}
            title="ข้อมูลร้านค้าของคุณ"
            desc="ใช้แสดงให้ Affiliate เห็นเมื่อเลือกสินค้าของคุณ"
          />
          <Field label="ชื่อร้านค้า / แบรนด์ *">
            <input value={storeName} onChange={e => setStoreName(e.target.value)}
              placeholder="เช่น NP Shop, My Brand TH" required autoFocus
              className={inputCls()} />
          </Field>
          <Field label="ลิงก์ TikTok Shop (ถ้ามี)">
            <input value={storeTiktokUrl} onChange={e => setStoreTiktokUrl(e.target.value)}
              placeholder="https://shop.tiktok.com/..." type="url"
              className={inputCls()} />
          </Field>
        </>
      ) : (
        <>
          <StepHeader
            icon={<TrendingUp size={15} className="text-[#F59E0B]" />}
            title="ช่องทาง TikTok ของคุณ"
            desc="Seller ใช้ดูเพื่อพิจารณาส่งสินค้าตัวอย่างให้คุณ"
          />
          <Field label="ลิงก์ช่อง TikTok (แนะนำมาก)">
            <input value={tiktokChannelUrl} onChange={e => setTiktokChannelUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@username" type="url"
              className={inputCls()} />
          </Field>
          <p className="text-slate-600 text-xs">
            ข้ามได้ แต่กรอกเพื่อเพิ่มโอกาสรับสินค้าตัวอย่างจากร้านค้า
          </p>
        </>
      )}
      {error && <ErrorBox msg={error} />}
      <button type="submit" disabled={loading || (role === "seller" && !storeName.trim())}
        className={btnCls()}>
        {loading
          ? <><Loader2 size={14} className="animate-spin" /> กำลังบันทึก...</>
          : <><span>สมัครสมาชิก</span> <ChevronRight size={14} /></>}
      </button>
    </form>
  )
}

// ─── OTP Register Flow ────────────────────────────────────────────────────────

function OtpRegisterFlow() {
  const router = useRouter()
  const [step, setStep]         = useState<OtpStep>("email")
  const [email, setEmail]       = useState("")
  const [otp, setOtp]           = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone]       = useState("")
  const [role, setRole]         = useState<RoleChoice>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const steps: OtpStep[] = ["email", "otp", "profile", "role", "role_info"]
  const stepLabels = ["Email", "OTP", "โปรไฟล์", "ประเภท", "ข้อมูล"]
  const stepIdx = steps.indexOf(step)

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const alreadyExists = await checkEmailExists(email)
      if (alreadyExists) { setError("__duplicate__"); return }
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
          .from("profiles").select("full_name, role_confirmed").eq("id", data.user.id).maybeSingle()
        if (profile?.full_name && profile?.role_confirmed) {
          router.push("/member"); router.refresh(); return
        }
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
      setStep("role")
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกข้อมูลไม่สำเร็จ")
    } finally { setLoading(false) }
  }

  function handleRoleNext() {
    if (!role) { setError("กรุณาเลือกประเภทบัญชี"); return }
    setError(null)
    setStep("role_info")
  }

  function handleRoleInfoSubmit(data: { storeName?: string; storeTiktokUrl?: string; tiktokChannelUrl?: string }) {
    if (!role) return
    const input: RoleInfoInput = role === "seller"
      ? { role: "seller", store_name: data.storeName ?? "", store_tiktok_url: data.storeTiktokUrl }
      : { role: "affiliate", tiktok_channel_url: data.tiktokChannelUrl }

    startTransition(async () => {
      const result = await saveRoleAndInfo(input)
      if ("error" in result) { setError(result.error); return }
      router.push(result.redirectTo)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <StepIndicator steps={stepLabels} current={stepIdx} />
      {error && step !== "role_info" && <ErrorBox msg={error} />}

      {step === "email" && (
        <form onSubmit={sendOtp} className="space-y-4">
          <StepHeader icon={<Mail size={15} className="text-[#DC2626]" />} title="Gmail ของคุณ" desc="ระบบจะส่งรหัส OTP ไปที่ Gmail" />
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(null) }}
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
            onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setError(null) }}
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
          <StepHeader icon={<User size={15} className="text-[#DC2626]" />} title="ข้อมูลส่วนตัว" desc="ชื่อที่แสดงในระบบ" />
          <Field label="ชื่อ-สกุล *">
            <input value={fullName} onChange={e => { setFullName(e.target.value); setError(null) }}
              placeholder="ชื่อ นามสกุล" required autoFocus className={inputCls()} />
          </Field>
          <Field label="เบอร์โทรศัพท์">
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="08x-xxx-xxxx" type="tel" className={inputCls()} />
          </Field>
          <button type="submit" disabled={loading || !fullName.trim()} className={btnCls()}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังบันทึก...</> : "ถัดไป →"}
          </button>
        </form>
      )}

      {step === "role" && (
        <div className="space-y-4">
          <RoleSelector selected={role} onSelect={r => { setRole(r); setError(null) }} />
          {error && <ErrorBox msg={error} />}
          <button type="button" onClick={handleRoleNext} disabled={!role} className={btnCls()}>
            ถัดไป →
          </button>
          <button type="button" onClick={() => { setStep("profile"); setError(null) }}
            className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← ย้อนกลับ
          </button>
        </div>
      )}

      {step === "role_info" && role && (
        <RoleInfoForm
          role={role}
          onSubmit={handleRoleInfoSubmit}
          loading={pending}
          error={error}
        />
      )}
      {step === "role_info" && (
        <button type="button" onClick={() => { setStep("role"); setError(null) }}
          className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors -mt-2">
          ← เปลี่ยนประเภทบัญชี
        </button>
      )}
    </div>
  )
}

// ─── Password Register Flow ───────────────────────────────────────────────────

function PasswordRegisterFlow() {
  const router = useRouter()
  const [step, setStep]               = useState<PasswordStep>("account")
  const [email, setEmail]             = useState("")
  const [password, setPassword]       = useState("")
  const [confirm, setConfirm]         = useState("")
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fullName, setFullName]       = useState("")
  const [phone, setPhone]             = useState("")
  const [role, setRole]               = useState<RoleChoice>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState("")
  const [pending, startTransition]    = useTransition()

  const steps: PasswordStep[] = ["account", "profile", "role", "role_info"]
  const stepLabels = ["บัญชี", "โปรไฟล์", "ประเภท", "ข้อมูล"]
  const stepIdx = steps.indexOf(step)

  function validateAccount() {
    if (password.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return false }
    if (password !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return false }
    return true
  }

  async function nextFromAccount(e: React.FormEvent) {
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

  function handleRoleNext() {
    if (!role) { setError("กรุณาเลือกประเภทบัญชี"); return }
    setError(null)
    setStep("role_info")
  }

  async function handleRoleInfoSubmit(data: { storeName?: string; storeTiktokUrl?: string; tiktokChannelUrl?: string }) {
    if (!role) return
    setError(null); setLoading(true)

    try {
      const supabase = createClient()
      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      })
      if (signUpError) throw signUpError

      // Update profile with name + phone
      if (authData.user) {
        await supabase.from("profiles")
          .update({ full_name: fullName.trim(), phone: phone.trim() })
          .eq("id", authData.user.id)
      }

      if (authData.session) {
        // Session available → save role immediately
        const input: RoleInfoInput = role === "seller"
          ? { role: "seller", store_name: data.storeName ?? "", store_tiktok_url: data.storeTiktokUrl }
          : { role: "affiliate", tiktok_channel_url: data.tiktokChannelUrl }

        startTransition(async () => {
          const result = await saveRoleAndInfo(input)
          if ("error" in result) { setError(result.error); return }
          router.push(result.redirectTo)
          router.refresh()
        })
      } else {
        // Email confirmation required — show done screen
        setPendingEmail(email)
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
          <span className="text-white font-medium">{pendingEmail}</span><br />
          กรุณาคลิกลิงก์ในอีเมลเพื่อเปิดใช้งานบัญชี
        </p>
        <p className="text-slate-600 text-xs">ตรวจสอบโฟลเดอร์ Spam หากไม่พบอีเมล</p>
        <p className="text-slate-600 text-xs mt-2">
          เมื่อยืนยันแล้ว ระบบจะให้เลือกประเภทบัญชีของคุณ
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StepIndicator steps={stepLabels} current={stepIdx} />
      {error && step !== "role_info" && <ErrorBox msg={error} />}

      {step === "account" && (
        <form onSubmit={nextFromAccount} className="space-y-4">
          <StepHeader icon={<Lock size={15} className="text-[#DC2626]" />} title="ข้อมูลบัญชี" desc="อีเมลและรหัสผ่านสำหรับเข้าสู่ระบบ" />
          <Field label="อีเมล">
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(null) }}
              placeholder="example@gmail.com" required autoFocus className={inputCls()} />
          </Field>
          <Field label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)">
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
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
                onChange={e => { setConfirm(e.target.value); setError(null) }}
                placeholder="••••••••" required className={cn(inputCls(), "pr-10")} />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <button type="submit" disabled={loading || !email || !password || !confirm} className={btnCls()}>
            {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังตรวจสอบ...</> : "ถัดไป →"}
          </button>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={e => { e.preventDefault(); setStep("role") }} className="space-y-4">
          <StepHeader icon={<User size={15} className="text-[#DC2626]" />} title="ข้อมูลส่วนตัว" desc="ชื่อที่แสดงในระบบ" />
          <Field label="ชื่อ-สกุล *">
            <input value={fullName} onChange={e => { setFullName(e.target.value); setError(null) }}
              placeholder="ชื่อ นามสกุล" required autoFocus className={inputCls()} />
          </Field>
          <Field label="เบอร์โทรศัพท์">
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="08x-xxx-xxxx" type="tel" className={inputCls()} />
          </Field>
          <button type="submit" disabled={!fullName.trim()} className={btnCls()}>ถัดไป →</button>
          <button type="button" onClick={() => { setStep("account"); setError(null) }}
            className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← แก้ไขข้อมูลบัญชี
          </button>
        </form>
      )}

      {step === "role" && (
        <div className="space-y-4">
          <RoleSelector selected={role} onSelect={r => { setRole(r); setError(null) }} />
          {error && <ErrorBox msg={error} />}
          <button type="button" onClick={handleRoleNext} disabled={!role} className={btnCls()}>
            ถัดไป →
          </button>
          <button type="button" onClick={() => { setStep("profile"); setError(null) }}
            className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← ย้อนกลับ
          </button>
        </div>
      )}

      {step === "role_info" && role && (
        <RoleInfoForm
          role={role}
          onSubmit={handleRoleInfoSubmit}
          loading={loading || pending}
          error={error}
        />
      )}
      {step === "role_info" && (
        <button type="button" onClick={() => { setStep("role"); setError(null) }}
          className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors -mt-2">
          ← เปลี่ยนประเภทบัญชี
        </button>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RegisterFlow() {
  const [method, setMethod]       = useState<Method>("password")
  const [showEmail, setShowEmail] = useState(false)

  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 space-y-5">
      <div className="space-y-2">
        <LineLoginButton label="สมัครสมาชิกด้วย LINE" next="/member/setup-role" />
        <p className="text-center text-slate-600 text-xs leading-relaxed">
          สมัครและเข้าสู่ระบบด้วย LINE account
        </p>
      </div>

      <Divider label="หรือ" />

      <div>
        <button type="button" onClick={() => setShowEmail(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 border border-white/10 rounded-xl text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors text-sm">
          <span className="flex items-center gap-2"><Mail size={14} /> สมัครด้วยอีเมล</span>
          <span className="text-xs">{showEmail ? "▲" : "▼"}</span>
        </button>

        {showEmail && (
          <div className="mt-4 space-y-4">
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
        )}
      </div>
    </div>
  )
}

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
              current === i ? "bg-[#DC2626] text-white" :
              current > i  ? "bg-[#DC2626]/30 text-[#FCA5A5]" :
              "bg-white/5 text-slate-500"
            )}>{i + 1}</div>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("flex-1 h-px", current > i ? "bg-[#DC2626]/30" : "bg-white/5")} />
          )}
        </div>
      ))}
    </div>
  )
}

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
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-base",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}

function btnCls() {
  return "w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
}
