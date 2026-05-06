import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, FileText, Home, UserCog,
  Phone, MessageCircle, ChevronRight,
  TrendingUp, Clock, CheckCircle2, Store, ShoppingBag, Package,
  Tag, Users, Plus, BadgeCheck,
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
const leadStatusLabel: Record<string, string> = {
  new:       "รอติดต่อ",
  contacted: "ติดต่อแล้ว",
  closed:    "เสร็จสิ้น",
}
const leadStatusColor: Record<string, string> = {
  new:       "bg-[#F59E0B]/10 text-[#F59E0B]",
  contacted: "bg-blue-500/10 text-blue-400",
  closed:    "bg-emerald-500/10 text-emerald-400",
}
const leadStatusIcon: Record<string, React.ReactNode> = {
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
  if (profile.role_confirmed === false) redirect("/member/setup-role")

  const isLineOnly   = user.email?.endsWith("@line.npcreate.co.th") ?? false
  const displayName  = profile.full_name || (isLineOnly ? profile.line_display_name : null) || "สมาชิก"
  const initials     = displayName[0]?.toUpperCase() ?? "?"

  // ── Leads ──────────────────────────────────────────────────────────────────
  let myLeads: Pick<Lead, "id" | "brand" | "service" | "status" | "created_at" | "monthly_gmv">[] = []
  try {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("id, brand, service, status, created_at, monthly_gmv")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
    myLeads = (leadsData ?? []) as typeof myLeads
  } catch { /* leads table may not have member_id yet */ }

  // ── Affiliate: pull stats ──────────────────────────────────────────────────
  let pullStats = { pending: 0, approved: 0, sent: 0, total: 0 }
  if (profile.role === "affiliate") {
    const { data: pulls } = await supabase
      .from("affiliate_pulls")
      .select("sample_status")
      .eq("affiliate_id", user.id)
    const all = pulls ?? []
    pullStats = {
      pending:  all.filter(p => p.sample_status === "pending").length,
      approved: all.filter(p => p.sample_status === "approved").length,
      sent:     all.filter(p => p.sample_status === "sent").length,
      total:    all.length,
    }
  }

  // ── Seller: store + counts ─────────────────────────────────────────────────
  let sellerData: { storeId: string; storeName: string; productCount: number; campaignCount: number } | null = null
  if (profile.role === "seller") {
    const { data: storeRow } = await supabase
      .from("stores")
      .select("id, name")
      .eq("seller_id", user.id)
      .maybeSingle()

    if (storeRow) {
      const now = new Date().toISOString()
      const [prodRes, campRes] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("store_id", storeRow.id).eq("is_active", true),
        supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("store_id", storeRow.id).eq("is_active", true).lte("starts_at", now).gte("ends_at", now),
      ])
      sellerData = {
        storeId:       storeRow.id,
        storeName:     storeRow.name,
        productCount:  prodRes.count ?? 0,
        campaignCount: campRes.count ?? 0,
      }
    }
  }

  const hasActiveLead = myLeads.some(l => l.status === "new" || l.status === "contacted")

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16 overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">

        {/* ── Compact header ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20 flex items-center justify-center shrink-0 overflow-hidden">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#DC2626] font-bold text-lg">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-white text-base truncate">{displayName}</span>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0", roleBg[profile.role] ?? roleBg.seller)}>
                {roleLabel[profile.role] ?? profile.role}
              </span>
              {isLineOnly && (
                <span className="text-xs bg-[#06C755]/10 text-[#06C755] px-2 py-0.5 rounded-full shrink-0">LINE</span>
              )}
            </div>
            <p className="text-[#F59E0B] font-mono text-xs mt-0.5">{profile.user_code}</p>
          </div>
          <MemberLogout />
        </div>

        {/* ── Role: Affiliate ─────────────────────────────────────────────── */}
        {profile.role === "affiliate" && (
          <div className="space-y-3">
            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard value={pullStats.pending}            label="รอพิจารณา"  color="text-slate-400"   bg="bg-[#1C0D0D]" />
              <StatCard value={pullStats.approved + pullStats.sent} label="ผ่านแล้ว" color="text-emerald-400" bg="bg-[#1C0D0D]" highlight />
              <StatCard value={pullStats.total}              label="สินค้าทั้งหมด" color="text-[#F59E0B]" bg="bg-[#1C0D0D]" />
            </div>

            {/* Primary action tiles */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/product-ads"
                className="group flex items-center gap-3 bg-[#F59E0B]/5 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 hover:bg-[#F59E0B]/10 rounded-2xl p-4 sm:p-5 transition-colors">
                <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingBag size={18} className="text-[#F59E0B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm group-hover:text-[#F59E0B] transition-colors">ProductAds</p>
                  <p className="text-slate-500 text-xs mt-0.5">เลือกสินค้าโปรโมท</p>
                </div>
                <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-[#F59E0B] transition-colors" />
              </Link>

              <Link href="/member/my-products"
                className="group flex items-center gap-3 bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-2xl p-4 sm:p-5 transition-colors">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                  <Package size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm group-hover:text-[#FCA5A5] transition-colors">สินค้าของฉัน</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {pullStats.total > 0 ? `${pullStats.total} สินค้าที่ดึงมา` : "ยังไม่มีสินค้า"}
                  </p>
                </div>
                <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
              </Link>
            </div>

            {/* Approved nudge */}
            {pullStats.approved > 0 && (
              <Link href="/member/profile#address"
                className="group flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl px-4 py-3 transition-colors">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <p className="flex-1 text-emerald-300 text-xs">
                  {pullStats.approved} สินค้าอนุมัติแล้ว — <span className="underline underline-offset-2">กรอกที่อยู่รับสินค้า</span>
                </p>
                <ChevronRight size={13} className="text-emerald-500/50 shrink-0 group-hover:text-emerald-400 transition-colors" />
              </Link>
            )}
          </div>
        )}

        {/* ── Role: Seller ────────────────────────────────────────────────── */}
        {profile.role === "seller" && (
          <div className="space-y-3">
            {sellerData ? (
              <>
                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-2">
                  <StatCard value={sellerData.productCount}  label="สินค้า"     color="text-emerald-400" bg="bg-[#1C0D0D]" />
                  <StatCard value={sellerData.campaignCount} label="แคมเปญ"    color="text-[#F59E0B]"   bg="bg-[#1C0D0D]" />
                  <StatCard value="—"                        label="Affiliate"  color="text-slate-400"   bg="bg-[#1C0D0D]" />
                </div>

                {/* Main store tile */}
                <Link href="/member/store"
                  className="group flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/8 rounded-2xl p-5 transition-colors">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Store size={20} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-white text-base group-hover:text-emerald-400 transition-colors truncate">
                      {sellerData.storeName}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">จัดการสินค้า แคมเปญ และคำขอ</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 shrink-0 group-hover:text-emerald-400 transition-colors" />
                </Link>

                {/* Sub-links */}
                <div className="grid grid-cols-3 gap-2">
                  <SubLink href="/member/store/products/new" icon={<Plus size={13} />} label="เพิ่มสินค้า" />
                  <SubLink href="/member/store/campaigns"    icon={<Tag size={13} />}  label="แคมเปญ" />
                  <SubLink href="/member/store/pulls"        icon={<Users size={13} />} label="คำขอ Affiliate" />
                </div>
              </>
            ) : (
              /* No store yet */
              <Link href="/member/store"
                className="group flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-5 transition-colors">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Plus size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">สร้างร้านค้า</p>
                  <p className="text-slate-500 text-xs mt-0.5">เริ่มต้นขายด้วย Affiliate</p>
                </div>
                <ChevronRight size={18} className="text-slate-600 shrink-0 group-hover:text-emerald-400" />
              </Link>
            )}
          </div>
        )}

        {/* ── Compact profile card ─────────────────────────────────────────── */}
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/15 flex items-center justify-center shrink-0 overflow-hidden">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#DC2626] font-bold text-lg">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-white font-semibold text-sm truncate">{profile.full_name || "—"}</p>
                {profile.is_active && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full shrink-0">
                    <BadgeCheck size={9} /> ใช้งาน
                  </span>
                )}
              </div>
              <p className="text-[#F59E0B] font-mono text-xs">{profile.user_code}</p>
              <div className="flex items-center gap-3 mt-1">
                {profile.phone && (
                  <span className="text-slate-500 text-[10px] flex items-center gap-1">
                    <Phone size={9} /> {profile.phone}
                  </span>
                )}
                {(profile.line_display_name || profile.line_id) && (
                  <span className="text-[10px] flex items-center gap-1 text-[#06C755]/80">
                    <MessageCircle size={9} /> {profile.line_display_name || profile.line_id}
                  </span>
                )}
              </div>
            </div>
            <Link href="/member/profile"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors shrink-0">
              <UserCog size={12} />
              แก้ไข
            </Link>
          </div>
        </div>

        {/* ── Lead history ────────────────────────────────────────────────── */}
        {myLeads.length > 0 ? (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center">
                  <FileText size={12} className="text-slate-400" />
                </div>
                <h2 className="text-white font-semibold text-sm">ประวัติการติดต่อ</h2>
                <span className="text-slate-600 text-xs">{myLeads.length} รายการ</span>
              </div>
              {!hasActiveLead && (
                <Link href="/contact"
                  className="text-xs text-[#DC2626] hover:text-[#FCA5A5] font-medium transition-colors flex items-center gap-0.5">
                  ส่งใหม่ <ChevronRight size={11} />
                </Link>
              )}
            </div>
            <div className="space-y-1">
              {myLeads.map(lead => (
                <div key={lead.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-medium truncate">{lead.brand}</p>
                    <p className="text-slate-600 text-[10px] truncate">{lead.service} · {lead.monthly_gmv}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium",
                      leadStatusColor[lead.status] ?? leadStatusColor.new
                    )}>
                      {leadStatusIcon[lead.status]}
                      {leadStatusLabel[lead.status] ?? lead.status}
                    </span>
                    <span className="text-slate-600 text-[10px] hidden sm:block">
                      {new Date(lead.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center">
                  <FileText size={12} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-xs">ยังไม่มีประวัติการติดต่อ</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">ส่งคำขอเพื่อรับคำปรึกษาฟรีจาก NP Create</p>
                </div>
              </div>
              <Link href="/contact"
                className="shrink-0 text-xs bg-[#DC2626]/10 hover:bg-[#DC2626]/20 border border-[#DC2626]/20 text-[#DC2626] hover:text-[#FCA5A5] px-3 py-1.5 rounded-lg transition-colors font-medium">
                ปรึกษาฟรี
              </Link>
            </div>
          </div>
        )}

        {/* ── Admin shortcut ──────────────────────────────────────────────── */}
        {profile.role === "admin" && (
          <Link href="/admin"
            className="flex items-center gap-4 bg-[#DC2626]/5 border border-[#DC2626]/20 hover:border-[#DC2626]/40 hover:bg-[#DC2626]/8 rounded-2xl p-4 sm:p-5 transition-colors group">
            <div className="w-10 h-10 bg-[#DC2626]/10 rounded-xl flex items-center justify-center shrink-0">
              <LayoutDashboard size={18} className="text-[#DC2626]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm group-hover:text-[#FCA5A5] transition-colors">Admin Panel</p>
              <p className="text-slate-500 text-xs mt-0.5">จัดการผลงาน บริการ สมาชิก และการตั้งค่า</p>
            </div>
            <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
          </Link>
        )}

        {/* ── Back to public site — demoted to bottom text link ───────────── */}
        <div className="pt-1 pb-2">
          <Link href="/"
            className="flex items-center justify-center gap-2 text-slate-600 hover:text-slate-400 text-xs py-2 transition-colors">
            <Home size={12} />
            กลับหน้าหลัก NP Create
          </Link>
        </div>

      </div>
    </div>
  )
}

// ── Helper components ────────────────────────────────────────────────────────

function StatCard({ value, label, color, bg, highlight }: {
  value: number | string
  label: string
  color: string
  bg: string
  highlight?: boolean
}) {
  return (
    <div className={cn(
      "rounded-2xl border p-3 text-center space-y-1",
      bg,
      highlight ? "border-emerald-500/15" : "border-white/5"
    )}>
      <p className={cn("font-bold text-xl leading-none tabular-nums", color)}>{value}</p>
      <p className="text-slate-600 text-[10px]">{label}</p>
    </div>
  )
}

function SubLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}
      className="group flex flex-col items-center gap-1.5 bg-[#1C0D0D] border border-white/5 hover:border-white/15 hover:bg-white/[0.03] rounded-2xl px-2 py-3 transition-colors text-center">
      <div className="text-slate-500 group-hover:text-white transition-colors">{icon}</div>
      <span className="text-slate-500 group-hover:text-white text-[10px] font-medium transition-colors leading-tight">{label}</span>
    </Link>
  )
}
