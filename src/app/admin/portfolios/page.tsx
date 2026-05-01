import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { Portfolio } from "@/types/database"
import { PortfolioRowActions } from "./_components/PortfolioRowActions"

export default async function PortfoliosPage() {
  const supabase = await createClient()
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("*")
    .order("display_order", { ascending: true })

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Portfolio</h1>
          <p className="text-slate-400 text-sm mt-0.5">จัดการผลงานที่แสดงบนเว็บไซต์</p>
        </div>
        <Link
          href="/admin/portfolios/new"
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          เพิ่มผลงาน
        </Link>
      </div>

      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
        {!portfolios || portfolios.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-sm">ยังไม่มีผลงาน</p>
            <Link
              href="/admin/portfolios/new"
              className="mt-4 inline-flex items-center gap-1.5 text-[#DC2626] hover:text-[#FCA5A5] text-sm transition-colors"
            >
              <Plus size={14} /> เพิ่มผลงานแรก
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["ชื่อผลงาน", "แบรนด์", "GMV หลัง", "ROI", ""].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-slate-500 font-medium text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(portfolios as Portfolio[]).map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white font-medium">{p.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{p.industry ?? "—"}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">
                      {p.client_name ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">
                      {p.gmv_after ? `฿${p.gmv_after.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">
                      {p.roas ? `${p.roas}x` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <PortfolioRowActions
                        id={p.id}
                        title={p.title}
                        isPublished={p.is_published}
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
