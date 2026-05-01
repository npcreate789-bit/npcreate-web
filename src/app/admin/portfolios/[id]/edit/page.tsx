import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PortfolioForm } from "../../_components/PortfolioForm"
import type { Portfolio } from "@/types/database"

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .single()

  if (!portfolio) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/portfolios" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">แก้ไขผลงาน</h1>
          <p className="text-slate-400 text-sm mt-0.5">{portfolio.title}</p>
        </div>
      </div>

      <PortfolioForm portfolio={portfolio as Portfolio} />
    </div>
  )
}
