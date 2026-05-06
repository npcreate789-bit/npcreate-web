"use client"

export default function EditPortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-5 max-w-lg text-center space-y-3">
        <p className="text-red-400 font-semibold text-base">ไม่สามารถโหลดหน้าแก้ไขได้</p>
        <p className="text-slate-400 text-sm">{error.message}</p>
        {error.digest && (
          <p className="text-slate-600 text-xs font-mono">digest: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center pt-1">
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            ลองอีกครั้ง
          </button>
          <a
            href="/admin/portfolios"
            className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white text-sm font-semibold rounded-xl transition-colors"
          >
            กลับไปรายการ
          </a>
        </div>
      </div>
    </div>
  )
}
