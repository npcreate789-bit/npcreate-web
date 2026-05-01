import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Lead, LeadStatus } from "@/types/database"
import { cn } from "@/lib/utils"

const statusTabs: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "new", label: "ใหม่" },
  { value: "contacted", label: "ติดต่อแล้ว" },
  { value: "closed", label: "ปิดแล้ว" },
]

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-[#F59E0B]/10 text-[#F59E0B]",
  contacted: "bg-[#DC2626]/10 text-[#FCA5A5]",
  closed: "bg-[#DC2626]/10 text-[#DC2626]",
}

const statusLabels: Record<LeadStatus, string> = {
  new: "ใหม่",
  contacted: "ติดต่อแล้ว",
  closed: "ปิดแล้ว",
}

async function updateLeadStatus(id: string, status: LeadStatus) {
  "use server"
  const supabase = await createClient()
  await supabase.from("leads").update({ status }).eq("id", id)
  revalidatePath("/admin/leads")
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const validStatuses = ["all", "new", "contacted", "closed"] as const
  const activeStatus = validStatuses.includes(statusParam as typeof validStatuses[number])
    ? (statusParam as LeadStatus | "all")
    : "all"

  const supabase = await createClient()

  const query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (activeStatus !== "all") {
    query.eq("status", activeStatus)
  }

  const { data: leads } = await query

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Leads</h1>
          <p className="text-slate-400 text-sm mt-0.5">ผู้ที่ติดต่อผ่านหน้า Contact</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/leads" : `/admin/leads?status=${tab.value}`}
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

      {/* Table */}
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
        {!leads || leads.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">ไม่มี leads ในหมวดหมู่นี้</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["ชื่อ / Line", "แบรนด์", "GMV", "บริการ", "สถานะ", "วันที่", ""].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-slate-500 font-medium text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(leads as Lead[]).map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white font-medium">{lead.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{lead.display_name}</p>
                      <p className="text-slate-500 text-xs">{lead.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">{lead.brand}</td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">{lead.monthly_gmv}</td>
                    <td className="px-5 py-4 text-slate-300 max-w-32 truncate">{lead.service}</td>
                    <td className="px-5 py-4">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusStyles[lead.status as LeadStatus])}>
                        {statusLabels[lead.status as LeadStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <StatusActions lead={lead} updateFn={updateLeadStatus} />
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

function StatusActions({
  lead,
  updateFn,
}: {
  lead: Lead
  updateFn: (id: string, status: LeadStatus) => Promise<void>
}) {
  const next: Record<LeadStatus, { status: LeadStatus; label: string } | null> = {
    new: { status: "contacted", label: "ติดต่อแล้ว ✓" },
    contacted: { status: "closed", label: "ปิดแล้ว ✓" },
    closed: null,
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
