import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Home, ShieldCheck, CalendarDays, Mail, BadgeCheck } from "lucide-react"
import type { Profile } from "@/types/database"
import { ProfileForm } from "./_components/ProfileForm"
import { ChangePasswordForm } from "./_components/ChangePasswordForm"
import { LineSection } from "./_components/LineSection"
import { AvatarUpload } from "./_components/AvatarUpload"
import { TiktokForm } from "./_components/TiktokForm"
import { AddressForm } from "./_components/AddressForm"
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

export default async function MemberProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const { data } = await supabase
    .from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (!data) redirect("/register")

  const profile    = data as Profile
  const isLineOnly = user.email?.endsWith("@line.npcreate.co.th") ?? false
  const displayEmail = isLineOnly ? null : user.email
  const initials   = profile.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "?"

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-5">

        {/* Back navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/member"
            className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0"
          >
            <ArrowLeft size={16} className="text-slate-400 group-hover:text-white transition-colors" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-white text-xl leading-tight">แก้ไขโปรไฟล์</h1>
            <p className="text-slate-500 text-xs mt-0.5 truncate">
              <span className="text-[#F59E0B] font-mono font-semibold">{profile.user_code}</span>
            </p>
          </div>
          <Link
            href="/"
            className="group flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition-colors shrink-0"
          >
            <Home size={13} />
            หน้าหลัก
          </Link>
        </div>

        {/* Avatar + identity card */}
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <AvatarUpload
              userId={profile.id}
              avatarUrl={profile.avatar_url}
              initials={initials}
            />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <p className="font-display font-bold text-white text-lg truncate">{profile.full_name || "—"}</p>
                <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0", roleBg[profile.role] ?? roleBg.seller)}>
                  {roleLabel[profile.role] ?? profile.role}
                </span>
                {profile.is_active ? (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full shrink-0">
                    <BadgeCheck size={11} /> ใช้งานอยู่
                  </span>
                ) : (
                  <span className="text-xs bg-slate-500/10 text-slate-500 px-2.5 py-0.5 rounded-full shrink-0">ระงับ</span>
                )}
              </div>
              <p className="text-[#F59E0B] font-mono font-semibold text-sm mt-1.5 truncate">{profile.user_code}</p>
              <p className="text-slate-600 text-[11px] mt-2">JPG, PNG, WebP ขนาดไม่เกิน 2MB</p>
            </div>
          </div>
        </div>

        {/* Account info — read-only */}
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6">
          <h2 className="text-white font-semibold text-sm mb-4">ข้อมูลบัญชี</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <AccountInfoItem
              icon={<Mail size={13} className={isLineOnly ? "text-slate-600" : "text-slate-400"} />}
              label="อีเมล"
              value={displayEmail ?? "—"}
              muted={!displayEmail}
            />
            <AccountInfoItem
              icon={<ShieldCheck size={13} className="text-slate-400" />}
              label="สิทธิ์"
              value={roleLabel[profile.role] ?? profile.role}
            />
            <AccountInfoItem
              icon={<CalendarDays size={13} className="text-slate-400" />}
              label="สมัครเมื่อ"
              value={new Date(profile.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
            />
          </div>
          {isLineOnly && (
            <p className="text-slate-600 text-xs mt-4 pt-4 border-t border-white/5">
              บัญชีนี้ใช้การเข้าสู่ระบบผ่าน LINE — ไม่มีอีเมลหรือรหัสผ่านในระบบ
            </p>
          )}
        </div>

        {/* LINE connection */}
        <LineSection
          lineUserId={profile.line_user_id ?? null}
          lineDisplayName={profile.line_display_name ?? null}
        />

        {/* Profile edit form */}
        <ProfileForm profile={profile} />

        {/* Affiliate-only: TikTok channel URL */}
        {profile.role === "affiliate" && (
          <TiktokForm currentUrl={profile.tiktok_channel_url} />
        )}

        {/* Affiliate-only: delivery address for sample products */}
        {profile.role === "affiliate" && (
          <AddressForm profile={profile} />
        )}

        {/* Change password — ล่างสุด (email users only) */}
        {!isLineOnly && <ChangePasswordForm />}

      </div>
    </div>
  )
}

function AccountInfoItem({
  icon, label, value, muted,
}: {
  icon: React.ReactNode
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">{label}</p>
      </div>
      <p className={cn("text-sm font-medium truncate", muted ? "text-slate-600" : "text-white")}>
        {value}
      </p>
    </div>
  )
}
