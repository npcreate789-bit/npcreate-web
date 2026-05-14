import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Shield, Lock, UserCheck, Mail, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service — NP Create",
  description:
    "Terms of Service for NP Create — marketing, advertising, creator management, and TikTok account connection services for brands, sellers, and creators.",
  alternates: { canonical: "https://npcreate.co.th/terms-of-service" },
}

const LAST_UPDATED = "May 14, 2026"

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#0A0808] pt-24 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div aria-hidden className="absolute top-0 right-0 w-96 h-96 bg-[#DC2626]/10 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 left-0 w-72 h-72 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-center gap-2 text-[#DC2626] text-sm font-semibold uppercase tracking-widest mb-3">
            <FileText size={14} />
            <span>ข้อกำหนดการใช้บริการ</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight">
            Terms of Service
          </h1>
          <p className="text-slate-500 text-sm mt-4">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-10">
          <Article
            icon={<Globe size={18} className="text-[#DC2626]" />}
            title="1. Our Services"
          >
            NP Create provides marketing, advertising, creator management, TikTok
            account connection, and dashboard services for brands, sellers, and
            creators.
          </Article>

          <Article
            icon={<Shield size={18} className="text-[#06C755]" />}
            title="2. Data Access via TikTok"
          >
            By using our services, users agree to allow NP Create to access only
            the data they authorize through TikTok Login or related platform
            permissions.
          </Article>

          <Article
            icon={<Lock size={18} className="text-emerald-400" />}
            title="3. What We Do Not Do"
          >
            We do not collect TikTok passwords, do not post content without
            permission, and do not sell user data to third parties.
          </Article>

          <Article
            icon={<UserCheck size={18} className="text-[#F59E0B]" />}
            title="4. User Responsibility"
          >
            Users are responsible for ensuring that the account information they
            connect is accurate and authorized.
          </Article>

          {/* Contact card */}
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 flex items-center justify-center">
                <Mail size={16} className="text-[#DC2626]" />
              </div>
              <h2 className="font-display font-bold text-white text-lg">Contact</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              For questions regarding these Terms of Service, please contact:
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
