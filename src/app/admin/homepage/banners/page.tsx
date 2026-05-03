import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { PromoBanner } from "@/types/database"
import { PromoBannerRowActions } from "./_components/PromoBannerRowActions"
import { cn } from "@/lib/utils"

export default async function PromoBannersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("promo_banners")
    .select("*")
    .order("display_order", { ascending: true })

  const banners = (data as PromoBanner[]) ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">แบนเนอร์โปรโมชัน</h1>
          <p className="text-slate-400 text-sm mt-0.5">แบนเนอร์ที่แสดงใต้สถิติในหน้าแรก</p>
        </div>
        <Link
          href="/admin/homepage/banners/new"
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          เพิ่มแบนเนอร์
        </Link>
      </div>

      {banners.length === 0 ? (
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-16 text-center">
          <p className="text-slate-500 text-sm">ยังไม่มีแบนเนอร์</p>
          <Link
            href="/admin/homepage/banners/new"
            className="mt-4 inline-flex items-center gap-1.5 text-[#DC2626] hover:text-[#FCA5A5] text-sm transition-colors"
          >
            <Plus size={14} /> สร้างแบนเนอร์แรก
          </Link>
        </div>
      ) : (
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["หัวข้อ", "ราคา", "ลำดับ", "สถานะ", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-slate-500 font-medium text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {banner.banner_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={banner.banner_url}
                            alt=""
                            className="w-16 h-9 object-cover rounded-lg shrink-0 bg-white/5"
                          />
                        )}
                        <span className="text-white font-medium text-sm truncate max-w-[200px]">
                          {banner.heading || <span className="text-slate-600 italic">ไม่มีหัวข้อ</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#F59E0B] text-xs font-medium">
                      {banner.price_text || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{banner.display_order}</td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        banner.is_active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-white/5 text-slate-500"
                      )}>
                        {banner.is_active ? "แสดงอยู่" : "ซ่อนอยู่"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <PromoBannerRowActions
                        id={banner.id}
                        heading={banner.heading}
                        isActive={banner.is_active}
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
