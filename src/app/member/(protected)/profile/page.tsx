import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Profile } from "@/types/database"
import { ProfileForm } from "./_components/ProfileForm"
import { ChangePasswordForm } from "./_components/ChangePasswordForm"
import { LineSection } from "./_components/LineSection"

export default async function MemberProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const { data } = await supabase
    .from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (!data) redirect("/register")

  const profile    = data as Profile
  // LINE-only users have virtual email ending with @line.npcreate.co.th
  const isLineOnly = user.email?.endsWith("@line.npcreate.co.th") ?? false

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">แก้ไขโปรไฟล์</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-slate-400 text-sm">
              UserID: <span className="text-[#F59E0B] font-mono font-bold">{profile.user_code}</span>
            </p>
            {isLineOnly && (
              <span className="text-[#06C755] text-xs bg-[#06C755]/10 border border-[#06C755]/20 px-2 py-0.5 rounded-full">
                สมาชิก LINE
              </span>
            )}
          </div>
        </div>
        <ProfileForm profile={profile} email={user.email ?? ""} />
        <LineSection
          lineUserId={profile.line_user_id ?? null}
          lineDisplayName={profile.line_display_name ?? null}
        />
        {!isLineOnly && <ChangePasswordForm />}
      </div>
    </div>
  )
}
