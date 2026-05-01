import { type NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hash = createHmac("sha256", secret).update(rawBody).digest("base64")
  return hash === signature
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
    return new NextResponse("ok", { status: 200 }) // ยังคืน 200 เพื่อไม่ให้ LINE retry
  }

  // รองรับ event ในอนาคต (เช่น auto-reply, logging)
  try {
    const { events } = JSON.parse(rawBody) as { events: unknown[] }
    if (events?.length) {
      console.log(`LINE webhook: ${events.length} event(s) received`)
    }
  } catch {}

  return new NextResponse("ok", { status: 200 })
}
