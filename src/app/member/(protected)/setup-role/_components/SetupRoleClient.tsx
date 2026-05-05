"use client"

import { useState, useTransition } from "react"
import { Store, TrendingUp, ChevronRight, Loader2, Video, Radio, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { saveRoleAndInfo, type RoleInfoInput } from "@/app/register/actions"

type Step        = "role" | "role_info"
type RoleChoice  = "seller" | "affiliate" | null
type ContentType = "clip" | "live" | "both"

const CONTENT_OPTIONS: { value: ContentType; icon: React.ReactNode; label: string }[] = [
  { value: "clip", icon: <Video  size={18} />, label: "คลิปปักตะกร้า" },
  { value: "live", icon: <Radio  size={18} />, label: "ไลฟ์สด"        },
  { value: "both", icon: <Layers size={18} />, label: "ทั้งสองแบบ"    },
]

export function SetupRoleClient() {
  const [step, setStep]   = useState<Step>("role")
  const [role, setRole]   = useState<RoleChoice>(null)
  const [storeName, setStoreName]               = useState("")
  const [tiktokChannelUrl, setTiktokChannelUrl] = useState("")
  const [contentType, setContentType]           = useState<ContentType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start]  = useTransition()

  function handleRoleNext() {
    if (!role) { setError("กรุณาเลือกประเภทบัญชี"); return }
    setError(null); setStep("role_info")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    setError(null)

    const input: RoleInfoInput = role === "seller"
      ? { role: "seller", store_name: storeName }
      : { role: "affiliate", tiktok_channel_url: tiktokChannelUrl, content_type: contentType ?? undefined }

    start(async () => {
      const result = await saveRoleAndInfo(input)
      if (result && "error" in result) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-[#0A0808] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-white text-2xl">ยินดีต้อนรับ! 👋</h1>
          <p className="text-slate-400 text-sm mt-2">เลือกประเภทบัญชีเพื่อเริ่มใช้งาน</p>
        </div>

        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-6">
          {step === "role" && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <RoleCard
                  active={role === "seller"}
                  onClick={() => { setRole("seller"); setError(null) }}
                  icon={<Store size={24} className={role === "seller" ? "text-emerald-400" : "text-slate-500"} />}
                  color={role === "seller" ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 hover:border-white/20"}
                  title="Seller"
                  titleColor={role === "seller" ? "text-emerald-400" : "text-white"}
                  desc="เจ้าของร้านค้า / แบรนด์ที่ต้องการหา Affiliate"
                />
                <RoleCard
                  active={role === "affiliate"}
                  onClick={() => { setRole("affiliate"); setError(null) }}
                  icon={<TrendingUp size={24} className={role === "affiliate" ? "text-[#F59E0B]" : "text-slate-500"} />}
                  color={role === "affiliate" ? "border-[#F59E0B]/40 bg-[#F59E0B]/5" : "border-white/10 hover:border-white/20"}
                  title="Affiliate"
                  titleColor={role === "affiliate" ? "text-[#F59E0B]" : "text-white"}
                  desc="Content Creator ที่โปรโมทสินค้าและรับค่าคอม"
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button onClick={handleRoleNext} disabled={!role}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                ถัดไป <ChevronRight size={15} />
              </button>
            </div>
          )}

          {step === "role_info" && role && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {role === "seller" ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Store size={15} className="text-emerald-400" />
                    <span className="text-white font-semibold text-sm">ข้อมูลร้านค้าของคุณ</span>
                  </div>
                  <Field label="ชื่อร้านค้า / แบรนด์ *">
                    <input value={storeName} onChange={e => setStoreName(e.target.value)}
                      placeholder="เช่น My Brand TH" required autoFocus className={inputCls()} />
                  </Field>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={15} className="text-[#F59E0B]" />
                    <span className="text-white font-semibold text-sm">ช่องทาง TikTok ของคุณ</span>
                  </div>
                  <Field label="ลิงก์ช่อง TikTok (แนะนำมาก)">
                    <input value={tiktokChannelUrl} onChange={e => setTiktokChannelUrl(e.target.value)}
                      placeholder="https://www.tiktok.com/@username" type="url" className={inputCls()} />
                  </Field>
                  <div className="space-y-2">
                    <label className="text-slate-300 text-xs font-medium block">
                      คุณทำ TikTok แบบไหน?
                      <span className="text-slate-600 ml-1">(ไม่บังคับ)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {CONTENT_OPTIONS.map(o => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setContentType(prev => prev === o.value ? null : o.value)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 py-3 px-1.5 rounded-xl border-2 text-center transition-all",
                            contentType === o.value
                              ? "border-[#F59E0B]/50 bg-[#F59E0B]/8"
                              : "border-white/8 hover:border-white/15"
                          )}
                        >
                          <span className={cn("transition-colors", contentType === o.value ? "text-[#F59E0B]" : "text-slate-500")}>
                            {o.icon}
                          </span>
                          <p className={cn("text-[10px] font-semibold leading-tight", contentType === o.value ? "text-[#F59E0B]" : "text-slate-300")}>
                            {o.label}
                          </p>
                        </button>
                      ))}
                    </div>
                    <p className="text-slate-600 text-xs">Seller ใช้ดูเพื่อพิจารณาส่งสินค้าตัวอย่างให้คุณ</p>
                  </div>
                </>
              )}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit"
                disabled={pending || (role === "seller" && !storeName.trim())}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                {pending
                  ? <><Loader2 size={14} className="animate-spin" /> กำลังบันทึก...</>
                  : <><span>เริ่มใช้งาน</span> <ChevronRight size={14} /></>}
              </button>
              <button type="button" onClick={() => { setStep("role"); setError(null) }}
                className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors">
                ← เปลี่ยนประเภทบัญชี
              </button>
            </form>
          )}
        </div>
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
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{icon}</div>
      <p className={cn("font-bold text-sm", titleColor)}>{title}</p>
      <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
    </button>
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

function inputCls() {
  return cn(
    "w-full bg-[#0A0808] border border-white/10 rounded-xl px-4 py-2.5 text-white text-base",
    "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20 transition-colors"
  )
}
