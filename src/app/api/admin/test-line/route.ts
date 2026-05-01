import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/admin/test-line — ทดสอบ LINE Messaging API (admin เท่านั้น)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const token   = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const adminId = process.env.LINE_ADMIN_USER_ID

  const env = {
    LINE_CHANNEL_ACCESS_TOKEN: token  ? `set (${token.length} chars)` : "❌ ไม่ได้ตั้งค่า",
    LINE_ADMIN_USER_ID:        adminId ? `set → ${adminId}`           : "❌ ว่างเปล่า — นี่คือสาเหตุที่ไม่มีข้อความ",
  }

  if (!token || !adminId) {
    return NextResponse.json({ ok: false, env, hint: "ตั้งค่า env vars ใน Vercel แล้ว Redeploy" })
  }

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: adminId,
        messages: [{ type: "text", text: "🧪 ทดสอบระบบ NP Create — ถ้าเห็นข้อความนี้แปลว่าระบบส่งแจ้งเตือนทำงานปกติ ✅" }],
      }),
    })

    const body = await res.text()
    return NextResponse.json({
      ok:     res.ok,
      status: res.status,
      body:   body || "(empty — แปลว่า success)",
      env,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), env })
  }
}
