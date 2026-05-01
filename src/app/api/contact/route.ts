import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const VALID_GMV     = ["ยังไม่เปิดร้าน", "น้อยกว่า 50K", "50K-200K", "200K-1M", "1M+"] as const
const VALID_SERVICE = ["ยิงแอด GMV Max", "วางกลยุทธ์ TikTok Shop", "Content & Creative", "ทั้งหมด", "ยังไม่แน่ใจ"] as const

const bodySchema = z.object({
  name:        z.string().min(2).max(100),
  phone:       z.string().regex(/^0[6-9]\d{8}$/),
  brand:       z.string().min(2).max(200),
  monthly_gmv: z.enum(VALID_GMV),
  service:     z.enum(VALID_SERVICE),
  message:     z.string().max(2000).optional(),
})

async function pushLineMessage(text: string) {
  const adminId = process.env.LINE_ADMIN_USER_ID
  const token   = process.env.LINE_CHANNEL_ACCESS_TOKEN

  if (!adminId || !token) {
    console.warn("LINE_ADMIN_USER_ID or LINE_CHANNEL_ACCESS_TOKEN not set — skipping push")
    return
  }

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
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.text()
      console.error(`LINE push failed: HTTP ${res.status}`, body)
    }
  }).catch((err) => {
    console.error("LINE push network error:", err)
  })
}

function buildMessage(data: z.infer<typeof bodySchema>): string {
  return [
    "📩 Lead ใหม่จาก NP Create",
    "",
    `👤 ชื่อ: ${data.name}`,
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
  const raw = await req.json().catch(() => null)
  const result = bodySchema.safeParse(raw)
  if (!result.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 })
  }

  const data = result.data

  // บันทึกลง Supabase
  try {
    const supabase = await createClient()
    const { error: dbError } = await supabase.from("leads").insert({
      name:        data.name,
      phone:       data.phone,
      brand:       data.brand,
      monthly_gmv: data.monthly_gmv,
      service:     data.service,
      message:     data.message ?? null,
    })
    if (dbError) console.error("leads insert failed:", dbError)
  } catch (err) {
    console.error("leads insert exception:", err)
  }

  // แจ้งเตือน admin ผ่าน LINE push
  await pushLineMessage(buildMessage(data))

  const response = NextResponse.json({ success: true })
  response.cookies.set("contact_submitted", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  })
  return response
}
