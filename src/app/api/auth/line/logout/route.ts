import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SITE_URL!
  const res = NextResponse.redirect(`${base}/contact`)
  res.cookies.delete("line_session")
  return res
}
