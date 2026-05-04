import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email: string = (body?.email ?? "").trim().toLowerCase()
    if (!email) return NextResponse.json({ exists: false })

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
