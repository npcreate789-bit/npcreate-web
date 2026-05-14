import type { Metadata } from "next"
import Link from "next/link"
import { Shield, Eye, Settings, Lock, UserMinus, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy — NP Create",
  description:
    "Privacy Policy for NP Create — how we access, use, and protect data shared by users who connect their TikTok account.",
  alternates: { canonical: "https://npcreate.co.th/privacy-policy" },
}

const LAST_UPDATED = "May 14, 2026"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0A0808] pt-24 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div aria-hidden className="absolute top-0 right-0 w-96 h-96 bg-[#06C755]/10 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 left-0 w-72 h-72 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-center gap-2 text-[#06C755] text-sm font-semibold uppercase tracking-widest mb-3">
            <Shield size={14} />
            <span>นโยบายความเป็นส่วนตัว</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm mt-4">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-10">
          <Article
            icon={<Shield size={18} className="text-[#06C755]" />}
            title="1. Our Commitment"
          >
            NP Create respects user privacy and is committed to protecting user
            data.
          </Article>

          <Article
            icon={<Eye size={18} className="text-[#DC2626]" />}
            title="2. Information We Access"
          >
            When users connect their TikTok account through TikTok Login, NP
            Create may access only the information that the user authorizes,
            such as display name, avatar, username, profile link, follower
            count, following count, total likes, video count, and public video
            information.
          </Article>

          <Article
            icon={<Settings size={18} className="text-[#F59E0B]" />}
            title="3. How We Use Information"
          >
            We use this information to display account data in the NP Create
            Dashboard, support creator screening, campaign planning, TikTok
            Shop workflow management, and marketing analysis.
          </Article>

          <Article
            icon={<Lock size={18} className="text-emerald-400" />}
            title="4. What We Do Not Do"
          >
            NP Create does not collect TikTok passwords, does not post content
            without permission, and does not sell user data to third parties.
          </Article>

          <Article
            icon={<UserMinus size={18} className="text-[#FCA5A5]" />}
            title="5. Your Rights"
          >
            Users may request data removal or account disconnection by
            contacting us.
          </Article>

          {/* Contact card */}
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#06C755]/10 border border-[#06C755]/20 flex items-center justify-center">
                <Mail size={16} className="text-[#06C755]" />
              </div>
              <h2 className="font-display font-bold text-white text-lg">Contact</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              For questions regarding this Privacy Policy or to request data
              removal, please contact:
            </p>
            <dl className="space-y-2 text-sm">
              <ContactRow label="Company" value="NP Create" />
              <ContactRow
                label="Email"
                value={
                  <a href="mailto:npcreate789@gmail.com"
                    className="text-[#F59E0B] hover:text-[#FCD34D] transition-colors underline-offset-4 hover:underline">
                    npcreate789@gmail.com
                  </a>
                }
              />
              <ContactRow
                label="Website"
                value={
                  <Link href="/" className="text-[#F59E0B] hover:text-[#FCD34D] transition-colors underline-offset-4 hover:underline">
                    https://npcreate.co.th
                  </Link>
                }
              />
            </dl>
          </div>
        </div>
      </section>
    </main>
  )
}

function Article({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <article className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h2 className="font-display font-bold text-white text-lg sm:text-xl leading-tight">{title}</h2>
      </div>
      <p className="text-slate-300 text-[15px] leading-relaxed pl-12">{children}</p>
    </article>
  )
}

function ContactRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="text-slate-500 text-xs uppercase tracking-wider font-medium w-20 shrink-0 pt-0.5">{label}</dt>
      <dd className="text-slate-200 flex-1 min-w-0 break-words">{value}</dd>
    </div>
  )
}
