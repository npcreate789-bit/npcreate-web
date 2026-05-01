import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function MemberProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")
  return <>{children}</>
}
