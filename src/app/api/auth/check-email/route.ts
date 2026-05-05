import { type NextRequest, NextResponse } from "next/server"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// In-memory rate limiter: max 10 checks per IP per 60 s
const ipBucket = new Map<string, { count: number; resetAt: number }>()
const RL_MAX    = 10
const RL_WIN_MS = 60_000

function isAllowed(ip: string): boolean {
  const now   = Date.now()
  const entry = ipBucket.get(ip)
  if (!entry || now > entry.resetAt) {
    ipBucket.set(ip, { count: 1, resetAt: now + RL_WIN_MS })
    return true
  }
  if (entry.count >= RL_MAX) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    // ตรวจว่า request มาจากโดเมนเดียวกันเท่านั้น
    const origin  = req.headers.get("origin") ?? ""
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "")
    if (siteUrl && origin !== siteUrl) {
      return NextResponse.json({ exists: false })
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    if (!isAllowed(ip)) {
      return NextResponse.json({ exists: false }, { status: 429 })
    }

    const body = await req.json()
    const email: string = (body?.email ?? "").trim().toLowerCase()
    if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ exists: false })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?filter=${encodeURIComponent(email)}&per_page=1`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    )

    if (!res.ok) return NextResponse.json({ exists: false })

    const json = await res.json()
    const users: Array<{ email?: string }> = json?.users ?? []
    const exists = users.some(u => u.email?.toLowerCase() === email)
    return NextResponse.json({ exists })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
