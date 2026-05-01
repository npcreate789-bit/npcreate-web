"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, Briefcase, Star, Settings,
  LogOut, Menu, X, MessageSquare, Home, UserCircle, FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/admin",           label: "แดชบอร์ด", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads",     label: "Leads",     icon: Users },
  { href: "/admin/homepage",  label: "หน้าแรก",   icon: Home },
  { href: "/admin/portfolios",label: "Portfolio",  icon: Briefcase },
  { href: "/admin/services",  label: "บริการ",     icon: MessageSquare },
  { href: "/admin/testimonials", label: "รีวิว",  icon: Star },
  { href: "/admin/about",      label: "เกี่ยวกับเรา", icon: FileText },
  { href: "/admin/members",    label: "สมาชิก",   icon: UserCircle },
  { href: "/admin/settings",  label: "ตั้งค่า",   icon: Settings },
]

function NavLinks({
  isActive,
  onLinkClick,
}: {
  isActive: (href: string, exact?: boolean) => boolean
  onLinkClick: () => void
}) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              active
                ? "bg-[#DC2626]/10 text-[#FCA5A5] border border-[#DC2626]/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon size={18} className={active ? "text-[#DC2626]" : ""} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({
  isActive,
  onLinkClick,
  onLogout,
  loggingOut,
}: {
  isActive: (href: string, exact?: boolean) => boolean
  onLinkClick: () => void
  onLogout: () => void
  loggingOut: boolean
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/5">
        <span className="font-display font-bold text-lg text-white">
          NP<span className="text-[#DC2626]">Create</span>
        </span>
        <p className="text-slate-500 text-xs mt-0.5">Admin Panel</p>
      </div>

      <NavLinks isActive={isActive} onLinkClick={onLinkClick} />

      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={onLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut size={18} />
          {loggingOut ? "กำลังออก..." : "ออกจากระบบ"}
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/member/login")
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-[#0A0404] border-r border-white/5 fixed inset-y-0 left-0 z-30">
        <SidebarContent
          isActive={isActive}
          onLinkClick={() => setMobileOpen(false)}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0A0404] border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <span className="font-display font-bold text-white">
          NP<span className="text-[#DC2626]">Create</span>
        </span>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-slate-400 hover:text-white"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0404] border-r border-white/5 flex flex-col">
            <SidebarContent
              isActive={isActive}
              onLinkClick={() => setMobileOpen(false)}
              onLogout={handleLogout}
              loggingOut={loggingOut}
            />
          </aside>
        </>
      )}
    </>
  )
}
