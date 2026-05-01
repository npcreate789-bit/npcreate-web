import { createClient } from "@/lib/supabase/server"
import { Users, Briefcase, MessageSquare } from "lucide-react"
import Link from "next/link"
import type { Lead } from "@/types/database"

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [leadsTotal, leadsNew, portfolios, services] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("portfolios").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("is_active", true),
  ])

  return {
    leadsTotal: leadsTotal.count ?? 0,
    leadsNew: leadsNew.count ?? 0,
    portfolios: portfolios.count ?? 0,
    services: services.count ?? 0,
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const stats = await getStats(supabase)

  const { data: recentLeads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const statCards = [
    { label: "Leads ทั้งหมด", value: stats.leadsTotal, icon: Users, color: "text-[#DC2626]", bg: "bg-[#DC2626]/10", href: "/admin/leads" },
    { label: "Leads ใหม่", value: stats.leadsNew, icon: Users, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", href: "/admin/leads?status=new" },
    { label: "Portfolio (เผยแพร่)", value: stats.portfolios, icon: Briefcase, color: "text-[#DC2626]", bg: "bg-[#DC2626]/10", href: "/admin/portfolios" },
    { label: "บริการ (เปิดใช้)", value: stats.services, icon: MessageSquare, color: "text-[#FCA5A5]", bg: "bg-[#FCA5A5]/10", href: "/admin/services" },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">แดชบอร์ด</h1>
        <p className="text-slate-400 text-sm mt-1">ภาพรวม NP Create Admin</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
            >
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={18} className={card.color} />
              </div>
              <div className={`font-display font-bold text-2xl ${card.color}`}>{card.value}</div>
              <div className="text-slate-400 text-xs mt-1">{card.label}</div>
            </Link>
          )
        })}
      </div>

      {/* Recent leads */}
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white text-sm">Leads ล่าสุด</h2>
          <Link href="/admin/leads" className="text-[#DC2626] text-xs hover:text-[#FCA5A5] transition-colors">
            ดูทั้งหมด →
          </Link>
        </div>

        {!recentLeads || recentLeads.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-500 text-sm">ยังไม่มี leads</div>
        ) : (
          <div className="divide-y divide-white/5">
            {(recentLeads as Lead[]).map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 rounded-full bg-[#DC2626]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#DC2626] text-xs font-bold">{lead.display_name?.[0]?.toUpperCase() ?? "?"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{lead.name}</p>
                  <p className="text-slate-500 text-xs truncate">{lead.brand} · {lead.service}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-[#F59E0B]/10 text-[#F59E0B]",
    contacted: "bg-[#DC2626]/10 text-[#FCA5A5]",
    closed: "bg-[#DC2626]/10 text-[#DC2626]",
  }
  const labels: Record<string, string> = {
    new: "ใหม่",
    contacted: "ติดต่อแล้ว",
    closed: "ปิดแล้ว",
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${styles[status] ?? styles.new}`}>
      {labels[status] ?? status}
    </span>
  )
}
