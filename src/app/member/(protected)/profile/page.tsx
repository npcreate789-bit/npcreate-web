import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Profile } from "@/types/database"
import { ProfileForm } from "./_components/ProfileForm"
import { ChangePasswordForm } from "./_components/ChangePasswordForm"

export default async function MemberProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const { data } = await supabase
    .from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (!data) redirect("/register")

  return (
    <div className="min-h-screen bg-[#0A0808] pt-24 pb-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">แก้ไขโปรไฟล์</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            UserID: <span className="text-[#F59E0B] font-mono font-bold">{(data as Profile).user_code}</span>
          </p>
        </div>
        <ProfileForm profile={data as Profile} email={user.email ?? ""} />
        <ChangePasswordForm />
      </div>
    </div>
  )
}
