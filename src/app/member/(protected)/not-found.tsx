import Link from "next/link"
import { Search } from "lucide-react"

export default function MemberNotFound() {
  return (
    <div className="min-h-screen bg-[#0A0808] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
          <Search size={28} className="text-slate-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-xl">ไม่พบหน้าที่ต้องการ</h1>
          <p className="text-slate-500 text-sm mt-2">หน้านี้อาจถูกย้ายหรือไม่มีอยู่</p>
        </div>
        <Link href="/member"
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
          กลับ Dashboard
        </Link>
      </div>
    </div>
  )
}
