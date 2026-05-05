import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { HeroMedia } from "@/types/database"
import { HeroMediaRowActions } from "./_components/HeroMediaRowActions"
import { HomepageHeader } from "../_components/HomepageHeader"
import { cn } from "@/lib/utils"

export default async function HeroMediaPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("hero_media")
    .select("*")
    .order("display_order", { ascending: true })

  const items = (data as HeroMedia[]) ?? []
  const imageCount = items.filter((i) => i.type === "image").length
  const imageLimitReached = imageCount >= 5

  const addButton = (
    <Link
      href="/admin/homepage/media/new"
      className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
    >
      <Plus size={16} />
      เพิ่มสื่อ
    </Link>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <HomepageHeader action={addButton} />
      <p className="text-slate-500 text-sm -mt-2">
        รูปภาพและวิดีโอที่แสดงในส่วน Hero · รูปภาพ {imageCount}/5
      </p>

      {imageLimitReached && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm px-4 py-3 rounded-xl">
          รูปภาพถึงขีดจำกัดแล้ว (5/5) — ยังเพิ่มวิดีโอได้ หากต้องการเพิ่มรูปใหม่ให้ลบรูปเก่าก่อน
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-16 text-center">
          <p className="text-slate-500 text-sm">ยังไม่มีสื่อ Hero</p>
          <Link
            href="/admin/homepage/media/new"
            className="mt-4 inline-flex items-center gap-1.5 text-[#DC2626] hover:text-[#FCA5A5] text-sm transition-colors"
          >
            <Plus size={14} /> เพิ่มสื่อแรก
          </Link>
        </div>
      ) : (
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["ตัวอย่าง", "ประเภท", "Caption / ข้อความ", "ลำดับ", "สถานะ", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-slate-500 font-medium text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Thumbnail */}
                    <td className="px-5 py-3">
                      <div className="w-10 h-[72px] rounded-lg overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                        {item.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.media_url}
                            alt={item.caption ?? ""}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <video
                            src={item.media_url}
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        item.type === "image"
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      )}>
                        {item.type === "image" ? "รูป" : "วิดีโอ"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs max-w-[200px] truncate">
                      {item.caption ?? <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{item.display_order}</td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        item.is_active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-white/5 text-slate-500"
                      )}>
                        {item.is_active ? "แสดงอยู่" : "ซ่อนอยู่"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <HeroMediaRowActions
                        id={item.id}
                        caption={item.caption}
                        isActive={item.is_active}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

