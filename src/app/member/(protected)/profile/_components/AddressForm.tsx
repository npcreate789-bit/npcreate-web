"use client"

import { useState, useTransition } from "react"
import { Loader2, Save, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateAddress } from "../actions"
import type { Profile } from "@/types/database"

type AddressData = Pick<Profile,
  | "address_name"
  | "address_phone"
  | "address_line1"
  | "address_subdistrict"
  | "address_district"
  | "address_province"
  | "address_postcode"
>

export function AddressForm({ profile }: { profile: AddressData }) {
  const [form, setForm] = useState({
    address_name:        profile.address_name        ?? "",
    address_phone:       profile.address_phone       ?? "",
    address_line1:       profile.address_line1       ?? "",
    address_subdistrict: profile.address_subdistrict ?? "",
    address_district:    profile.address_district    ?? "",
    address_province:    profile.address_province    ?? "",
    address_postcode:    profile.address_postcode    ?? "",
  })
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [pending, start] = useTransition()

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      setStatus("idle")
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("idle")
    start(async () => {
      try {
        await updateAddress(form)
        setStatus("ok")
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
        setStatus("error")
      }
    })
  }

  const hasAddress = !!profile.address_name || !!profile.address_line1

  return (
    <form id="address" onSubmit={handleSubmit} className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4 scroll-mt-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
            <MapPin size={13} className="text-slate-400" />
          </div>
          <h2 className="text-white font-semibold text-sm">ที่อยู่รับสินค้าตัวอย่าง</h2>
        </div>
        {hasAddress && (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
            กรอกแล้ว
          </span>
        )}
      </div>

      <p className="text-slate-500 text-xs leading-relaxed">
        ที่อยู่นี้ใช้สำหรับให้ Seller ส่งสินค้าตัวอย่างเมื่อคุณได้รับการอนุมัติ
      </p>

      {status === "ok" && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <Save size={14} /> บันทึกที่อยู่สำเร็จ
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="ชื่อผู้รับ">
            <input
              value={form.address_name}
              onChange={set("address_name")}
              placeholder="ชื่อ นามสกุล"
              className={inputClass()}
            />
          </Field>
          <Field label="เบอร์โทรผู้รับ">
            <input
              type="tel"
              value={form.address_phone}
              onChange={set("address_phone")}
              placeholder="08x-xxx-xxxx"
              className={inputClass()}
            />
          </Field>
        </div>

        <Field label="ที่อยู่ (บ้านเลขที่ ถนน ซอย)">
          <input
            value={form.address_line1}
            onChange={set("address_line1")}
            placeholder="เช่น 123 ถ.สุขุมวิท ซ.5"
            className={inputClass()}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="แขวง/ตำบล">
            <input
              value={form.address_subdistrict}
              onChange={set("address_subdistrict")}
              placeholder="เช่น คลองเตย"
              className={inputClass()}
            />
          </Field>
          <Field label="เขต/อำเภอ">
            <input
              value={form.address_district}
              onChange={set("address_district")}
              placeholder="เช่น คลองเตย"
              className={inputClass()}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="จังหวัด">
            <input
              value={form.address_province}
              onChange={set("address_province")}
              placeholder="เช่น กรุงเทพมหานคร"
              className={inputClass()}
            />
          </Field>
          <Field label="รหัสไปรษณีย์">
            <input
              value={form.address_postcode}
              onChange={set("address_postcode")}
              placeholder="เช่น 10110"
              maxLength={5}
              className={inputClass()}
            />
          </Field>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {pending ? "กำลังบันทึก..." : "บันทึกที่อยู่"}
      </button>
    </form>
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

function inputClass() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}
