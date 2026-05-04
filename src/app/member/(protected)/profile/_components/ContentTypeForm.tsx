"use client"

import { useState, useTransition } from "react"
import { Video, Radio, Layers, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { updateContentType } from "../actions"

type ContentType = "clip" | "live" | "both"

const OPTIONS: { value: ContentType; icon: React.ReactNode; label: string; desc: string }[] = [
  {
    value: "clip",
    icon:  <Video size={22} />,
    label: "คลิปปักตะกร้า",
    desc:  "วิดีโอรีวิวสินค้าลง FYP",
  },
  {
    value: "live",
    icon:  <Radio size={22} />,
    label: "ไลฟ์สด",
    desc:  "ขายของผ่าน TikTok LIVE",
  },
  {
    value: "both",
    icon:  <Layers size={22} />,
    label: "ทั้งสองแบบ",
    desc:  "ทำได้ทั้งคลิปและไลฟ์",
  },
]

interface Props {
  current: ContentType | null
}

export function ContentTypeForm({ current }: Props) {
  const [selected, setSelected] = useState<ContentType | null>(current)
  const [saved,    setSaved]    = useState<ContentType | null>(current)
  const [pending,  start]       = useTransition()

  const isDirty = selected !== saved

  function handleSave() {
    if (!selected) return
    start(async () => {
      try {
        await updateContentType(selected)
        setSaved(selected)
        toast.success("บันทึกรูปแบบคอนเทนต์แล้ว")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <div id="content-type" className="scroll-mt-4 bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-white font-semibold text-sm">รูปแบบการทำคอนเทนต์</h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Seller ใช้ข้อมูลนี้พิจารณาส่งสินค้าตัวอย่าง — เลือกได้เพียงรูปแบบเดียว
        </p>
      </div>

      {/* Option cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {OPTIONS.map(o => {
          const isSelected = selected === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setSelected(o.value)}
              className={cn(
                "relative flex flex-col items-center gap-2.5 px-2 py-4 rounded-xl border-2 text-center transition-all",
                isSelected
                  ? "border-[#F59E0B]/50 bg-[#F59E0B]/8"
                  : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              )}
            >
              {isSelected && (
                <CheckCircle2 size={12} className="absolute top-2 right-2 text-[#F59E0B]" />
              )}
              <span className={cn("transition-colors", isSelected ? "text-[#F59E0B]" : "text-slate-500")}>
                {o.icon}
              </span>
              <div className="space-y-0.5">
                <p className={cn("text-xs font-semibold leading-tight", isSelected ? "text-[#F59E0B]" : "text-white")}>
                  {o.label}
                </p>
                <p className="text-slate-600 text-[10px] leading-tight hidden sm:block">{o.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Save button — only when changed */}
      {isDirty && selected && (
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-black font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          {pending
            ? <><Loader2 size={14} className="animate-spin" /> กำลังบันทึก...</>
            : "บันทึกรูปแบบ"
          }
        </button>
      )}

      {/* Saved state */}
      {!isDirty && saved && (
        <p className="text-center text-emerald-400/60 text-xs flex items-center justify-center gap-1.5">
          <CheckCircle2 size={11} /> บันทึกแล้ว
        </p>
      )}

      {/* Empty state hint */}
      {!saved && !isDirty && (
        <p className="text-center text-slate-600 text-xs">ยังไม่ได้เลือก — กรุณาเลือกรูปแบบแล้วกดบันทึก</p>
      )}
    </div>
  )
}
