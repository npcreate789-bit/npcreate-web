import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const bodySchema = z.object({
  line_user_id: z.string(),
  message:      z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  // 1. verify admin auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 2. parse body
  const raw = await req.json().catch(() => null)
  const result = bodySchema.safeParse(raw)
  if (!result.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 })

  // 3. send LINE push
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: "LINE not configured" }, { status: 503 })

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      to: result.data.line_user_id,
      messages: [{ type: "text", text: result.data.message }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    return NextResponse.json({ error: `LINE API error: ${res.status}`, detail: body }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
