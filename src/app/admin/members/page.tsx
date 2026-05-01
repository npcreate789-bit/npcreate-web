import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types/database"
import { MemberRowActions } from "./_components/MemberRowActions"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

const roleLabel: Record<string, string> = { admin: "Admin", affiliate: "Affiliate", seller: "Seller" }
const roleBg: Record<string, string> = {
  admin:     "bg-[#DC2626]/10 text-[#FCA5A5]",
  affiliate: "bg-[#F59E0B]/10 text-[#F59E0B]",
  seller:    "bg-emerald-500/10 text-emerald-400",
}

export default async function AdminMembersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  const members = (data as Profile[]) ?? []
  const counts = {
    total:     members.length,
    admin:     members.filter((m) => m.role === "admin").length,
    affiliate: members.filter((m) => m.role === "affiliate").length,
    seller:    members.filter((m) => m.role === "seller").length,
    inactive:  members.filter((m) => !m.is_active).length,
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">สมาชิก</h1>
        <p className="text-slate-400 text-sm mt-0.5">จัดการบัญชีสมาชิกทั้งหมด</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "ทั้งหมด", value: counts.total, color: "text-white" },
          { label: "Admin", value: counts.admin, color: "text-[#FCA5A5]" },
          { label: "Affiliate", value: counts.affiliate, color: "text-[#F59E0B]" },
          { label: "Seller", value: counts.seller, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-4">
            <div className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["UserID", "ชื่อ-สกุล", "Role", "เบอร์โทร", "LINE ID", "สถานะ", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-slate-500 font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500 text-sm">ยังไม่มีสมาชิก</td></tr>
              ) : members.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-[#F59E0B] font-mono font-bold text-xs">{m.user_code}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#DC2626]/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {m.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.avatar_url} alt={m.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#DC2626] text-xs font-bold">{m.full_name?.[0]?.toUpperCase() ?? "?"}</span>
                        )}
                      </div>
                      <span className="text-white text-sm font-medium">{m.full_name || <span className="text-slate-600 italic">ไม่ระบุ</span>}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", roleBg[m.role] ?? roleBg.seller)}>
                      {roleLabel[m.role] ?? m.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{m.phone || "—"}</td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{m.line_id || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", m.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-500")}>
                      {m.is_active ? "ใช้งาน" : "ระงับ"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <MemberRowActions id={m.id} role={m.role} isActive={m.is_active} name={m.full_name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
