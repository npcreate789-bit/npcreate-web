"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { label: "เนื้อหาหน้าแรก", href: "/admin/homepage" },
  { label: "แบนเนอร์โปรโมชัน", href: "/admin/homepage/banners" },
  { label: "สื่อ Hero", href: "/admin/homepage/media" },
]

interface Props {
  action?: React.ReactNode
}

export function HomepageHeader({ action }: Props) {
  const pathname = usePathname()

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">หน้าแรก</h1>
          <p className="text-slate-400 text-sm mt-0.5">จัดการเนื้อหาทั้งหมดที่แสดงในหน้าแรกของเว็บไซต์</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {action}
          <a
            href="https://npcreate.co.th"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-colors"
          >
            <ExternalLink size={14} />
            ดูหน้าจริง
          </a>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/5">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2 whitespace-nowrap",
                isActive
                  ? "text-white border-[#DC2626]"
                  : "text-slate-500 hover:text-slate-300 border-transparent"
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
