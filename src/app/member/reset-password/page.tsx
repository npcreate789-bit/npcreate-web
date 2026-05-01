"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

type State = "loading" | "ready" | "success" | "expired"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [state, setState]       = useState<State>("loading")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm]   = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    // Check if there's already a recovery session (set by /api/auth/callback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setState("ready"); return }
      setState("expired")
    })
    // Also listen for PASSWORD_RECOVERY event (hash-based flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setState("ready")
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return }
    if (password !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return }
    setError(null); setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setState("success")
      setTimeout(() => router.push("/member"), 2500)
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : ""))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0A0808] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl text-white inline-block">
            NP<span className="text-[#DC2626]">Create</span>
          </Link>
          <h1 className="font-display font-bold text-white text-xl mt-4">ตั้งรหัสผ่านใหม่</h1>
        </div>

        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8">
          {state === "loading" && (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-sm">
              <Loader2 size={18} className="animate-spin" /> กำลังตรวจสอบ...
            </div>
          )}

          {state === "expired" && (
            <div className="text-center space-y-4 py-2">
              <p className="text-red-400 text-sm">ลิงก์หมดอายุหรือไม่ถูกต้อง</p>
              <Link href="/member/forgot-password"
                className="inline-block text-[#DC2626] hover:text-[#FCA5A5] text-sm transition-colors">
                ขอลิงก์ใหม่
              </Link>
            </div>
          )}

          {state === "success" && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-white font-semibold">เปลี่ยนรหัสผ่านสำเร็จ</h2>
              <p className="text-slate-400 text-sm">กำลังพาคุณไปยังหน้าพอร์ทัลสมาชิก...</p>
            </div>
          )}

          {state === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={15} className="text-[#DC2626]" />
                <span className="text-white font-semibold text-sm">ตั้งรหัสผ่านใหม่</span>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-medium">รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null) }}
                    placeholder="••••••••" required autoFocus className={cn(inputCls(), "pr-10")} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-medium">ยืนยันรหัสผ่านใหม่</label>
                <div className="relative">
                  <input type={showConf ? "text" : "password"} value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(null) }}
                    placeholder="••••••••" required className={cn(inputCls(), "pr-10")} />
                  <button type="button" onClick={() => setShowConf(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading || !password || !confirm}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังบันทึก...</> : "บันทึกรหัสผ่านใหม่"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.includes("New password should be different")) return "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม"
  if (msg.includes("Password should be at least")) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
  if (msg.includes("Auth session missing")) return "ลิงก์หมดอายุ กรุณาขอลิงก์ใหม่"
  return msg || "เกิดข้อผิดพลาด กรุณาลองใหม่"
}

function inputCls() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}
