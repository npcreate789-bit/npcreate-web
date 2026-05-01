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

type Lead = z.infer<typeof bodySchema>

function buildTextMessage(data: Lead): string {
  return [
    "📩 Lead ใหม่จาก NP Create",
    `👤 ชื่อ: ${data.name}`,
    `📱 เบอร์: ${data.phone}`,
    `🏪 แบรนด์: ${data.brand}`,
    `💰 GMV: ${data.monthly_gmv}`,
    `🎯 บริการ: ${data.service}`,
    data.message ? `💬 หมายเหตุ: ${data.message}` : "",
  ].filter(Boolean).join("\n")
}

// ── 1. LINE Messaging API push ──────────────────────────────────────────────
// ต้องการ env vars:
//   LINE_CHANNEL_ACCESS_TOKEN  — จาก LINE Developers → Messaging API channel
//   LINE_ADMIN_USER_ID         — UID ของ admin (U…) หาได้จาก LINE Developers
//                                → Basic settings → "Your user ID"
//                                (admin ต้องเพิ่มบอทเป็นเพื่อนก่อน)
async function sendLineMessaging(text: string): Promise<boolean> {
  const token   = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const adminId = process.env.LINE_ADMIN_USER_ID
  if (!token || !adminId) return false

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
      console.error(`LINE push failed: HTTP ${res.status}`, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error("LINE push error:", err)
    return false
  }
}

// ── 2. Email via Resend (fallback) ──────────────────────────────────────────
// ต้องการ env vars:
//   RESEND_API_KEY  — จาก resend.com → API Keys
//   ADMIN_EMAIL     — email ที่ต้องการรับแจ้งเตือน
async function sendEmail(data: Lead): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const to     = process.env.ADMIN_EMAIL
  if (!apiKey || !to) return false

  const html = `
    <h2>📩 Lead ใหม่จาก NP Create</h2>
    <table style="border-collapse:collapse;width:100%;max-width:500px">
      <tr><td style="padding:8px;color:#666">ชื่อ</td><td style="padding:8px;font-weight:bold">${data.name}</td></tr>
      <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">เบอร์โทร</td><td style="padding:8px;font-weight:bold">${data.phone}</td></tr>
      <tr><td style="padding:8px;color:#666">แบรนด์</td><td style="padding:8px;font-weight:bold">${data.brand}</td></tr>
      <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">GMV/เดือน</td><td style="padding:8px">${data.monthly_gmv}</td></tr>
      <tr><td style="padding:8px;color:#666">บริการที่สนใจ</td><td style="padding:8px">${data.service}</td></tr>
      ${data.message ? `<tr style="background:#f9f9f9"><td style="padding:8px;color:#666">หมายเหตุ</td><td style="padding:8px">${data.message}</td></tr>` : ""}
    </table>
  `

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "NP Create <onboarding@resend.dev>",
        to: [to],
        subject: `📩 Lead ใหม่: ${data.name} — ${data.brand}`,
        html,
      }),
    })
    if (!res.ok) {
      console.error(`Resend failed: HTTP ${res.status}`, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error("Resend error:", err)
    return false
  }
}

async function notifyAdmin(data: Lead) {
  const text = buildTextMessage(data)
  const sentLine = await sendLineMessaging(text)
  if (!sentLine) {
    const sentEmail = await sendEmail(data)
    if (!sentEmail) {
      console.warn(
        "ไม่มีช่องทางแจ้งเตือน — ตั้งค่า LINE_CHANNEL_ACCESS_TOKEN+LINE_ADMIN_USER_ID หรือ RESEND_API_KEY+ADMIN_EMAIL ใน Vercel"
      )
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

  // แจ้งเตือน admin — ไม่ block response ถ้า notification ล้มเหลว
  notifyAdmin(data).catch((err) => console.error("notifyAdmin uncaught:", err))

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
