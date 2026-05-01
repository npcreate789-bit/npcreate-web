"use client"

import { useTransition } from "react"
import { unlinkLine } from "../actions"

interface Props {
  lineUserId:      string | null
  lineDisplayName: string | null
}

export function LineSection({ lineUserId, lineDisplayName }: Props) {
  const [pending, startTransition] = useTransition()

  const handleUnlink = () => {
    if (!confirm("ยืนยันการยกเลิกการเชื่อมต่อ LINE?")) return
    startTransition(() => unlinkLine())
  }

  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-white font-semibold text-base">เชื่อมต่อ LINE</h2>
        <p className="text-slate-500 text-xs mt-0.5">
          ให้ทีมงานติดต่อกลับทาง LINE ได้โดยตรง
        </p>
      </div>

      {lineUserId ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#06C755]/20 flex items-center justify-center flex-shrink-0">
              <LineIcon size={18} className="text-[#06C755]" />
            </div>
            <div>
              <p className="text-[#06C755] text-sm font-semibold">{lineDisplayName ?? "LINE"}</p>
              <p className="text-[#06C755]/60 text-xs">เชื่อมต่อแล้ว ✓</p>
            </div>
          </div>
          <button
            onClick={handleUnlink}
            disabled={pending}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            {pending ? "กำลังยกเลิก..." : "ยกเลิกการเชื่อมต่อ"}
          </button>
        </div>
      ) : (
        <a
          href="/api/auth/line?returnTo=/member/profile"
          className="flex items-center justify-center gap-2.5 w-full bg-[#06C755]/10 hover:bg-[#06C755]/20 border border-[#06C755]/30 text-[#06C755] text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
        >
          <LineIcon size={18} className="text-[#06C755]" />
          เชื่อมต่อ LINE
        </a>
      )}
    </div>
  )
}

function LineIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}
