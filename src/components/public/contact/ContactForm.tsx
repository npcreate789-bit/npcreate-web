"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Store, TrendingUp, Lock, ShieldCheck,
  Mail, Eye, EyeOff, ChevronDown, ChevronUp, Loader2,
  CheckCircle2, UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { SellerContactForm } from "./SellerContactForm"
import { AffiliateContactForm } from "./AffiliateContactForm"
import { ContactInfo } from "./ContactInfo"

type UserRole    = "seller" | "affiliate" | "admin" | null
type LineSession = { userId: string; displayName: string; pictureUrl: string }

interface Props {
  userRole:              UserRole
  sellerHasSubmitted:    boolean
  affiliateHasSubmitted: boolean
  lineSession:           LineSession | null
  isMember:              boolean
  lineOaHref:            string
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────

function AuthGate() {
  const router                        = useRouter()
  const [showEmail, setShowEmail]     = useState(false)
  const [email, setEmail]             = useState("")
  const [password, setPassword]       = useState("")
  const [showPass, setShowPass]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [loginError, setLoginError]   = useState<string | null>(null)

  const lineHref = "/api/auth/line?mode=member&returnTo=/contact"

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.refresh()
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#1C0D0D] border border-white/8 rounded-2xl overflow-hidden">

        {/* Hero section */}
        <div className="px-6 pt-8 pb-6 text-center space-y-4 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/20 flex items-center justify-center mx-auto">
            <Lock size={28} className="text-[#DC2626]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-display font-bold text-white text-xl">
              เข้าสู่ระบบก่อนติดต่อ
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
              เพื่อให้ทีมงานติดต่อกลับถึงคุณได้อย่างถูกต้อง<br />
              และรักษาความปลอดภัยของข้อมูล
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 gap-2 text-left max-w-xs mx-auto pt-1">
            {[
              { icon: <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />, text: "ทีมงานตอบกลับตรงถึงคุณโดยเฉพาะ" },
              { icon: <ShieldCheck  size={13} className="text-emerald-400 shrink-0 mt-0.5" />, text: "ข้อมูลปลอดภัย ใช้ภายในบริษัทเท่านั้น" },
              { icon: <UserPlus    size={13} className="text-emerald-400 shrink-0 mt-0.5" />, text: "ไม่ต้องกรอกข้อมูลซ้ำในครั้งถัดไป" },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-start gap-2">
                {icon}
                <span className="text-slate-400 text-xs">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-6 space-y-3">

          {/* LINE — primary CTA */}
          <a
            href={lineHref}
            className="w-full flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05a847] active:bg-[#048a3c] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            <LineIcon size={18} />
            เข้าสู่ระบบด้วย LINE
          </a>
          <p className="text-center text-slate-600 text-[11px]">
            📱 มือถือ: กด <strong className="text-slate-500">เปิดด้วย LINE</strong> → กด <strong className="text-slate-500">อนุญาต</strong>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-slate-600 text-xs">หรือ</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Email login — expandable */}
          <div>
            <button
              type="button"
              onClick={() => setShowEmail(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-white/10 hover:border-white/20 rounded-xl text-slate-400 hover:text-slate-200 transition-colors text-sm"
            >
              <span className="flex items-center gap-2">
                <Mail size={14} />
                มีบัญชีอีเมล? เข้าสู่ระบบ
              </span>
              {showEmail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showEmail && (
              <form onSubmit={handleEmailLogin} className="mt-3 space-y-3">
                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs px-3 py-2.5 rounded-xl">
                    {loginError}
                  </div>
                )}
                <input
                  type="email" value={email} autoFocus required
                  onChange={e => { setEmail(e.target.value); setLoginError(null) }}
                  placeholder="example@gmail.com"
                  className={inputCls()}
                />
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} value={password} required
                    onChange={e => { setPassword(e.target.value); setLoginError(null) }}
                    placeholder="รหัสผ่าน"
                    className={cn(inputCls(), "pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  {loading
                    ? <><Loader2 size={13} className="animate-spin" /> กำลังเข้าสู่ระบบ...</>
                    : "เข้าสู่ระบบ"
                  }
                </button>
                <p className="text-center">
                  <a href="/member/forgot-password" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                    ลืมรหัสผ่าน?
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Register footer */}
        <div className="px-6 pb-6 text-center">
          <div className="border-t border-white/5 pt-5 space-y-2">
            <p className="text-slate-500 text-sm">ยังไม่มีบัญชี?</p>
            <a
              href="/register"
              className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-white/25 hover:bg-white/[0.03] text-slate-300 hover:text-white font-medium py-3 rounded-xl transition-colors text-sm"
            >
              <UserPlus size={15} />
              สมัครสมาชิกฟรี — ใช้เวลา 1 นาที
            </a>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
        <ShieldCheck size={12} />
        ข้อมูลของคุณถูกเข้ารหัสและปลอดภัย — ไม่มีการแชร์กับบุคคลภายนอก
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContactForm({
  userRole,
  sellerHasSubmitted,
  affiliateHasSubmitted,
  lineSession,
  isMember,
  lineOaHref,
}: Props) {
  // Not logged-in → show auth gate, block access to forms entirely
  if (!isMember) {
    return (
      <div className="space-y-6">
        <AuthGate />
        <ContactInfo lineHref={lineOaHref} />
      </div>
    )
  }

  // Logged-in → derive form type from role
  const formType =
    userRole === "affiliate" ? "affiliate" : "seller"

  return (
    <div className="space-y-5">

      {/* Role indicator */}
      <div className={cn(
        "flex items-center gap-2.5 px-4 py-3 rounded-2xl border",
        formType === "seller"
          ? "bg-emerald-500/8 border-emerald-500/20"
          : "bg-[#F59E0B]/8 border-[#F59E0B]/20"
      )}>
        {formType === "seller"
          ? <Store size={14} className="text-emerald-400 shrink-0" />
          : <TrendingUp size={14} className="text-[#F59E0B] shrink-0" />
        }
        <p className={cn(
          "text-sm font-medium",
          formType === "seller" ? "text-emerald-300" : "text-[#F59E0B]"
        )}>
          ส่งข้อมูลในฐานะ <strong>{formType === "seller" ? "Seller" : "Affiliate"}</strong>
          <span className="ml-1.5 font-normal opacity-60 text-xs">· ตรวจสอบจากบัญชีของคุณอัตโนมัติ</span>
        </p>
      </div>

      {/* Context subtitle */}
      <div className="text-center space-y-0.5 pb-1">
        {formType === "seller" ? (
          <>
            <p className="text-white font-semibold text-sm">ปรึกษา ยิงแอด GMV Max และวางกลยุทธ์ TikTok Shop</p>
            <p className="text-slate-500 text-xs">ปรึกษาฟรี ไม่มีข้อผูกมัด — เราวิเคราะห์ให้ก่อน ไม่ต้องตัดสินใจตอนนี้</p>
          </>
        ) : (
          <>
            <p className="text-white font-semibold text-sm">คอร์สเรียน TikTok Affiliate และบริการวางแผนกลยุทธ์</p>
            <p className="text-slate-500 text-xs">สำหรับ Creator ที่ต้องการเพิ่มรายได้จาก TikTok Shop</p>
          </>
        )}
      </div>

      {/* Form */}
      {formType === "seller" ? (
        <SellerContactForm
          hasSubmitted={sellerHasSubmitted}
          lineSession={lineSession}
          isMember={true}
          lineOaHref={lineOaHref}
        />
      ) : (
        <AffiliateContactForm
          hasSubmitted={affiliateHasSubmitted}
          lineSession={lineSession}
          lineOaHref={lineOaHref}
        />
      )}

      <ContactInfo lineHref={lineOaHref} />
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inputCls() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-base",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}

function LineIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}
