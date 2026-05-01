import { createClient } from "@/lib/supabase/server"
import { mergeAboutContent } from "@/lib/data/about-content"
import { AboutContentForm } from "./_components/AboutContentForm"
import { FileText } from "lucide-react"

export default async function AdminAboutPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "about_content")
    .maybeSingle()

  const content = mergeAboutContent((data?.value ?? {}) as Record<string, unknown>)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2.5 mb-0.5">
          <FileText size={18} className="text-[#DC2626]" />
          <h1 className="font-display font-bold text-white text-2xl">เกี่ยวกับเรา</h1>
        </div>
        <p className="text-slate-400 text-sm mt-0.5">จัดการเนื้อหาหน้า /about</p>
      </div>
      <AboutContentForm initial={content} />
    </div>
  )
}
