"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

const navLinks = [
  { label: "ผลงาน", href: "/portfolio" },
  { label: "บริการ", href: "/services" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "ติดต่อ", href: "/contact" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [profileName, setProfileName] = useState("")
  const [userCode, setUserCode] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      if (data.user) {
        supabase.from("profiles").select("full_name,user_code,avatar_url").eq("id", data.user.id).maybeSingle()
          .then(({ data: p }) => {
            if (p) { setProfileName(p.full_name); setUserCode(p.user_code); setAvatarUrl(p.avatar_url) }
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0808]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-xl text-white tracking-tight">
          NP<span className="text-[#DC2626]">Create</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm text-slate-300 hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
          <NavAuth user={user} profileName={profileName} userCode={userCode} avatarUrl={avatarUrl} onLogout={handleLogout} />
        </nav>

        <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0A0808] border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-slate-300 hover:text-white text-sm transition-colors"
              onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}

          {/* Mobile auth section */}
          {user === undefined ? (
            <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
          ) : user ? (
            <>
              <div className="border-t border-white/5 pt-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20 overflow-hidden flex items-center justify-center shrink-0">
                  {avatarUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={avatarUrl} alt={profileName} className="w-full h-full object-cover" />
                    : <span className="text-[#FCA5A5] text-xs font-bold">
                        {profileName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
                      </span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{profileName || "สมาชิก"}</p>
                  {userCode && <p className="text-[#F59E0B] text-xs font-mono font-bold">{userCode}</p>}
                </div>
              </div>
              <a href="/member" className="text-slate-300 hover:text-white text-sm transition-colors" onClick={() => setOpen(false)}>
                พอร์ทัลสมาชิก
              </a>
              <a href="/member/profile" className="text-slate-300 hover:text-white text-sm transition-colors" onClick={() => setOpen(false)}>
                แก้ไขโปรไฟล์
              </a>
              <button onClick={handleLogout}
                className="text-left text-red-400 hover:text-red-300 text-sm transition-colors">
                ออกจากระบบ
              </button>
            </>
          ) : (
            <a href="/member/login"
              className="text-slate-300 hover:text-white text-sm transition-colors"
              onClick={() => setOpen(false)}>
              เข้าสู่ระบบ / สมาชิก
            </a>
          )}
        </div>
      )}
    </header>
  )
}

function NavAuth({
  user,
  profileName,
  userCode,
  avatarUrl,
  onLogout,
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
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (user === undefined) return <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />

  if (!user) {
    return (
      <a href="/member/login"
        className="text-sm text-slate-300 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
        เข้าสู่ระบบ
      </a>
    )
  }

  const initials = profileName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-full bg-[#DC2626]/20 border border-[#DC2626]/30 flex items-center justify-center text-[#FCA5A5] text-xs font-bold overflow-hidden">
          {avatarUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={avatarUrl} alt={profileName} className="w-full h-full object-cover" />
            : initials
          }
        </div>
        {userCode && <span className="hidden sm:block text-[#F59E0B] text-xs font-mono font-bold">{userCode}</span>}
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#1C0D0D] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-white text-sm font-medium truncate">{profileName || "สมาชิก"}</p>
            <p className="text-slate-500 text-xs truncate">{user.email}</p>
          </div>
          <a href="/member" className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
            พอร์ทัลสมาชิก
          </a>
          <a href="/member/profile" className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
            แก้ไขโปรไฟล์
          </a>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 text-sm transition-colors border-t border-white/5">
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  )
}
