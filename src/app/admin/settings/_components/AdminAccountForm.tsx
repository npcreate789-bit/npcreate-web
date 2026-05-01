"use client"

import { useState, useTransition } from "react"
import { Loader2, Eye, EyeOff, Mail, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { changePassword } from "../actions"

export function AdminAccountForm({ email }: { email: string }) {
  const [currentPass, setCurrentPass] = useState("")
  const [newPass, setNewPass]         = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus]           = useState<"idle" | "ok" | "error">("idle")
  const [errorMsg, setErrorMsg]       = useState("")
  const [pending, startTransition]    = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("idle")
    if (!currentPass) {
      setErrorMsg("กรุณากรอกรหัสผ่านปัจจุบัน")
      setStatus("error")
      return
    }
    if (newPass.length < 8) {
      setErrorMsg("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      setStatus("error")
      return
    }
    if (newPass !== confirmPass) {
      setErrorMsg("รหัสผ่านไม่ตรงกัน")
      setStatus("error")
      return
    }
    startTransition(async () => {
      try {
        await changePassword(currentPass, newPass)
        setStatus("ok")
        setCurrentPass("")
        setNewPass("")
        setConfirmPass("")
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
        setStatus("error")
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Current account info */}
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-sm">ข้อมูลบัญชี</h2>
        <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
          <div className="w-9 h-9 bg-[#DC2626]/10 rounded-full flex items-center justify-center shrink-0">
            <Mail size={15} className="text-[#DC2626]" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">อีเมลผู้ดูแล</p>
            <p className="text-white text-sm font-medium mt-0.5">{email}</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={11} /> Admin
            </span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-sm">เปลี่ยนรหัสผ่าน</h2>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-medium">รหัสผ่านปัจจุบัน</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPass}
                onChange={(e) => { setCurrentPass(e.target.value); setStatus("idle") }}
                placeholder="รหัสผ่านที่ใช้อยู่"
                className={inputClass()}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-medium">รหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={(e) => { setNewPass(e.target.value); setStatus("idle") }}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                className={inputClass()}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-medium">ยืนยันรหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPass}
                onChange={(e) => { setConfirmPass(e.target.value); setStatus("idle") }}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                className={inputClass()}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending || !currentPass || !newPass || !confirmPass}
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            เปลี่ยนรหัสผ่าน
          </button>
        </form>
      </div>
    </div>
  )
}

function inputClass() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-3 py-2 pr-10 text-white text-sm",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50",
    "focus:ring-[#DC2626]/20 transition-colors",
  )
}
