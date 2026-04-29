import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const bodySchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^0[6-9]\d{8}$/),
  brand: z.string().min(2),
  monthly_gmv: z.string().min(1),
  service: z.string().min(1),
  message: z.string().optional(),
})

type LineSession = {
  userId: string
  displayName: string
  pictureUrl: string
}

function parseSession(cookie: string): LineSession | null {
  try {
    return JSON.parse(cookie)
  } catch {
    return null
  }
}

async function pushLineMessage(text: string) {
  const adminId = process.env.LINE_ADMIN_USER_ID
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN

  if (!adminId || !token) return

  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: adminId,
      messages: [{ type: "text", text }],
    }),
  }).catch(() => {
    // push ล้มเหลวไม่ควร block response
  })
}

function buildMessage(session: LineSession, data: z.infer<typeof bodySchema>): string {
  return [
    "📩 Lead ใหม่จาก NP Create",
    "",
    `👤 ชื่อ: ${data.name}`,
    `🆔 Line: ${session.displayName} (${session.userId})`,
    `📱 เบอร์: ${data.phone}`,
    `🏪 แบรนด์: ${data.brand}`,
    `💰 GMV: ${data.monthly_gmv}`,
    `🎯 บริการ: ${data.service}`,
    data.message ? `💬 ข้อความ: ${data.message}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

export async function POST(req: NextRequest) {
  // ตรวจสอบ Line session
  const sessionCookie = req.cookies.get("line_session")?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const session = parseSession(sessionCookie)
  if (!session) {
    return NextResponse.json({ error: "invalid_session" }, { status: 401 })
  }

  // Validate body
  const raw = await req.json().catch(() => null)
  const result = bodySchema.safeParse(raw)
  if (!result.success) {
    return NextResponse.json(
      { error: "validation_error", details: result.error.flatten() },
      { status: 400 }
    )
  }

  const data = result.data

  // บันทึกลง Supabase (leads table — สร้างใน Phase 4)
  try {
    const supabase = await createClient()
    await supabase.from("leads").insert({
      line_user_id: session.userId,
      display_name: session.displayName,
      picture_url: session.pictureUrl,
      name: data.name,
      phone: data.phone,
      brand: data.brand,
      monthly_gmv: data.monthly_gmv,
      service: data.service,
      message: data.message ?? null,
    })
  } catch {
    // ถ้า DB ยังไม่พร้อม ให้ข้ามไป ไม่ block user
  }

  // Push message หา admin Line OA
  await pushLineMessage(buildMessage(session, data))

  return NextResponse.json({ success: true })
}
