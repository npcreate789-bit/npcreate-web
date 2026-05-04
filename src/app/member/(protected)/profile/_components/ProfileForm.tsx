"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, User, Phone, Hash, Save } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { updateProfile } from "../actions"
import type { Profile } from "@/types/database"

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile.full_name)
  const [phone, setPhone]       = useState(profile.phone)
  const [lineId, setLineId]     = useState(profile.line_id)
  const [pending, start]        = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { toast.error("กรุณากรอกชื่อ-สกุล"); return }
    start(async () => {
      try {
        await updateProfile({ full_name: fullName, phone, line_id: lineId })
        toast.success("บันทึกสำเร็จ")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-2 pb-1">
        <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
          <User size={13} className="text-slate-400" />
        </div>
        <h2 className="text-white font-semibold text-sm">ข้อมูลส่วนตัว</h2>
      </div>

      <div className="space-y-4">
        <Field label="ชื่อ-สกุล *" icon={<User size={13} className="text-slate-500" />}>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="ชื่อ นามสกุล"
            required
            className={inputClass()}
          />
        </Field>
        <Field label="เบอร์โทรศัพท์" icon={<Phone size={13} className="text-slate-500" />}>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="08x-xxx-xxxx"
            type="tel"
            className={inputClass()}
          />
        </Field>
        <Field label="LINE ID" icon={<Hash size={13} className="text-slate-500" />}>
          <input
            value={lineId}
            onChange={e => setLineId(e.target.value)}
            placeholder="@yourlineid"
            className={inputClass()}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {pending ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <Link
          href="/member"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          กลับ Dashboard
        </Link>
      </div>
    </form>
  )
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <label className="text-slate-300 text-xs font-medium">{label}</label>
      </div>
      {children}
    </div>
  )
}

function inputClass() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-base",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}
