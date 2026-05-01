import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { mergeSiteInfo } from "@/lib/data/site-info"

const navLinks = [
  { label: "ผลงาน",       href: "/portfolio" },
  { label: "บริการ",       href: "/services" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "ติดต่อ",       href: "/contact" },
]

export async function Footer({ lineHref = "/api/auth/line" }: { lineHref?: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "site_info")
    .maybeSingle()

  const info = mergeSiteInfo((data?.value ?? {}) as Record<string, unknown>)

  return (
    <footer className="bg-[#0A0404] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">

          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="font-display font-bold text-xl text-white">
              NP<span className="text-[#DC2626]">Create</span>
            </Link>
            {info.tagline && (
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">{info.tagline}</p>
            )}

            <div className="flex flex-col gap-2 mt-4">
              {info.line_oa_id && (
                <a
                  href={lineHref}
                  className="inline-flex items-center gap-1.5 text-[#06C755] hover:text-[#05a847] text-sm font-medium transition-colors"
                >
                  <LineIcon />
                  Line OA: {info.line_oa_id}
                </a>
              )}
              {info.phone && (
                <a href={`tel:${info.phone}`} className="text-slate-400 hover:text-white text-sm transition-colors">
                  📞 {info.phone}
                </a>
              )}
              {info.email && (
                <a href={`mailto:${info.email}`} className="text-slate-400 hover:text-white text-sm transition-colors">
                  ✉️ {info.email}
                </a>
              )}
            </div>

            {/* Social links */}
            {(info.facebook_url || info.tiktok_url || info.instagram_url || info.youtube_url) && (
              <div className="flex items-center gap-3 mt-4">
                {info.facebook_url && (
                  <SocialLink href={info.facebook_url} label="Facebook">
                    <FacebookIcon />
                  </SocialLink>
                )}
                {info.tiktok_url && (
                  <SocialLink href={info.tiktok_url} label="TikTok">
                    <TikTokIcon />
                  </SocialLink>
                )}
                {info.instagram_url && (
                  <SocialLink href={info.instagram_url} label="Instagram">
                    <InstagramIcon />
                  </SocialLink>
                )}
                {info.youtube_url && (
                  <SocialLink href={info.youtube_url} label="YouTube">
                    <YouTubeIcon />
                  </SocialLink>
                )}
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="text-slate-400 hover:text-white text-sm transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} {info.site_name}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-white"
    >
      {children}
    </a>
  )
}

function LineIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}
