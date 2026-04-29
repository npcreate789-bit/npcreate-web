"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1E293B] border border-white/5 rounded-2xl p-8 space-y-5"
    >
      <h1 className="font-display font-bold text-white text-xl">เข้าสู่ระบบ</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-slate-300 text-sm font-medium">อีเมล</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@npcreate.co.th"
          required
          className={cn(
            "w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2.5",
            "text-white text-sm placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20 transition-colors"
          )}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-slate-300 text-sm font-medium">รหัสผ่าน</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={cn(
              "w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2.5 pr-10",
              "text-white text-sm placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20 transition-colors"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> กำลังเข้าสู่ระบบ...</>
        ) : (
          "เข้าสู่ระบบ"
        )}
      </button>
    </form>
  )
}
