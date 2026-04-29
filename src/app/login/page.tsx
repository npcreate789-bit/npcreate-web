import { Suspense } from "react"
import { LoginForm } from "./LoginForm"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display font-bold text-2xl text-white">
            NP<span className="text-[#6366F1]">Create</span>
          </span>
          <p className="text-slate-400 text-sm mt-2">Admin Panel</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
