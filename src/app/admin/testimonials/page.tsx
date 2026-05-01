import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, Star } from "lucide-react"
import type { Testimonial } from "@/types/database"
import { TestimonialRowActions } from "./_components/TestimonialRowActions"

export default async function TestimonialsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  const items = (data as Testimonial[]) ?? []

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">รีวิว</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            จัดการรีวิวจากลูกค้าที่แสดงบนหน้าเว็บไซต์
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          เพิ่มรีวิว
        </Link>
      </div>

      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-sm">ยังไม่มีรีวิว</p>
            <Link
              href="/admin/testimonials/new"
              className="mt-4 inline-flex items-center gap-1.5 text-[#DC2626] hover:text-[#FCA5A5] text-sm transition-colors"
            >
              <Plus size={14} /> เพิ่มรีวิวแรก
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["ลูกค้า", "Quote", "คะแนน", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-slate-500 font-medium text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white font-medium">{t.client_name}</p>
                      {(t.client_role || t.client_company) && (
                        <p className="text-slate-500 text-xs mt-0.5">
                          {[t.client_role, t.client_company].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs max-w-xs">
                      <p className="line-clamp-2">{t.short_quote || t.content}</p>
                    </td>
                    <td className="px-5 py-4">
                      {t.rating ? (
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((n) => (
                            <Star key={n} size={12} className={t.rating! >= n ? "text-[#F59E0B] fill-[#F59E0B]" : "text-slate-700"} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <TestimonialRowActions
                        id={t.id}
                        clientName={t.client_name}
                        isPublished={t.is_published}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
