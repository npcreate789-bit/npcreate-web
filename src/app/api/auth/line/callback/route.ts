import { type NextRequest, NextResponse } from "next/server"

type LineTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  error?: string
}

type LineProfile = {
  userId: string
  displayName: string
  pictureUrl: string
}

function redirectWithError(base: string, error: string) {
  return NextResponse.redirect(`${base}/contact?error=${error}`)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const storedState = req.cookies.get("line_state")?.value
  const base = process.env.NEXT_PUBLIC_SITE_URL!

  // CSRF state validation
  if (!state || !storedState || state !== storedState) {
    return redirectWithError(base, "invalid_state")
  }

  if (!code) {
    return redirectWithError(base, "no_code")
  }

  try {
    // Exchange code → access token
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINE_LOGIN_REDIRECT_URI!,
        client_id: process.env.LINE_LOGIN_CLIENT_ID!,
        client_secret: process.env.LINE_LOGIN_CLIENT_SECRET!,
      }),
    })

    const tokenData: LineTokenResponse = await tokenRes.json()

    if (!tokenRes.ok || tokenData.error) {
      return redirectWithError(base, "token_failed")
    }

    // Get Line profile
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const profile: LineProfile = await profileRes.json()

    if (!profileRes.ok || !profile.userId || !profile.displayName) {
      return redirectWithError(base, "profile_failed")
    }

    const session = JSON.stringify({
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl ?? "",
    })

    const res = NextResponse.redirect(`${base}/contact`)

    res.cookies.delete("line_state")
    res.cookies.set("line_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 ปี — ใช้เป็น identity marker
      path: "/",
    })

    return res
  } catch {
    return redirectWithError(base, "server_error")
  }
}
