import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

function redirectWithError(base: string, returnTo: string, error: string) {
  const dest = returnTo.startsWith("/member") ? "/member/profile" : "/contact"
  return NextResponse.redirect(`${base}${dest}?error=${error}`)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code        = searchParams.get("code")
  const state       = searchParams.get("state")
  const storedState = req.cookies.get("line_state")?.value
  const returnTo    = req.cookies.get("line_return_to")?.value ?? ""
  const base        = process.env.NEXT_PUBLIC_SITE_URL!

  if (!state || !storedState || state !== storedState) {
    return redirectWithError(base, returnTo, "invalid_state")
  }
  if (!code) {
    return redirectWithError(base, returnTo, "no_code")
  }

  try {
    // Exchange code → access token
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  process.env.LINE_LOGIN_REDIRECT_URI!,
        client_id:     process.env.LINE_LOGIN_CLIENT_ID!,
        client_secret: process.env.LINE_LOGIN_CLIENT_SECRET!,
      }),
    })
    const tokenData: LineTokenResponse = await tokenRes.json()
    if (!tokenRes.ok || tokenData.error) {
      return redirectWithError(base, returnTo, "token_failed")
    }

    // Get LINE profile
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile: LineProfile = await profileRes.json()
    if (!profileRes.ok || !profile.userId || !profile.displayName) {
      return redirectWithError(base, returnTo, "profile_failed")
    }

    const supabase   = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const clearCookies = (r: NextResponse) => {
      r.cookies.delete("line_state")
      r.cookies.delete("line_return_to")
      return r
    }

    if (user) {
      // ── สมาชิก Login อยู่แล้ว → เชื่อม LINE เข้า profile ──
      await supabase.from("profiles").update({
        line_user_id:      profile.userId,
        line_display_name: profile.displayName,
        updated_at:        new Date().toISOString(),
      }).eq("id", user.id)

      const dest = returnTo || "/member/profile"
      return clearCookies(NextResponse.redirect(`${base}${dest}`))
    }

    // ── ยังไม่ได้ Login → เก็บใน cookie สำหรับฟอร์มติดต่อ ──
    const session = JSON.stringify({
      userId:      profile.userId,
      displayName: profile.displayName,
      pictureUrl:  profile.pictureUrl ?? "",
    })

    const dest = returnTo || "/contact"
    const res  = clearCookies(NextResponse.redirect(`${base}${dest}`))
    res.cookies.set("line_session", session, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24 * 365,
      path:     "/",
    })
    return res

  } catch {
    return redirectWithError(base, returnTo, "server_error")
  }
}
