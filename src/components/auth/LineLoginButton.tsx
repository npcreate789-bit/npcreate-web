"use client"

import { LineIcon } from "@/components/auth/LineIcon"

interface Props {
  label?:    string
  next?:     string
  returnTo?: string
}

export function LineLoginButton({
  label    = "เข้าสู่ระบบด้วย LINE",
  next,
  returnTo,
}: Props) {
  const dest = returnTo ?? next ?? "/member"
  const href = `/api/auth/line?mode=member&returnTo=${encodeURIComponent(dest)}`

  return (
    <a
      href={href}
      className="w-full flex items-center justify-center gap-2.5 bg-[#06C755] hover:bg-[#05a847] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
    >
      <LineIcon size={18} />
      {label}
    </a>
  )
}
