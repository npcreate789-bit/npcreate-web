"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react"
import { toggleProductActive, deleteProduct } from "../actions"

export function ProductRowActions({ id, name, isActive }: {
  id: string
  name: string
  isActive: boolean
}) {
  const [toggling, startToggle] = useTransition()
  const [deleting, startDelete] = useTransition()

  function handleToggle() {
    startToggle(async () => { await toggleProductActive(id, !isActive) })
  }

  function handleDelete() {
    if (!confirm(`ลบสินค้า "${name}" ใช่ไหม? ไม่สามารถยกเลิกได้`)) return
    startDelete(async () => { await deleteProduct(id) })
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleToggle} disabled={toggling}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40 text-slate-400 hover:text-white">
        {toggling ? <Loader2 size={14} className="animate-spin" /> : isActive ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
      <Link href={`/member/store/products/${id}/edit`}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
        <Pencil size={14} />
      </Link>
      <button onClick={handleDelete} disabled={deleting}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40 text-slate-400 hover:text-red-400">
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </div>
  )
}
