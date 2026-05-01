import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SITE_URL!
  const devBase = process.env.NODE_ENV === "development" ? "http://localhost:3000" : null
  const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? ""
  const allowed = origin.startsWith(base) || (devBase !== null && origin.startsWith(devBase))
  if (!allowed) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const res = NextResponse.redirect(`${base}/contact`)
  res.cookies.delete("line_session")
  return res
}
