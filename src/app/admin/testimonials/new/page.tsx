import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TestimonialForm } from "../_components/TestimonialForm"

export default function NewTestimonialPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/testimonials" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">เพิ่มรีวิว</h1>
          <p className="text-slate-400 text-sm mt-0.5">เพิ่มรีวิวใหม่จากลูกค้า</p>
        </div>
      </div>
      <TestimonialForm />
    </div>
  )
}
