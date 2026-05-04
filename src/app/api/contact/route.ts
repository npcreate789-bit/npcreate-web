import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// ─── HTML escape helper (ป้องกัน XSS injection ใน email) ─────────────────────

function e(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// ─── Validation schemas ───────────────────────────────────────────────────────

const VALID_GMV = ["ยังไม่เปิดร้าน", "น้อยกว่า 50K", "50K-200K", "200K-1M", "1M+"] as const

const VALID_SELLER_SERVICE = [
  "ยิงแอด GMV Max",
  "วางกลยุทธ์ TikTok Shop",
  "Content & Creative",
  "ทั้งหมด",
  "ยังไม่แน่ใจ",
] as const

const VALID_AFFILIATE_SERVICE = [
  "คอร์สเรียน TikTok Affiliate",
  "บริการวางแผน Affiliate",
  "สมัครเป็น Affiliate กับ NP Create",
  "ที่ปรึกษา Affiliate",
  "ยังไม่แน่ใจ",
] as const

const lineFields = {
  line_user_id: z.string().max(100).optional(),
  display_name: z.string().max(200).optional(),
}

const sellerSchema = z.object({
  lead_type:   z.literal("seller"),
  name:        z.string().min(2).max(100),
  phone:       z.string().regex(/^0[6-9]\d{8}$/),
  brand:       z.string().min(2).max(200),
  monthly_gmv: z.enum(VALID_GMV),
  service:     z.enum(VALID_SELLER_SERVICE),
  message:     z.string().max(2000).optional(),
  ...lineFields,
})

const affiliateSchema = z.object({
  lead_type:  z.literal("affiliate"),
  name:       z.string().min(2).max(100),
  phone:      z.string().regex(/^0[6-9]\d{8}$/),
  tiktok_url: z.string().max(300).refine(
    (val) => /^https?:\/\//i.test(val),
    "TikTok URL ต้องเป็น https://"
  ).optional().or(z.literal("")),
  service:    z.enum(VALID_AFFILIATE_SERVICE),
  message:    z.string().max(2000).optional(),
  ...lineFields,
})

const bodySchema = z.discriminatedUnion("lead_type", [sellerSchema, affiliateSchema])

type LeadInput = z.infer<typeof bodySchema>

// ─── Admin message builders ───────────────────────────────────────────────────

function buildAdminMessage(data: LeadInput): string {
  if (data.lead_type === "seller") {
    return [
      "📩 Lead Seller ใหม่จาก NP Create",
      `👤 ชื่อ: ${data.name}`,
      `📱 เบอร์: ${data.phone}`,
      data.display_name ? `💚 LINE: ${data.display_name}` : "",
      `🏪 แบรนด์: ${data.brand}`,
      `💰 GMV: ${data.monthly_gmv}`,
      `🎯 บริการ: ${data.service}`,
      data.message ? `💬 หมายเหตุ: ${data.message}` : "",
    ].filter(Boolean).join("\n")
  }
  return [
    "📩 Lead Affiliate/คอร์ส ใหม่จาก NP Create",
    `👤 ชื่อ: ${data.name}`,
    `📱 เบอร์: ${data.phone}`,
    data.display_name ? `💚 LINE: ${data.display_name}` : "",
    data.tiktok_url ? `🎵 TikTok: ${data.tiktok_url}` : "",
    `📚 สนใจ: ${data.service}`,
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

// ─── LINE Messaging API push ──────────────────────────────────────────────────

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
      console.error(`LINE push failed: HTTP ${res.status}`)
      return false
    }
    return true
  } catch (err) {
    console.error("LINE push error:", err)
    return false
  }
}

// ─── Email via Resend (fallback) ──────────────────────────────────────────────

