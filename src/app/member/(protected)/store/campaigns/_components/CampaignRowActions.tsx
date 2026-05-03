"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Pencil, Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react"
import { toggleCampaignActive, deleteCampaign } from "../actions"

export function CampaignRowActions({ id, title, isActive }: {
  id: string; title: string; isActive: boolean
}) {
  const [toggling, startToggle] = useTransition()
  const [deleting, startDelete] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => startToggle(async () => toggleCampaignActive(id, !isActive))} disabled={toggling}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40 text-slate-400 hover:text-white">
        {toggling ? <Loader2 size={14} className="animate-spin" /> : isActive ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} />}
      </button>
      <Link href={`/member/store/campaigns/${id}/edit`}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
        <Pencil size={14} />
      </Link>
      <button onClick={() => { if (!confirm(`ลบแคมเปญ "${title}"?`)) return; startDelete(async () => deleteCampaign(id)) }} disabled={deleting}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40 text-slate-400 hover:text-red-400">
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </div>
  )
}
