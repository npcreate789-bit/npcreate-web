import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/admin/Sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/member/login?next=/admin")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") redirect("/member")

  return (
    <div className="min-h-screen bg-[#0A0808]">
      <Sidebar />
      <div className="lg:pl-56 pt-14 lg:pt-0">
        <main className="p-6 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
