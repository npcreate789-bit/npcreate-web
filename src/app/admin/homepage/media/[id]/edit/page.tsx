import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { HeroMediaForm } from "../../_components/HeroMediaForm"
import type { HeroMedia } from "@/types/database"

export default async function EditHeroMediaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: heroMedia } = await supabase
    .from("hero_media")
    .select("*")
    .eq("id", id)
    .single()

  if (!heroMedia) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/homepage/media" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">แก้ไขสื่อ Hero</h1>
          <p className="text-slate-400 text-sm mt-0.5">{heroMedia.caption ?? heroMedia.type}</p>
        </div>
      </div>
      <HeroMediaForm heroMedia={heroMedia as HeroMedia} />
    </div>
  )
}
