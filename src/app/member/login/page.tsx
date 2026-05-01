import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MemberLoginFlow } from "./_components/MemberLoginFlow"

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { next } = await searchParams
    // Validate next to prevent open redirect — only allow relative paths
    const safePath = next && /^\/[^/]/.test(next) ? next : "/member"
    redirect(safePath)
  }

  return (
    <div className="min-h-screen bg-[#0A0808] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl text-white inline-block">
            NP<span className="text-[#DC2626]">Create</span>
          </Link>
          <h1 className="font-display font-bold text-white text-xl mt-4">เข้าสู่ระบบสมาชิก</h1>
          <p className="text-slate-400 text-sm mt-1">เข้าสู่ระบบด้วยรหัสผ่าน หรือ Gmail OTP</p>
        </div>
        <Suspense>
          <MemberLoginFlow />
        </Suspense>
        <p className="text-center text-slate-500 text-sm mt-6">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-[#DC2626] hover:text-[#FCA5A5] transition-colors">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  )
}
