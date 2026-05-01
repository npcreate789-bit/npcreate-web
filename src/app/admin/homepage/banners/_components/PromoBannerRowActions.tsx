"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { deletePromoBanner, togglePromoBannerActive } from "../actions"

interface Props {
  id: string
  heading: string
  isActive: boolean
}

export function PromoBannerRowActions({ id, heading, isActive }: Props) {
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(() => togglePromoBannerActive(id, !isActive))
  }

  function handleDelete() {
    if (!confirm(`ลบ "${heading}" ใช่ไหม?`)) return
    startTransition(() => deletePromoBanner(id))
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleToggle}
        disabled={pending}
        title={isActive ? "ซ่อน" : "แสดง"}
        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
      >
        {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <Link
        href={`/admin/homepage/banners/${id}/edit`}
        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Pencil size={14} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-40"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
