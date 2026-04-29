import type { Metadata } from "next"
import { PortfolioGrid } from "@/components/public/portfolio/PortfolioGrid"

export const metadata: Metadata = {
  title: "ผลงาน",
  description:
    "ผลงานการยิงแอด GMV Max กว่า 50 แบรนด์ สร้างยอดขายรวมทะลุ 100 ล้านบาท ตัวเลขจริงจาก TikTok Shop dashboard",
}

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Page header */}
        <div className="max-w-2xl mb-14">
          <span className="text-[#6366F1] text-sm font-semibold uppercase tracking-widest">
            ผลงานของเรา
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
            ผลลัพธ์ที่พิสูจน์แล้ว
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            ตัวเลขทุกตัวมาจาก TikTok Shop dashboard โดยตรง ไม่ใช่ตัวเลขที่สร้างขึ้น
          </p>

          {/* Summary stats */}
          <div className="flex gap-8 mt-8">
            {[
              { value: "100M+", label: "GMV รวม (บาท)" },
              { value: "50+", label: "แบรนด์ที่ดูแล" },
              { value: "10x", label: "Growth เฉลี่ย" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-bold text-2xl text-[#F59E0B]">{stat.value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <PortfolioGrid />
      </div>
    </main>
  )
}
