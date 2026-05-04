import { redirect } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Home, ShieldCheck, CalendarDays, Mail, BadgeCheck,
  ShoppingBag, Package, Store, UserCog, CheckCircle2, Circle, ChevronRight,
} from "lucide-react"
import type { Profile } from "@/types/database"
import { ProfileForm } from "./_components/ProfileForm"
import { ChangePasswordForm } from "./_components/ChangePasswordForm"
import { LineSection } from "./_components/LineSection"
import { AvatarUpload } from "./_components/AvatarUpload"
import { TiktokForm } from "./_components/TiktokForm"
import { AddressForm } from "./_components/AddressForm"
import { ContentTypeForm } from "./_components/ContentTypeForm"
import { createClient } from "@/lib/supabase/server"
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

  const profile      = data as Profile
  const isLineOnly   = user.email?.endsWith("@line.npcreate.co.th") ?? false
  const displayEmail = isLineOnly ? null : user.email
  const initials     = profile.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "?"

  type CompletionItem = { label: string; done: boolean; anchor: string }
  const completionItems: CompletionItem[] = profile.role === "affiliate"
    ? [
        { label: "ชื่อ-สกุล",        done: !!profile.full_name?.trim(),                       anchor: "#personal"      },
        { label: "เบอร์โทร",          done: !!profile.phone?.trim(),                           anchor: "#personal"      },
        { label: "ช่อง TikTok",      done: !!profile.tiktok_channel_url,                      anchor: "#tiktok"        },
        { label: "รูปแบบคอนเทนต์",   done: !!profile.content_type,                            anchor: "#content-type"  },
        { label: "ที่อยู่จัดส่ง",     done: !!(profile.address_name && profile.address_line1), anchor: "#address"       },
      ]
    : [
        { label: "ชื่อ-สกุล", done: !!profile.full_name?.trim(), anchor: "#personal" },
        { label: "เบอร์โทร",  done: !!profile.phone?.trim(),     anchor: "#personal" },
      ]

  const completedCount = completionItems.filter(i => i.done).length
  const isComplete     = completedCount === completionItems.length

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-5">

        {/* Top navigation */}
        <div className="flex items-center gap-3">
          <Link href="/member"
            className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0">
            <ArrowLeft size={16} className="text-slate-400 group-hover:text-white transition-colors" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-white text-xl leading-tight">แก้ไขโปรไฟล์</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              <span className="text-[#F59E0B] font-mono font-semibold">{profile.user_code}</span>
            </p>
          </div>
          <Link href="/"
            className="group flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition-colors shrink-0">
            <Home size={13} />
            หน้าหลัก
          </Link>
        </div>

        {/* Quick tabs — role-specific shortcuts */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
          {profile.role === "affiliate" && (
            <>
              <Link href="/marketplace"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C0D0D] border border-white/5 hover:border-[#F59E0B]/30 text-slate-400 hover:text-[#F59E0B] text-xs font-medium transition-colors whitespace-nowrap shrink-0">
                <ShoppingBag size={13} /> Marketplace
              </Link>
              <Link href="/member/my-products"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C0D0D] border border-white/5 hover:border-white/15 text-slate-400 hover:text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0">
                <Package size={13} /> สินค้าของฉัน
              </Link>
            </>
          )}
          {profile.role === "seller" && (
            <Link href="/member/store"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C0D0D] border border-white/5 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 text-xs font-medium transition-colors whitespace-nowrap shrink-0">
              <Store size={13} /> จัดการร้านค้า
            </Link>
          )}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-semibold whitespace-nowrap shrink-0">
            <UserCog size={13} /> โปรไฟล์
          </div>
        </div>

        {/* Profile completion banner — affiliate only, hidden when fully complete */}
        {profile.role === "affiliate" && !isComplete && (
          <div className="bg-[#1C0D0D] border border-[#F59E0B]/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold text-sm">เติมข้อมูลให้ครบเพื่อรับสินค้าตัวอย่าง</p>
              <span className="text-[#F59E0B] font-bold text-xs tabular-nums">{completedCount}/{completionItems.length}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / completionItems.length) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1">
              {completionItems.map(item => (
                <a key={item.label} href={item.anchor}
                  className={cn(
                    "flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-colors",
                    item.done
                      ? "text-emerald-400 pointer-events-none"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}>
                  {item.done
                    ? <CheckCircle2 size={13} className="shrink-0" />
                    : <Circle size={13} className="shrink-0 text-slate-600" />}
                  <span>{item.label}</span>
                  {!item.done && <ChevronRight size={10} className="ml-auto opacity-50" />}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Hero card — avatar + identity + account info (merged) */}
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <AvatarUpload
              userId={profile.id}
              avatarUrl={profile.avatar_url}
              initials={initials}
            />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <p className="font-display font-bold text-white text-lg truncate">
                  {profile.full_name || "—"}
                </p>
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
              <p className="text-slate-600 text-[11px] mt-2 hidden sm:block">JPG, PNG, WebP ไม่เกิน 2MB</p>
            </div>
          </div>

          {/* Account info row — read-only */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/5">
            <AccountInfoItem
              icon={<Mail size={12} className={isLineOnly ? "text-slate-600" : "text-slate-400"} />}
              label="อีเมล"
              value={displayEmail ?? "—"}
              muted={!displayEmail}
            />
            <AccountInfoItem
              icon={<ShieldCheck size={12} className="text-slate-400" />}
              label="สิทธิ์"
              value={roleLabel[profile.role] ?? profile.role}
            />
            <AccountInfoItem
              icon={<CalendarDays size={12} className="text-slate-400" />}
              label="สมัครเมื่อ"
              value={new Date(profile.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
            />
          </div>

          {isLineOnly && (
            <p className="text-slate-600 text-xs mt-3 pt-3 border-t border-white/5">
              บัญชีนี้เข้าสู่ระบบผ่าน LINE — ไม่มีอีเมลหรือรหัสผ่านในระบบ
            </p>
          )}
        </div>

        {/* LINE connection */}
        <LineSection
          lineUserId={profile.line_user_id ?? null}
          lineDisplayName={profile.line_display_name ?? null}
        />

        {/* Personal info form */}
        <div id="personal" className="scroll-mt-4">
          <ProfileForm profile={profile} />
        </div>

        {/* Affiliate-only: TikTok channel URL */}
        {profile.role === "affiliate" && (
          <div id="tiktok" className="scroll-mt-4">
            <TiktokForm currentUrl={profile.tiktok_channel_url} />
          </div>
        )}

        {/* Affiliate-only: content type */}
        {profile.role === "affiliate" && (
          <ContentTypeForm current={profile.content_type ?? null} />
        )}

        {/* Affiliate-only: delivery address */}
        {profile.role === "affiliate" && (
          <AddressForm profile={profile} />
        )}

        {/* Change password — email users only */}
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
        <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest truncate">{label}</p>
      </div>
      <p className={cn("text-xs font-medium truncate", muted ? "text-slate-600" : "text-white")}>
        {value}
      </p>
    </div>
  )
}
