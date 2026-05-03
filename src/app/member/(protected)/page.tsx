import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, FileText, Home, UserCog,
  Phone, MessageCircle, CalendarDays, ChevronRight,
  TrendingUp, Clock, CheckCircle2, Store, ShoppingBag, Package,
} from "lucide-react"
import type { Profile, Lead } from "@/types/database"
import { MemberLogout } from "./_components/MemberLogout"
import { cn } from "@/lib/utils"

const roleLabel: Record<string, string> = {
  admin:     "ผู้ดูแล",
  affiliate: "Affiliate",
  seller:    "Seller",
}
const roleBg: Record<string, string> = {
  admin:     "bg-[#DC2626]/10 text-[#FCA5A5]",
  affiliate: "bg-[#F59E0B]/10 text-[#F59E0B]",
  seller:    "bg-emerald-500/10 text-emerald-400",
}
const statusLabel: Record<string, string> = {
  new:       "รอติดต่อ",
  contacted: "ติดต่อแล้ว",
  closed:    "เสร็จสิ้น",
}
const statusColor: Record<string, string> = {
  new:       "bg-[#F59E0B]/10 text-[#F59E0B]",
  contacted: "bg-blue-500/10 text-blue-400",
  closed:    "bg-emerald-500/10 text-emerald-400",
}
const statusIcon: Record<string, React.ReactNode> = {
  new:       <Clock size={11} />,
  contacted: <TrendingUp size={11} />,
  closed:    <CheckCircle2 size={11} />,
}

