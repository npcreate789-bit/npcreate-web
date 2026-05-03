import { Suspense } from "react"
import Link from "next/link"
import { RegisterFlow } from "./_components/RegisterFlow"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0A0808] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl text-white inline-block">
            NP<span className="text-[#DC2626]">Create</span>
          </Link>
          <h1 className="font-display font-bold text-white text-xl mt-4">สมัครสมาชิก</h1>
          <p className="text-slate-400 text-sm mt-1">สมัครด้วยรหัสผ่าน หรือ Gmail OTP</p>
        </div>
        <Suspense>
          <RegisterFlow />
        </Suspense>
        <p className="text-center text-slate-500 text-sm mt-6">
          มีบัญชีแล้ว?{" "}
          <Link href="/member/login" className="text-[#DC2626] hover:text-[#FCA5A5] transition-colors">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}
