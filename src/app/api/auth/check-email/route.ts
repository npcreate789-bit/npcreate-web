import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email: string = (body?.email ?? "").trim().toLowerCase()
    if (!email) return NextResponse.json({ exists: false })

    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
    if (error) return NextResponse.json({ exists: false })

    const exists = data?.users?.some(u => u.email?.toLowerCase() === email) ?? false
    return NextResponse.json({ exists })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
