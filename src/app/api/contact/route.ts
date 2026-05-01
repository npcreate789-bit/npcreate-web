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

function buildMessage(data: z.infer<typeof bodySchema>): string {
  return [
    "\n📩 Lead ใหม่จาก NP Create",
    `👤 ชื่อ: ${data.name}`,
    `📱 เบอร์: ${data.phone}`,
    `🏪 แบรนด์: ${data.brand}`,
    `💰 GMV: ${data.monthly_gmv}`,
    `🎯 บริการ: ${data.service}`,
    data.message ? `💬 หมายเหตุ: ${data.message}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

// ── LINE Notify (วิธีหลัก) ──────────────────────────────────────────────────
// ตั้งค่า: notify-bot.line.me → My page → Generate token → ตั้งชื่อ → copy
// วาง token ใน Vercel env var: LINE_NOTIFY_TOKEN
async function sendLineNotify(text: string): Promise<boolean> {
  const token = process.env.LINE_NOTIFY_TOKEN
  if (!token) return false

  try {
    const res = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: new URLSearchParams({ message: text }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`LINE Notify failed: HTTP ${res.status}`, body)
      return false
    }
    return true
  } catch (err) {
    console.error("LINE Notify network error:", err)
    return false
  }
}

// ── LINE Messaging API push (วิธีสำรอง) ────────────────────────────────────
// ต้องการ: LINE_CHANNEL_ACCESS_TOKEN + LINE_ADMIN_USER_ID
// LINE_ADMIN_USER_ID หาได้จาก webhook event ของ bot เมื่อ admin ทักก่อน
async function sendLineMessagingPush(text: string): Promise<boolean> {
  const adminId = process.env.LINE_ADMIN_USER_ID
  const token   = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!adminId || !token) return false

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: adminId,
        messages: [{ type: "text", text }],
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`LINE Messaging push failed: HTTP ${res.status}`, body)
      return false
    }
    return true
  } catch (err) {
    console.error("LINE Messaging push network error:", err)
    return false
  }
}

async function notifyAdmin(text: string) {
  // ลอง LINE Notify ก่อน ถ้าไม่มี token ให้ลอง Messaging API
  const ok = await sendLineNotify(text)
  if (!ok) {
    const ok2 = await sendLineMessagingPush(text)
    if (!ok2) {
      console.warn("No LINE notification sent — set LINE_NOTIFY_TOKEN in Vercel env vars")
    }
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null)
  const result = bodySchema.safeParse(raw)
  if (!result.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 })
  }

  const data = result.data
  const message = buildMessage(data)

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

  // แจ้งเตือน admin — ไม่ block response ถ้า LINE ล้มเหลว
  notifyAdmin(message).catch((err) => console.error("notifyAdmin error:", err))

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
