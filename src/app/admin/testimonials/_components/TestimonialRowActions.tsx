"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteTestimonial, togglePublishedTestimonial } from "../actions"

interface Props {
  id: string
  clientName: string
  isPublished: boolean
}

export function TestimonialRowActions({ id, clientName, isPublished }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={async () => { await togglePublishedTestimonial(id, !isPublished) }}
        className={cn(
          "text-xs font-medium px-2.5 py-1 rounded-full transition-colors",
          isPublished
            ? "bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20"
            : "bg-white/5 text-slate-400 hover:text-white"
        )}
      >
        {isPublished ? "เผยแพร่แล้ว" : "ซ่อนอยู่"}
      </button>
      <Link
        href={`/admin/testimonials/${id}/edit`}
        className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
      >
        <Pencil size={14} />
      </Link>
      <button
        type="button"
        onClick={async () => {
          if (confirm(`ลบรีวิวของ "${clientName}" ใช่ไหม?`)) await deleteTestimonial(id)
        }}
        className="text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 text-xs"
      >
        ลบ
      </button>
    </div>
  )
}
