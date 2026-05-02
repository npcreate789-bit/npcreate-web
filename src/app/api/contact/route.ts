import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const VALID_GMV     = ["ยังไม่เปิดร้าน", "น้อยกว่า 50K", "50K-200K", "200K-1M", "1M+"] as const
const VALID_SERVICE = ["ยิงแอด GMV Max", "วางกลยุทธ์ TikTok Shop", "Content & Creative", "ทั้งหมด", "ยังไม่แน่ใจ"] as const

const bodySchema = z.object({
  name:          z.string().min(2).max(100),
  phone:         z.string().regex(/^0[6-9]\d{8}$/),
  brand:         z.string().min(2).max(200),
  monthly_gmv:   z.enum(VALID_GMV),
  service:       z.enum(VALID_SERVICE),
  message:       z.string().max(2000).optional(),
  line_user_id:  z.string().max(100).optional(),
  display_name:  z.string().max(200).optional(),
})

type Lead = z.infer<typeof bodySchema>

function buildAdminMessage(data: Lead): string {
  return [
    "📩 Lead ใหม่จาก NP Create",
    `👤 ชื่อ: ${data.name}`,
    `📱 เบอร์: ${data.phone}`,
    data.display_name ? `💚 LINE: ${data.display_name}` : "",
    `🏪 แบรนด์: ${data.brand}`,
    `💰 GMV: ${data.monthly_gmv}`,
    `🎯 บริการ: ${data.service}`,
    data.message ? `💬 หมายเหตุ: ${data.message}` : "",
  ].filter(Boolean).join("\n")
}

function buildCustomerMessage(name: string): string {
  return [
    `สวัสดีครับ คุณ${name} 🙏`,
    "",
    "ทีมงาน NP Create ได้รับข้อมูลของคุณแล้วครับ",
    "เราจะติดต่อกลับภายใน 1 ชั่วโมง ในเวลาทำการ 9:00–20:00 น.",
    "",
    "ขอบคุณที่สนใจบริการของเรานะครับ 😊",
  ].join("\n")
}

// ── LINE Messaging API push ─────────────────────────────────────────────────
async function pushLine(to: string, text: string): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token || !to) return false
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
    })
    if (!res.ok) {
      console.error(`LINE push to ${to.slice(0, 6)}... failed: HTTP ${res.status}`)
      return false
    }
    return true
  } catch (err) {
    console.error("LINE push error:", err)
    return false
  }
}

// ── Email via Resend (fallback when admin LINE push fails) ──────────────────
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
      ${data.line_user_id ? `<tr style="background:#f9f9f9"><td style="padding:8px;color:#666">LINE</td><td style="padding:8px;color:#06C755;font-weight:bold">${data.display_name ?? ""} (${data.line_user_id})</td></tr>` : ""}
      ${data.message ? `<tr><td style="padding:8px;color:#666">หมายเหตุ</td><td style="padding:8px">${data.message}</td></tr>` : ""}
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
        from:    "NP Create <onboarding@resend.dev>",
        to:      [to],
        subject: `📩 Lead ใหม่: ${data.name} — ${data.brand}`,
        html,
      }),
    })
    if (!res.ok) {
      console.error(`Resend failed: HTTP ${res.status}`)
      return false
    }
    return true
  } catch (err) {
    console.error("Resend error:", err)
    return false
  }
}

async function notifyAdmin(data: Lead) {
  const adminId = process.env.LINE_ADMIN_USER_ID
  const sentLine = adminId ? await pushLine(adminId, buildAdminMessage(data)) : false
  if (!sentLine) {
    const sentEmail = await sendEmail(data)
    if (!sentEmail) {
      console.warn("ไม่มีช่องทางแจ้งเตือน admin — ตั้งค่า LINE_ADMIN_USER_ID หรือ RESEND_API_KEY ใน Vercel")
    }
  }
}

// ── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null)
  const result = bodySchema.safeParse(raw)
  if (!result.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 })
  }

  const data = result.data

  const supabase = await createClient()

  // ── 1. Insert core data ──────────────────────────────────────────────────────
  // ไม่ใส่ member_id ใน insert หลัก เพราะ column นี้เพิ่มโดย migration แยก
  // และ anon role ไม่มี SELECT policy บน leads → .select().single() จะ fail
  const { error: dbError } = await supabase.from("leads").insert({
    name:         data.name,
    phone:        data.phone,
    brand:        data.brand,
    monthly_gmv:  data.monthly_gmv,
    service:      data.service,
    message:      data.message ?? null,
    line_user_id: data.line_user_id ?? null,
    display_name: data.display_name ?? null,
  })

  if (dbError) {
    console.error("leads insert failed:", dbError.code, dbError.message, dbError.details)
    return NextResponse.json({ error: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 })
  }

  // ── 2. แจ้ง admin + แจ้ง customer พร้อมกัน (ไม่ block หากล้มเหลว) ──
  const notifications: Promise<unknown>[] = [notifyAdmin(data)]
  if (data.line_user_id) {
    notifications.push(pushLine(data.line_user_id, buildCustomerMessage(data.name)))
  }
  await Promise.allSettled(notifications)

  // ── 3. Set cookie + return ──
  const response = NextResponse.json({ success: true })
  response.cookies.set("contact_submitted", "1", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 365,
    path:     "/",
  })
  return response
}
