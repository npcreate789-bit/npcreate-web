"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleProductActive, deleteProduct } from "../actions"

interface Props {
  id: string
  name: string
  isActive: boolean
}

export function ProductRowActions({ id, name, isActive }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={async () => { await toggleProductActive(id, !isActive) }}
        className={cn(
          "text-xs font-medium px-2.5 py-1 rounded-full transition-colors",
          isActive
            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-white/5 text-slate-400 hover:text-white"
        )}
      >
        {isActive ? "เปิดขาย" : "ปิดอยู่"}
      </button>

      <Link
        href={`/admin/marketplace/${id}/edit`}
        className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
      >
        <Pencil size={14} />
      </Link>

      <button
        type="button"
        onClick={async () => {
          if (confirm(`ลบ "${name}" ใช่ไหม? จะลบข้อมูล Affiliate ที่ดึงสินค้านี้ด้วย`)) {
            await deleteProduct(id)
          }
        }}
        className="text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 text-xs"
      >
        ลบ
      </button>
    </div>
  )
}
