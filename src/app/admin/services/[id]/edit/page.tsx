import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ServiceForm } from "../../_components/ServiceForm"
import type { Service } from "@/types/database"

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single()

  if (!service) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/services" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">แก้ไขรายการ</h1>
          <p className="text-slate-400 text-sm mt-0.5">{service.title}</p>
        </div>
      </div>
      <ServiceForm service={service as Service} />
    </div>
  )
}
