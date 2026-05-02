import { type NextRequest, NextResponse } from "next/server"

export function GET(req: NextRequest) {
  const returnTo   = req.nextUrl.searchParams.get("returnTo") ?? ""
  const mode       = req.nextUrl.searchParams.get("mode") ?? ""
  const safeReturn = returnTo && /^\/[^/]/.test(returnTo) ? returnTo : ""

  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    response_type: "code",
    client_id:     process.env.LINE_LOGIN_CLIENT_ID!,
    redirect_uri:  process.env.LINE_LOGIN_REDIRECT_URI!,
    state,
    scope:         "profile openid",
  })

  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?${params}`

  const cookieOpts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge:   60 * 10,
    path:     "/",
  }

  const res = NextResponse.redirect(authUrl)
  res.cookies.set("line_state", state, cookieOpts)
  if (safeReturn)        res.cookies.set("line_return_to", safeReturn, cookieOpts)
  if (mode === "member") res.cookies.set("line_mode", "member", cookieOpts)

  return res
}
