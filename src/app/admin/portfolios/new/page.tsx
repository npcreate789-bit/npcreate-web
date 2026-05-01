import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PortfolioForm } from "../_components/PortfolioForm"

export default function NewPortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/portfolios" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">เพิ่มผลงานใหม่</h1>
          <p className="text-slate-400 text-sm mt-0.5">กรอกข้อมูลผลงานที่ต้องการแสดงบนเว็บไซต์</p>
        </div>
      </div>

      <PortfolioForm />
    </div>
  )
}
