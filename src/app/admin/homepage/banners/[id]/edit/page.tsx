import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { PromoBanner } from "@/types/database"
import { PromoBannerForm } from "../../_components/PromoBannerForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPromoBannerPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("promo_banners")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!data) notFound()
  const banner = data as PromoBanner

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">แก้ไขแบนเนอร์</h1>
        <p className="text-slate-400 text-sm mt-0.5">{banner.heading || "ไม่มีหัวข้อ"}</p>
      </div>
      <PromoBannerForm banner={banner} />
    </div>
  )
}
