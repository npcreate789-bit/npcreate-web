import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { ArrowLeft, Store, GraduationCap } from "lucide-react"
import type { Lead, LeadStatus, LeadType } from "@/types/database"
import { cn } from "@/lib/utils"
import { LinePushButton } from "./_components/LinePushButton"

const statusTabs: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all",       label: "ทั้งหมด" },
  { value: "new",       label: "ใหม่" },
  { value: "contacted", label: "ติดต่อแล้ว" },
  { value: "closed",    label: "ปิดแล้ว" },
]

const typeTabs: { value: LeadType | "all"; label: string }[] = [
  { value: "all",       label: "ทุกประเภท" },
  { value: "seller",    label: "Seller" },
  { value: "affiliate", label: "Affiliate / คอร์ส" },
]

const statusStyles: Record<LeadStatus, string> = {
  new:       "bg-[#F59E0B]/10 text-[#F59E0B]",
  contacted: "bg-[#DC2626]/10 text-[#FCA5A5]",
  closed:    "bg-white/5 text-slate-500",
}
const statusLabels: Record<LeadStatus, string> = {
  new:       "ใหม่",
  contacted: "ติดต่อแล้ว",
  closed:    "ปิดแล้ว",
}

const leadTypeStyles: Record<LeadType, string> = {
  seller:    "bg-[#DC2626]/10 text-[#FCA5A5]",
  affiliate: "bg-[#F59E0B]/10 text-[#F59E0B]",
}
const leadTypeLabels: Record<LeadType, string> = {
  seller:    "Seller",
  affiliate: "Affiliate",
}

async function updateLeadStatus(id: string, status: LeadStatus) {
  "use server"
  const supabase = createAdminClient()
  await supabase.from("leads").update({ status }).eq("id", id)
  revalidatePath("/admin/leads")
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const { status: statusParam, type: typeParam } = await searchParams

  const validStatuses = ["all", "new", "contacted", "closed"] as const
  const activeStatus  = validStatuses.includes(statusParam as typeof validStatuses[number])
    ? (statusParam as LeadStatus | "all")
    : "all"

  const validTypes = ["all", "seller", "affiliate"] as const
  const activeType = validTypes.includes(typeParam as typeof validTypes[number])
    ? (typeParam as LeadType | "all")
    : "all"

  const supabase = await createClient()

  const query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (activeStatus !== "all") query.eq("status", activeStatus)
  if (activeType   !== "all") query.eq("lead_type", activeType)

  const { data: leads } = await query

  // URL builder that preserves existing params
  function buildUrl(params: { status?: string; type?: string }) {
    const p = new URLSearchParams()
    const s = params.status ?? (activeStatus !== "all" ? activeStatus : undefined)
    const t = params.type   ?? (activeType   !== "all" ? activeType   : undefined)
    if (s && s !== "all") p.set("status", s)
    if (t && t !== "all") p.set("type", t)
    const qs = p.toString()
    return `/admin/leads${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Leads</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            ผู้ที่ติดต่อผ่านหน้า Contact
            {leads && <span className="text-slate-600 ml-2">({leads.length} รายการ)</span>}
          </p>
        </div>
      </div>

      {/* Status filter */}
      <div className="space-y-2">
        <p className="text-slate-600 text-xs font-medium uppercase tracking-wider">สถานะ</p>
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value })}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeStatus === tab.value
                  ? "bg-[#DC2626] text-white"
                  : "bg-[#1C0D0D] text-slate-400 hover:text-white"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Type filter */}
      <div className="space-y-2">
        <p className="text-slate-600 text-xs font-medium uppercase tracking-wider">ประเภท</p>
        <div className="flex gap-2 flex-wrap">
          {typeTabs.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ type: tab.value })}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                activeType === tab.value
                  ? tab.value === "affiliate"
                    ? "bg-[#F59E0B] text-black"
                    : "bg-[#DC2626] text-white"
                  : "bg-[#1C0D0D] text-slate-400 hover:text-white"
              )}
            >
              {tab.value === "seller"    && <Store size={12} />}
              {tab.value === "affiliate" && <GraduationCap size={12} />}
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
        {!leads || leads.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">ไม่มี leads ในหมวดหมู่นี้</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["ชื่อ / LINE", "ประเภท / บริการ", "ข้อมูลเพิ่มเติม", "สถานะ", "วันที่", ""].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-slate-500 font-medium text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(leads as Lead[]).map((lead) => {
                  const lType = (lead.lead_type ?? "seller") as LeadType
                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">

                      {/* Name + contact */}
                      <td className="px-5 py-4 min-w-[160px]">
                        <p className="text-white font-medium">{lead.name}</p>
                        {lead.display_name && (
                          <p className="text-[#06C755] text-xs mt-0.5">💚 {lead.display_name}</p>
                        )}
                        <p className="text-slate-500 text-xs">{lead.phone}</p>
                      </td>

                      {/* Type + service */}
                      <td className="px-5 py-4 min-w-[180px]">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", leadTypeStyles[lType])}>
                            {lType === "seller" ? <Store size={9} /> : <GraduationCap size={9} />}
                            {leadTypeLabels[lType]}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs">{lead.service}</p>
                      </td>

                      {/* Additional info */}
                      <td className="px-5 py-4 min-w-[160px] max-w-[200px]">
                        {lType === "seller" ? (
                          <>
                            {lead.brand && <p className="text-slate-300 text-xs font-medium truncate">{lead.brand}</p>}
                            {lead.monthly_gmv && <p className="text-slate-500 text-xs">GMV: {lead.monthly_gmv}</p>}
                          </>
                        ) : (
                          <>
                            {lead.tiktok_url ? (
                              <a
                                href={lead.tiktok_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#F59E0B] text-xs hover:underline truncate block max-w-[180px]"
                              >
                                🎵 TikTok
                              </a>
                            ) : (
                              <p className="text-slate-600 text-xs">ไม่มีช่อง TikTok</p>
                            )}
                          </>
                        )}
                        {lead.message && (
                          <p className="text-slate-600 text-[10px] mt-1 line-clamp-2 italic">&ldquo;{lead.message}&rdquo;</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusStyles[lead.status as LeadStatus])}>
                          {statusLabels[lead.status as LeadStatus]}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("th-TH", {
                          day: "numeric", month: "short", year: "2-digit",
                        })}
                        <br />
                        <span className="text-slate-700">
                          {new Date(lead.created_at).toLocaleTimeString("th-TH", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2 items-start">
                          {lead.line_user_id && (
                            <LinePushButton lineUserId={lead.line_user_id} leadName={lead.name} />
                          )}
                          <StatusActions lead={lead} updateFn={updateLeadStatus} />
                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusActions({
  lead,
  updateFn,
}: {
  lead: Lead
  updateFn: (id: string, status: LeadStatus) => Promise<void>
}) {
  const next: Record<LeadStatus, { status: LeadStatus; label: string } | null> = {
    new:       { status: "contacted", label: "ติดต่อแล้ว ✓" },
    contacted: { status: "closed",    label: "ปิดแล้ว ✓" },
    closed:    null,
  }
  const action = next[lead.status as LeadStatus]
  if (!action) return null

  return (
    <form action={updateFn.bind(null, lead.id, action.status)}>
      <button
        type="submit"
        className="text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      >
        {action.label}
      </button>
    </form>
  )
}