function buildEmailHtml(data: LeadInput): string {
  const isSeller = data.lead_type === "seller"
  const rows = isSeller
    ? [
        ["ประเภท", '<span style="color:#DC2626;font-weight:bold">Seller / Agency</span>'],
        ["ชื่อ", e(data.name)],
        ["เบอร์โทร", e(data.phone)],
        ["แบรนด์", e(data.brand)],
        ["GMV/เดือน", data.monthly_gmv],
        ["บริการที่สนใจ", data.service],
        ...(data.display_name ? [["LINE", `<span style="color:#06C755">${e(data.display_name)}</span>`]] : []),
        ...(data.message ? [["หมายเหตุ", e(data.message)]] : []),
      ]
    : [
        ["ประเภท", '<span style="color:#F59E0B;font-weight:bold">Affiliate / คอร์ส</span>'],
        ["ชื่อ", e(data.name)],
        ["เบอร์โทร", e(data.phone)],
        ...(data.tiktok_url ? [["TikTok", e(data.tiktok_url)]] : []),
        ["สนใจ", data.service],
        ...(data.display_name ? [["LINE", `<span style="color:#06C755">${e(data.display_name)}</span>`]] : []),
        ...(data.message ? [["หมายเหตุ", e(data.message)]] : []),
      ]

  const tableRows = rows.map(([label, value], i) =>
    `<tr${i % 2 === 1 ? ' style="background:#f9f9f9"' : ""}>
      <td style="padding:8px 12px;color:#666;white-space:nowrap">${label}</td>
      <td style="padding:8px 12px;font-weight:500">${value}</td>
    </tr>`
  ).join("")

  return `
    <h2 style="font-family:sans-serif">📩 Lead ใหม่จาก NP Create</h2>
    <table style="border-collapse:collapse;width:100%;max-width:520px;font-family:sans-serif;font-size:14px">
      ${tableRows}
    </table>
  `
}

async function sendEmail(data: LeadInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const to     = process.env.ADMIN_EMAIL
  if (!apiKey || !to) return false

  const typeLabel = data.lead_type === "seller" ? "Seller" : "Affiliate/คอร์ส"
  const subject   = `📩 Lead ${typeLabel}: ${data.name}${data.lead_type === "seller" ? ` — ${data.brand}` : ""}`

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "NP Create <onboarding@resend.dev>",
        to:   [to],
        subject,
        html: buildEmailHtml(data),
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

async function notifyAdmin(data: LeadInput) {
  const adminId  = process.env.LINE_ADMIN_USER_ID
  const sentLine = adminId ? await pushLine(adminId, buildAdminMessage(data)) : false
  if (!sentLine) {
    const sentEmail = await sendEmail(data)
    if (!sentEmail) {
      console.warn("ไม่มีช่องทางแจ้งเตือน admin — ตั้งค่า LINE_ADMIN_USER_ID หรือ RESEND_API_KEY")
    }
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const raw    = await req.json().catch(() => null)
  const result = bodySchema.safeParse(raw)
  if (!result.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 })
  }

  const data = result.data

  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  const memberId = user?.id ?? null

  const supabase = createAdminClient()

  // Rate limit: ไม่เกิน 3 submissions ต่อเบอร์โทรใน 1 ชั่วโมง
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("phone", data.phone)
    .gte("created_at", oneHourAgo)
  if ((recentCount ?? 0) >= 3) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 })
  }

  const insertData = {
    lead_type:    data.lead_type,
    name:         data.name,
    phone:        data.phone,
    service:      data.service,
    message:      data.message ?? null,
    line_user_id: data.line_user_id ?? null,
    display_name: data.display_name ?? null,
    member_id:    memberId,
    brand:        data.lead_type === "seller" ? data.brand : null,
    monthly_gmv:  data.lead_type === "seller" ? data.monthly_gmv : null,
    tiktok_url:   data.lead_type === "affiliate" && data.tiktok_url ? data.tiktok_url : null,
  }

  const { error: dbError } = await supabase.from("leads").insert(insertData)
  if (dbError) {
    console.error("leads insert failed:", dbError.code, dbError.message)
    return NextResponse.json({ error: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 })
  }

  const notifications: Promise<unknown>[] = [notifyAdmin(data)]
  if (data.line_user_id) {
    notifications.push(pushLine(data.line_user_id, buildCustomerMessage(data.name)))
  }
  await Promise.allSettled(notifications)

  // คุกกี้แยกกันตาม lead_type เพื่อ track การ submit แต่ละประเภทแยกกัน
  const cookieName = data.lead_type === "seller" ? "contact_submitted" : "contact_affiliate_submitted"
  const response   = NextResponse.json({ success: true })
  response.cookies.set(cookieName, "1", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 365,
    path:     "/",
  })
  return response
}
