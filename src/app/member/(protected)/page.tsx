import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard } from "lucide-react"
import type { Profile } from "@/types/database"
import { MemberLogout } from "./_components/MemberLogout"

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

  return (
    <div className="min-h-screen bg-[#0A0808] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-bold text-white text-2xl">พอร์ทัลสมาชิก</h1>
            <p className="text-slate-400 text-sm mt-0.5">ยินดีต้อนรับ, {profile.full_name || "สมาชิก"}</p>
          </div>
          <MemberLogout />
        </div>

        {/* Profile card */}
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
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
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-white text-lg">{profile.full_name || "—"}</span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${roleBg[profile.role] ?? roleBg.seller}`}>
                  {roleLabel[profile.role] ?? profile.role}
                </span>
                {!profile.is_active && (
                  <span className="text-xs bg-slate-500/10 text-slate-500 px-2.5 py-0.5 rounded-full">ระงับ</span>
                )}
              </div>
              <p className="text-[#F59E0B] font-mono font-bold text-sm mt-1">{profile.user_code}</p>
              <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
            <InfoItem label="เบอร์โทรศัพท์" value={profile.phone || "—"} />
            <InfoItem label="LINE ID" value={profile.line_id || "—"} />
            <InfoItem label="สมัครเมื่อ" value={new Date(profile.created_at).toLocaleDateString("th-TH")} />
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/member/profile"
            className="bg-[#1C0D0D] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-colors group">
            <p className="font-semibold text-white text-sm group-hover:text-[#FCA5A5] transition-colors">แก้ไขโปรไฟล์</p>
            <p className="text-slate-500 text-xs mt-1">อัปเดตชื่อ เบอร์โทร LINE ID</p>
          </Link>
          <Link href="/"
            className="bg-[#1C0D0D] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-colors group">
            <p className="font-semibold text-white text-sm group-hover:text-[#FCA5A5] transition-colors">กลับหน้าหลัก</p>
            <p className="text-slate-500 text-xs mt-1">ดูบริการและผลงานของ NP Create</p>
          </Link>
        </div>

        {/* Admin panel shortcut — visible to admin only */}
        {profile.role === "admin" && (
          <Link href="/admin"
            className="flex items-center gap-4 bg-[#DC2626]/5 border border-[#DC2626]/20 hover:border-[#DC2626]/40 hover:bg-[#DC2626]/10 rounded-2xl p-5 transition-colors group">
            <div className="w-10 h-10 bg-[#DC2626]/10 rounded-xl flex items-center justify-center shrink-0">
              <LayoutDashboard size={18} className="text-[#DC2626]" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm group-hover:text-[#FCA5A5] transition-colors">จัดการหลังบ้าน</p>
              <p className="text-slate-500 text-xs mt-0.5">Admin Panel — จัดการผลงาน บริการ สมาชิก และการตั้งค่า</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">{label}</p>
      <p className="text-white text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}
