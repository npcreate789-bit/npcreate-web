"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/api/auth/callback?next=/member/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0A0808] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl text-white inline-block">
            NP<span className="text-[#DC2626]">Create</span>
          </Link>
          <h1 className="font-display font-bold text-white text-xl mt-4">ลืมรหัสผ่าน</h1>
          <p className="text-slate-400 text-sm mt-1">ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมล</p>
        </div>

        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-8 space-y-5">
          {sent ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <Mail size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-white font-semibold">ส่งอีเมลแล้ว</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                ส่งลิงก์รีเซ็ตรหัสผ่านไปที่<br />
                <span className="text-white font-medium">{email}</span><br />
                กรุณาตรวจสอบกล่องจดหมาย
              </p>
              <p className="text-slate-600 text-xs">ตรวจสอบโฟลเดอร์ Spam หากไม่พบอีเมล</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-medium">อีเมลที่ใช้สมัครสมาชิก</label>
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null) }}
                  placeholder="example@gmail.com"
                  required autoFocus
                  className={cn(
                    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-base",
                    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
                  )}
                />
              </div>
              <button type="submit" disabled={loading || !email}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                {loading ? <><Loader2 size={14} className="animate-spin" /> กำลังส่ง...</> : "ส่งลิงก์รีเซ็ต"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/member/login"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
            <ArrowLeft size={14} /> กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  )
}
