import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SetupRoleClient } from "./_components/SetupRoleClient"

export default async function SetupRolePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_confirmed")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role_confirmed === true) redirect("/member")

  return <SetupRoleClient />
}
