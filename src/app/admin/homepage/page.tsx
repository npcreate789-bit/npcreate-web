import { createClient } from "@/lib/supabase/server"
import { mergeHomepage } from "@/lib/data/homepage"
import { HomepageForm } from "./_components/HomepageForm"
import Link from "next/link"
import { Image as ImageIcon, LayoutTemplate } from "lucide-react"

export default async function HomepageSettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "homepage")
    .maybeSingle()

  const settings = mergeHomepage((data?.value ?? {}) as Record<string, unknown>)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">หน้าแรก</h1>
          <p className="text-slate-400 text-sm mt-0.5">แก้ไขเนื้อหาทุกส่วนในหน้าแรกของเว็บไซต์</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/homepage/banners"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <LayoutTemplate size={15} />
            แบนเนอร์โปรโมชัน
          </Link>
          <Link
            href="/admin/homepage/media"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <ImageIcon size={15} />
            จัดการสื่อ Hero
          </Link>
        </div>
      </div>
      <HomepageForm initial={settings} />
    </div>
  )
}
