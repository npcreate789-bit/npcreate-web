import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MemberLoginFlow } from "./_components/MemberLoginFlow"

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state:       "ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาลองใหม่",
  token_failed:        "เชื่อมต่อ LINE ไม่สำเร็จ กรุณาลองใหม่",
  profile_failed:      "ดึงข้อมูล LINE ไม่สำเร็จ กรุณาลองใหม่",
  create_user_failed:  "สร้างบัญชีไม่สำเร็จ กรุณาติดต่อผู้ดูแลระบบ",
  link_failed:         "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่",
  server_config_error: "ระบบยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
  invalid_link:        "ลิงก์หมดอายุ กรุณาเข้าสู่ระบบใหม่",
}

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { next, error } = await searchParams

  if (user) {
    const safePath = next && /^\/[^/]/.test(next) ? next : "/member"
    redirect(safePath)
  }

  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "เกิดข้อผิดพลาด กรุณาลองใหม่") : null

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

        {errorMessage && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
            {errorMessage}
          </div>
        )}

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
