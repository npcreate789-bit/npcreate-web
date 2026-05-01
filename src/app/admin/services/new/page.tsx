import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ServiceForm } from "../_components/ServiceForm"

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/services" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">เพิ่มรายการใหม่</h1>
          <p className="text-slate-400 text-sm mt-0.5">บริการหรือแพ็กเกจที่แสดงบนหน้า /services</p>
        </div>
      </div>
      <ServiceForm />
    </div>
  )
}
