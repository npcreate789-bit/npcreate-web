import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { FloatingLineButton } from "@/components/public/FloatingLineButton"
import { createClient } from "@/lib/supabase/server"
import { mergeSiteInfo, getLineOaHref } from "@/lib/data/site-info"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: siteData } = await supabase
    .from("site_settings").select("value").eq("key", "site_info").maybeSingle()
  const info       = mergeSiteInfo((siteData?.value ?? {}) as Record<string, unknown>)
  const lineOaHref = getLineOaHref(info.line_oa_url, info.line_oa_id)

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0808]">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer lineHref={lineOaHref} />
      <FloatingLineButton href={lineOaHref} />
    </div>
  )
}
