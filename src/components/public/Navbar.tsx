"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"

const NAV_LINKS = [
  { label: "หน้าแรก", href: "/" },
  { label: "ผลงาน",   href: "/portfolio" },
  { label: "บริการ",   href: "/services" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "ติดต่อ",  href: "https://app.npcreate.co.th/contact" },
]

export function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser]         = useState<User | null | undefined>(undefined)
  const [profileName, setProfileName] = useState("")
  const [userCode, setUserCode]       = useState("")
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(null)
  const pathname = usePathname()

  // Close mobile menu on navigation
  useEffect(() => { setOpen(false) }, [pathname])

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Auth
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      if (data.user) {
        supabase
          .from("profiles")
          .select("full_name,user_code,avatar_url")
          .eq("id", data.user.id)
          .maybeSingle()
          .then(({ data: p }) => {
            if (p) {
              setProfileName(p.full_name)
              setUserCode(p.user_code)
              setAvatarUrl(p.avatar_url)
            }
          })
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) { setProfileName(""); setUserCode(""); setAvatarUrl(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0A0808]/95 backdrop-blur-xl shadow-xl shadow-black/30"
          : "bg-[#0A0808]/75 backdrop-blur-md"
      )}
    >
      {/* Bottom gradient accent — same as Footer top border */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#DC2626]/40 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="font-display font-bold text-xl text-white tracking-tight shrink-0 group"
        >
          NP<span className="text-[#DC2626] group-hover:text-[#EF4444] transition-colors duration-200">
            Create
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3.5 py-2 text-sm rounded-xl transition-all duration-200 font-medium",
                  active
                    ? "text-white bg-white/5"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-[#DC2626] rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* ── Desktop auth ── */}
        <div className="hidden md:flex items-center shrink-0">
          <NavAuth
            user={user}
            profileName={profileName}
            userCode={userCode}
            avatarUrl={avatarUrl}
            onLogout={handleLogout}
          />
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0A0808]">
          {/* Links */}
          <div className="px-3 pt-3 pb-2 space-y-0.5">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors",
                    active
                      ? "bg-[#DC2626]/10 text-white font-medium border border-[#DC2626]/20"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Auth */}
          <div className="px-3 pt-2 pb-4 border-t border-white/5 mt-1">
            {user === undefined ? (
              <div className="h-10 bg-white/5 animate-pulse rounded-xl" />
            ) : user ? (
              <div className="space-y-0.5">
                {/* Profile card */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20 overflow-hidden flex items-center justify-center shrink-0">
                    {avatarUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={avatarUrl} alt={profileName} className="w-full h-full object-cover" />
                      : <span className="text-[#FCA5A5] text-sm font-bold">
                          {profileName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
                        </span>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{profileName || "สมาชิก"}</p>
                    {userCode
                      ? <p className="text-[#F59E0B] text-xs font-mono font-bold">{userCode}</p>
                      : <p className="text-slate-500 text-xs truncate">{user.email}</p>
                    }
                  </div>
                </div>
                <a href="/member" className="flex items-center px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 text-sm rounded-xl transition-colors" onClick={() => setOpen(false)}>
                  พอร์ทัลสมาชิก
                </a>
                <a href="/member/profile" className="flex items-center px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 text-sm rounded-xl transition-colors" onClick={() => setOpen(false)}>
                  แก้ไขโปรไฟล์
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 text-sm rounded-xl transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <a
                href="/member/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#DC2626]/10 hover:bg-[#DC2626]/20 border border-[#DC2626]/20 text-[#FCA5A5] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                เข้าสู่ระบบ / สมาชิก
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// ── Desktop auth dropdown ──────────────────────────────────────────────────────

function NavAuth({
  user, profileName, userCode, avatarUrl, onLogout,
}: {
  user: User | null | undefined
  profileName: string
  userCode: string
  avatarUrl: string | null
  onLogout: () => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  if (user === undefined) {
    return <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
  }

  if (!user) {
    return (
      <a
        href="/member/login"
        className="text-sm text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 px-4 py-1.5 rounded-xl transition-all duration-200"
      >
        เข้าสู่ระบบ
      </a>
    )
  }

  const initials = profileName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#DC2626]/20 border border-[#DC2626]/30 flex items-center justify-center text-[#FCA5A5] text-xs font-bold overflow-hidden">
          {avatarUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={avatarUrl} alt={profileName} className="w-full h-full object-cover" />
            : initials
          }
        </div>
        {userCode && (
          <span className="hidden sm:block text-[#F59E0B] text-xs font-mono font-bold">
            {userCode}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#140808] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <div className="px-4 py-3.5 border-b border-white/5">
            <p className="text-white text-sm font-semibold truncate">{profileName || "สมาชิก"}</p>
            <p className="text-slate-500 text-xs truncate mt-0.5">{user.email}</p>
          </div>
          <div className="py-1.5">
            <a
              href="/member"
              className="flex items-center px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              พอร์ทัลสมาชิก
            </a>
            <a
              href="/member/profile"
              className="flex items-center px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              แก้ไขโปรไฟล์
            </a>
          </div>
          <div className="border-t border-white/5 py-1.5">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 text-sm transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
