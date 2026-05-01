import { createClient } from "@/lib/supabase/server"
import { mergeSiteInfo } from "@/lib/data/site-info"
import { SiteInfoForm } from "./_components/SiteInfoForm"
import { AdminAccountForm } from "./_components/AdminAccountForm"
import { Globe, Shield } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()

  const [{ data: siteData }, { data: { user } }] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "site_info").maybeSingle(),
    supabase.auth.getUser(),
  ])

  const siteInfo = mergeSiteInfo((siteData?.value ?? {}) as Record<string, unknown>)
  const email = user?.email ?? ""

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">ตั้งค่า</h1>
        <p className="text-slate-400 text-sm mt-0.5">จัดการข้อมูลเว็บไซต์และบัญชีผู้ดูแล</p>
      </div>

      {/* Site info section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 pb-1 border-b border-white/5">
          <Globe size={16} className="text-[#DC2626]" />
          <h2 className="font-semibold text-white text-base">ข้อมูลเว็บไซต์ (หน้าบ้าน)</h2>
        </div>
        <SiteInfoForm initial={siteInfo} />
      </section>

      {/* Admin account section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 pb-1 border-b border-white/5">
          <Shield size={16} className="text-[#DC2626]" />
          <h2 className="font-semibold text-white text-base">บัญชีผู้ดูแล (หลังบ้าน)</h2>
        </div>
        <AdminAccountForm email={email} />
      </section>
    </div>
  )
}
