import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/admin/Sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Sidebar />
      {/* Desktop: offset for sidebar | Mobile: offset for top bar */}
      <div className="lg:pl-56 pt-14 lg:pt-0">
        <main className="p-6 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
