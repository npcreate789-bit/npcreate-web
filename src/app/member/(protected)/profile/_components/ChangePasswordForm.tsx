"use client"

import { useState, useTransition } from "react"
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { changePassword } from "../actions"

export function ChangePasswordForm() {
  const [newPass, setNewPass]       = useState("")
  const [confirm, setConfirm]       = useState("")
  const [showNew, setShowNew]       = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [status, setStatus]         = useState<"idle" | "ok" | "error">("idle")
  const [errorMsg, setErrorMsg]     = useState("")
  const [pending, startTransition]  = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("idle")
    if (newPass.length < 8) { setErrorMsg("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); setStatus("error"); return }
    if (newPass !== confirm) { setErrorMsg("รหัสผ่านไม่ตรงกัน"); setStatus("error"); return }
    startTransition(async () => {
      try {
        await changePassword(newPass)
        setStatus("ok")
        setNewPass("")
        setConfirm("")
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
        setStatus("error")
      }
    })
  }

  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={15} className="text-[#DC2626]" />
        <h2 className="text-white font-semibold text-sm">เปลี่ยนรหัสผ่าน</h2>
      </div>

      {status === "ok" && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">
          เปลี่ยนรหัสผ่านสำเร็จ
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-slate-300 text-xs font-medium">รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</label>
          <div className="relative">
            <input type={showNew ? "text" : "password"} value={newPass}
              onChange={(e) => { setNewPass(e.target.value); setStatus("idle") }}
              placeholder="••••••••" className={cn(inputCls(), "pr-10")} />
            <button type="button" onClick={() => setShowNew(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-300 text-xs font-medium">ยืนยันรหัสผ่านใหม่</label>
          <div className="relative">
            <input type={showConf ? "text" : "password"} value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setStatus("idle") }}
              placeholder="••••••••" className={cn(inputCls(), "pr-10")} />
            <button type="button" onClick={() => setShowConf(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={pending || !newPass || !confirm}
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          {pending && <Loader2 size={14} className="animate-spin" />}
          บันทึกรหัสผ่าน
        </button>
      </form>
    </div>
  )
}

function inputCls() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-base",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}
