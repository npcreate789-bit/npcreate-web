import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, ChevronRight, Megaphone } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getMyStore } from "../actions"
import { getStoreCampaigns } from "./actions"
import { CampaignRowActions } from "./_components/CampaignRowActions"
import { cn } from "@/lib/utils"

function getCampaignStatus(starts_at: string, ends_at: string, is_active: boolean) {
  if (!is_active) return { label: "ปิด", color: "bg-white/5 text-slate-500" }
  const now = new Date()
  if (now < new Date(starts_at)) return { label: "รอเริ่ม", color: "bg-blue-500/10 text-blue-400" }
  if (now > new Date(ends_at)) return { label: "สิ้นสุด", color: "bg-white/5 text-slate-500" }
  return { label: "กำลังดำเนิน", color: "bg-emerald-500/10 text-emerald-400" }
}

export default async function StoreCampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const store = await getMyStore()
  if (!store) redirect("/member/store")

  const campaigns = await getStoreCampaigns()

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">

        <div className="flex items-center gap-3">
          <Link href="/member/store" className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0">
            <ChevronRight size={16} className="text-slate-400 group-hover:text-white rotate-180 transition-colors" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-white text-xl">แคมเปญทั้งหมด</h1>
            <p className="text-slate-500 text-xs mt-0.5">{campaigns.length} แคมเปญ</p>
          </div>
          <Link href="/member/store/campaigns/new"
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0">
            <Plus size={15} /> สร้างแคมเปญ
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-16 text-center space-y-3">
            <Megaphone size={32} className="text-slate-600 mx-auto" />
            <p className="text-slate-500 text-sm">ยังไม่มีแคมเปญ</p>
            <Link href="/member/store/campaigns/new"
              className="inline-flex items-center gap-1.5 text-[#DC2626] hover:text-[#FCA5A5] text-sm transition-colors">
              <Plus size={14} /> สร้างแคมเปญแรก
            </Link>
          </div>
        ) : (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["แคมเปญ","คอมฯพิเศษ","ช่วงเวลา","สินค้า","สถานะ",""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-slate-500 font-medium text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.map(c => {
                    const status = getCampaignStatus(c.starts_at, c.ends_at, c.is_active)
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium text-sm truncate max-w-[160px]">{c.title}</p>
                          {c.description && <p className="text-slate-600 text-xs truncate max-w-[160px]">{c.description}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {c.special_commission_rate ? (
                            <span className="text-[#F59E0B] font-bold text-sm">{c.special_commission_rate}%</span>
                          ) : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                          <p>{new Date(c.starts_at).toLocaleDateString("th-TH", { day:"numeric", month:"short" })}</p>
                          <p className="text-slate-600">→ {new Date(c.ends_at).toLocaleDateString("th-TH", { day:"numeric", month:"short" })}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{c.product_ids.length} รายการ</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", status.color)}>{status.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <CampaignRowActions id={c.id} title={c.title} isActive={c.is_active} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
