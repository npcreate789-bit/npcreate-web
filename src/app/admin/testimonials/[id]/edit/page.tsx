import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TestimonialForm } from "../../_components/TestimonialForm"
import type { Testimonial } from "@/types/database"

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .single()

  if (!data) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/testimonials" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">แก้ไขรีวิว</h1>
          <p className="text-slate-400 text-sm mt-0.5">{data.client_name}</p>
        </div>
      </div>
      <TestimonialForm testimonial={data as Testimonial} />
    </div>
  )
}
