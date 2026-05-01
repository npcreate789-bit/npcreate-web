"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Loader2 } from "lucide-react"

export function MemberLogout() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <button onClick={logout} disabled={loading}
      className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
      ออกจากระบบ
    </button>
  )
}