export default async function MemberPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  const profile = data as Profile | null
  if (!profile) redirect("/register")

  let myLeads: Pick<Lead, "id" | "brand" | "service" | "status" | "created_at" | "monthly_gmv">[] = []
  try {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("id, brand, service, status, created_at, monthly_gmv")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
    myLeads = (leadsData ?? []) as typeof myLeads
  } catch {
    // member_id column may not exist yet — graceful fallback
  }

  const isLineOnly = user.email?.endsWith("@line.npcreate.co.th") ?? false
  const displayEmail = isLineOnly ? null : user.email
  const hasActiveLead = myLeads.some(l => l.status === "new" || l.status === "contacted")

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16 overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display font-bold text-white text-2xl tracking-tight">พอร์ทัลสมาชิก</h1>
            <p className="text-slate-400 text-sm mt-0.5 truncate">ยินดีต้อนรับ, {profile.full_name || "สมาชิก"}</p>
          </div>
          <MemberLogout />
        </div>

        {/* Profile card */}
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#DC2626]/10 flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#DC2626]/20">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#DC2626] font-bold text-xl">
                  {profile.full_name?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-white text-lg truncate">{profile.full_name || "—"}</span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${roleBg[profile.role] ?? roleBg.seller}`}>
                  {roleLabel[profile.role] ?? profile.role}
                </span>
                {isLineOnly && (
                  <span className="text-xs bg-[#06C755]/10 text-[#06C755] border border-[#06C755]/20 px-2.5 py-0.5 rounded-full shrink-0">
                    LINE
                  </span>
                )}
                {!profile.is_active && (
                  <span className="text-xs bg-slate-500/10 text-slate-500 px-2.5 py-0.5 rounded-full shrink-0">ระงับ</span>
                )}
              </div>
              <p className="text-[#F59E0B] font-mono font-bold text-sm mt-1 truncate">{profile.user_code}</p>
              {displayEmail && (
                <p className="text-slate-500 text-xs mt-0.5 truncate">{displayEmail}</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/5">
            <InfoItem
              icon={<Phone size={12} className="text-slate-500 shrink-0" />}
              label="เบอร์โทรศัพท์"
              value={profile.phone || "—"}
            />
            <InfoItem
              icon={<MessageCircle size={12} className={profile.line_display_name ? "text-[#06C755] shrink-0" : "text-slate-500 shrink-0"} />}
              label="LINE"
              value={profile.line_display_name ? `${profile.line_display_name}` : profile.line_id || "—"}
              highlight={!!profile.line_display_name}
            />
            <InfoItem
              icon={<CalendarDays size={12} className="text-slate-500 shrink-0" />}
              label="สมัครเมื่อ"
              value={new Date(profile.created_at).toLocaleDateString("th-TH")}
            />
          </div>
        </div>

        {/* Primary CTA — กลับหน้าหลัก */}
        <Link href="/"
          className="group flex items-center gap-4 bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] rounded-2xl p-5 sm:p-6 transition-colors shadow-lg shadow-[#DC2626]/10">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
            <Home size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white text-base">กลับหน้าหลัก</p>
            <p className="text-red-200/70 text-xs mt-0.5">ดูบริการ ผลงาน และ case studies ของ NP Create</p>
          </div>
          <ChevronRight size={20} className="text-white/50 shrink-0 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Secondary actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/member/profile"
            className="group flex items-center gap-3 bg-[#1C0D0D] border border-white/5 hover:border-white/15 hover:bg-white/[0.03] rounded-2xl p-4 sm:p-5 transition-colors">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/8 transition-colors">
              <UserCog size={18} className="text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-sm group-hover:text-[#FCA5A5] transition-colors">แก้ไขโปรไฟล์</p>
              <p className="text-slate-500 text-xs mt-0.5 truncate">อัปเดตชื่อ เบอร์โทร LINE</p>
            </div>
            <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
          </Link>

          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp size={18} className="text-[#F59E0B]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-sm">ยอดส่ง Lead</p>
              <p className="text-[#F59E0B] font-bold text-lg leading-none mt-0.5">{myLeads.length} <span className="text-slate-500 text-xs font-normal">รายการ</span></p>
            </div>
          </div>
        </div>

        {/* Role-specific shortcuts */}
        {profile.role === "seller" && (
          <Link href="/member/store"
            className="group flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10 rounded-2xl p-4 sm:p-5 transition-colors">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Store size={18} className="text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">จัดการร้านค้า</p>
              <p className="text-slate-500 text-xs mt-0.5">เพิ่มสินค้า แคมเปญ ดูยอดคลิก</p>
            </div>
            <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
          </Link>
        )}

        {profile.role === "affiliate" && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/member/marketplace"
              className="group flex items-center gap-3 bg-[#F59E0B]/5 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 hover:bg-[#F59E0B]/10 rounded-2xl p-4 sm:p-5 transition-colors">
              <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center shrink-0">
                <ShoppingBag size={18} className="text-[#F59E0B]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm group-hover:text-[#F59E0B] transition-colors">Marketplace</p>
                <p className="text-slate-500 text-xs mt-0.5">เลือกสินค้าเพื่อโปรโมท</p>
              </div>
              <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
            </Link>
            <Link href="/member/my-products"
              className="group flex items-center gap-3 bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-2xl p-4 sm:p-5 transition-colors">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                <Package size={18} className="text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm group-hover:text-[#FCA5A5] transition-colors">สินค้าของฉัน</p>
                <p className="text-slate-500 text-xs mt-0.5">ลิงก์ติดตามและยอดคลิก</p>
              </div>
              <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
            </Link>
          </div>
        )}

        {/* Lead history — ด้านล่างสุด */}
        {myLeads.length > 0 ? (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
                  <FileText size={13} className="text-slate-400" />
                </div>
                <h2 className="text-white font-semibold text-sm">ประวัติการติดต่อ</h2>
              </div>
              {!hasActiveLead && (
                <Link href="/contact"
                  className="text-xs text-[#DC2626] hover:text-[#FCA5A5] transition-colors font-medium flex items-center gap-1">
                  ส่งคำขอใหม่ <ChevronRight size={12} />
                </Link>
              )}
            </div>
            <div className="space-y-1.5">
              {myLeads.map(lead => (
                <div key={lead.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{lead.brand}</p>
                    <p className="text-slate-500 text-xs truncate mt-0.5">{lead.service} · {lead.monthly_gmv}</p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium",
                      statusColor[lead.status] ?? statusColor.new
                    )}>
                      {statusIcon[lead.status]}
                      {statusLabel[lead.status] ?? lead.status}
                    </span>
                    <span className="text-slate-600 text-xs hidden sm:block">
                      {new Date(lead.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
                <FileText size={13} className="text-slate-400" />
              </div>
              <h2 className="text-white font-semibold text-sm">ประวัติการติดต่อ</h2>
            </div>
            <p className="text-slate-500 text-sm">ยังไม่มีประวัติการติดต่อ</p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 mt-4 bg-[#DC2626]/10 hover:bg-[#DC2626]/20 border border-[#DC2626]/20 hover:border-[#DC2626]/40 text-[#DC2626] hover:text-[#FCA5A5] transition-colors font-semibold text-sm px-4 py-2.5 rounded-xl">
              <MessageCircle size={15} />
              ปรึกษาฟรีได้เลย
              <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {/* Admin panel shortcut — ด้านล่างสุด */}
        {profile.role === "admin" && (
          <Link href="/admin"
            className="flex items-center gap-4 bg-[#DC2626]/5 border border-[#DC2626]/20 hover:border-[#DC2626]/40 hover:bg-[#DC2626]/10 rounded-2xl p-5 transition-colors group">
            <div className="w-10 h-10 bg-[#DC2626]/10 rounded-xl flex items-center justify-center shrink-0">
              <LayoutDashboard size={18} className="text-[#DC2626]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-sm group-hover:text-[#FCA5A5] transition-colors">จัดการหลังบ้าน</p>
              <p className="text-slate-500 text-xs mt-0.5 truncate">Admin Panel — จัดการผลงาน บริการ สมาชิก และการตั้งค่า</p>
            </div>
            <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
          </Link>
        )}

      </div>
    </div>
  )
}

function InfoItem({
  icon, label, value, highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest truncate">{label}</p>
      </div>
      <p className={cn("text-sm font-medium truncate", highlight ? "text-[#06C755]" : "text-white")}>
        {value}
      </p>
    </div>
  )
}
