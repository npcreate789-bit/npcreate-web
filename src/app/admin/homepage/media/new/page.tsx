import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { HeroMediaForm } from "../_components/HeroMediaForm"

export default function NewHeroMediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/homepage/media" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">เพิ่มสื่อ Hero</h1>
          <p className="text-slate-400 text-sm mt-0.5">รูปภาพหรือวิดีโอที่แสดงในส่วน Hero ของหน้าแรก</p>
        </div>
      </div>
      <HeroMediaForm />
    </div>
  )
}
