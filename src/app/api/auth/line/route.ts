import { NextResponse } from "next/server"

export function GET() {
  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINE_LOGIN_CLIENT_ID!,
    redirect_uri: process.env.LINE_LOGIN_REDIRECT_URI!,
    state,
    scope: "profile openid",
  })

  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?${params}`

  const res = NextResponse.redirect(authUrl)
  res.cookies.set("line_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 นาที
    path: "/",
  })

  return res
}
