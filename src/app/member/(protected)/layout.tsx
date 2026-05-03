import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function MemberProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  // Redirect unconfirmed role to setup-role (skip if already on setup-role)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_confirmed, is_active")
    .eq("id", user.id)
    .maybeSingle()

  if (profile && !profile.is_active) redirect("/member/login")

  return <>{children}</>
}

// Allow setup-role page to be exempt from the role_confirmed check
// by handling it in the page itself (no infinite redirect)
