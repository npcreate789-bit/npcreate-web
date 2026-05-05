import { type NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { pushLineMessage } from "@/lib/line/messaging"

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hash = createHmac("sha256", secret).update(rawBody).digest("base64")
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
  } catch {
    return false
  }
}

type LineEvent = {
  type:       string
  replyToken: string
  source:     { type: string; userId: string }
  message?:   { type: string; text: string }
}

// สร้าง magic link สำหรับ LINE user แล้วส่งกลับใน LINE chat
async function handleLoginCommand(lineUserId: string) {
  const base        = process.env.NEXT_PUBLIC_SITE_URL!
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  if (!serviceKey.startsWith("eyJ")) {
    await pushLineMessage(lineUserId, "ระบบยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแล")
    return
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("line_user_id", lineUserId)
    .maybeSingle()

  if (!profile) {
    await pushLineMessage(
      lineUserId,
      `ยังไม่พบบัญชีสมาชิกที่เชื่อม LINE นี้\n\nสมัครสมาชิกได้ที่:\n${base}/register\n\nหรือถ้ามีบัญชีแล้ว เข้าสู่ระบบแล้วเชื่อม LINE ได้ที่:\n${base}/member/profile`
    )
    return
  }

  const virtualEmail = `${lineUserId.toLowerCase()}@line.npcreate.co.th`
  const { data: linkData, error } = await admin.auth.admin.generateLink({
    type:    "magiclink",
    email:   virtualEmail,
    options: { redirectTo: `${base}/member` },
  })

  if (error || !linkData?.properties?.hashed_token) {
    await pushLineMessage(lineUserId, "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    return
  }

  const confirmUrl = new URL(`${base}/api/auth/confirm`)
  confirmUrl.searchParams.set("token_hash", linkData.properties.hashed_token)
  confirmUrl.searchParams.set("type", "magiclink")
  confirmUrl.searchParams.set("next", "/member")

  await pushLineMessage(
    lineUserId,
    `🔐 ลิงก์เข้าสู่ระบบ NP Create\n\nแตะลิงก์นี้เพื่อเข้าสู่ระบบ:\n${confirmUrl.toString()}\n\n⏱ ลิงก์ใช้ได้ภายใน 15 นาที`
  )
}

// LINE Platform ต้องการ 200 เสมอ ไม่งั้น retry ซ้ำและแสดง error ใน console
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-line-signature") ?? ""
  const secret    = process.env.LINE_MESSAGING_CHANNEL_SECRET ?? ""

  if (!secret) {
    console.error("LINE_MESSAGING_CHANNEL_SECRET not set")
    return new NextResponse("ok", { status: 200 })
  }

  const rawBody = await req.text()

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn("LINE webhook: invalid signature")
    return new NextResponse("ok", { status: 200 })
  }

  try {
    const { events } = JSON.parse(rawBody) as { events: LineEvent[] }
    if (!events?.length) return new NextResponse("ok", { status: 200 })

    for (const event of events) {
      if (
        event.type === "message" &&
        event.message?.type === "text" &&
        event.source?.userId
      ) {
        const text = event.message.text.trim().toLowerCase()
        if (text === "login" || text === "เข้าสู่ระบบ" || text === "login ") {
          // ไม่ await เพื่อให้คืน 200 เร็ว — LINE timeout 30s
          handleLoginCommand(event.source.userId).catch(console.error)
        }
      }
    }
  } catch (e) {
    console.error("LINE webhook parse error:", e)
  }

  return new NextResponse("ok", { status: 200 })
}
