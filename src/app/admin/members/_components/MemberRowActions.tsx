"use client"

import { useState, useTransition } from "react"
import { Eye, EyeOff } from "lucide-react"
import { updateMemberRole, toggleMemberActive } from "../actions"

const roles = ["admin", "affiliate", "seller"] as const

export function MemberRowActions({
  id, role, isActive, name,
}: {
  id: string; role: string; isActive: boolean; name: string
}) {
  const [pending, start] = useTransition()
  const [currentRole, setCurrentRole] = useState(role)

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value
    if (!confirm(`เปลี่ยน role ของ "${name || id}" เป็น ${newRole}?`)) return
    setCurrentRole(newRole)
    start(() => updateMemberRole(id, newRole))
  }

  function handleToggle() {
    start(() => toggleMemberActive(id, !isActive))
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentRole}
        onChange={handleRoleChange}
        disabled={pending}
        className="bg-[#0A0808] border border-white/10 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-[#DC2626]/50 disabled:opacity-50 cursor-pointer"
      >
        {roles.map((r) => (
          <option key={r} value={r}>{r === "admin" ? "Admin" : r === "affiliate" ? "Affiliate" : "Seller"}</option>
        ))}
      </select>
      <button
        onClick={handleToggle}
        disabled={pending}
        title={isActive ? "ระงับ" : "เปิดใช้งาน"}
        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
      >
        {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}
