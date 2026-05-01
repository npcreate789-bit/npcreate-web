import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type LineTokenResponse = {
  access_token: string
  token_type:   string
  expires_in:   number
  error?:       string
}

type LineProfile = {
  userId:      string
  displayName: string
  pictureUrl:  string
}

function redirectWithError(base: string, returnTo: string, error: string) {
  const dest = returnTo.startsWith("/member") ? "/member/login" : "/contact"
  return NextResponse.redirect(`${base}${dest}?error=${error}`)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code        = searchParams.get("code")
  const state       = searchParams.get("state")
  const storedState = req.cookies.get("line_state")?.value
  const returnTo    = req.cookies.get("line_return_to")?.value ?? ""
  const lineMode    = req.cookies.get("line_mode")?.value ?? ""
  const base        = process.env.NEXT_PUBLIC_SITE_URL!

  const clearCookies = (r: NextResponse) => {
    r.cookies.delete("line_state")
    r.cookies.delete("line_return_to")
    r.cookies.delete("line_mode")
    return r
  }

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

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // ── สมาชิก Login อยู่แล้ว → เชื่อม LINE เข้า profile ──────────────────────
    if (user) {
      await supabase.from("profiles").update({
        line_user_id:      profile.userId,
        line_display_name: profile.displayName,
        updated_at:        new Date().toISOString(),
      }).eq("id", user.id)

      const dest = returnTo || "/member/profile"
      return clearCookies(NextResponse.redirect(`${base}${dest}`))
    }

    // ── mode=member → Login/Register ด้วย LINE ──────────────────────────────────
    if (lineMode === "member") {
      const admin       = createAdminClient()
      const virtualEmail = `${profile.userId}@line.npcreate.co.th`

      // หา auth user เดิมจาก email หรือ profile
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("line_user_id", profile.userId)
        .maybeSingle()

      let userId: string

      if (existingProfile) {
        // มี account อยู่แล้ว — ใช้ user id เดิม
        userId = existingProfile.id
      } else {
        // สร้าง auth user ใหม่
        const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
          email:          virtualEmail,
          email_confirm:  true,
          user_metadata:  {
            full_name:   profile.displayName,
            avatar_url:  profile.pictureUrl,
            provider:    "line",
          },
        })
        if (createErr || !newUser.user) {
          return redirectWithError(base, returnTo, "create_user_failed")
        }
        userId = newUser.user.id

        // อัปเดต line fields บน profile ที่ trigger สร้างให้
        await admin.from("profiles").update({
          line_user_id:      profile.userId,
          line_display_name: profile.displayName,
          updated_at:        new Date().toISOString(),
        }).eq("id", userId)
      }

      // Generate magic sign-in link แล้ว redirect ไป app โดยตรง
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type:  "magiclink",
        email: virtualEmail,
        options: { redirectTo: `${base}${returnTo || "/member"}` },
      })
      if (linkErr || !linkData.properties?.hashed_token) {
        return redirectWithError(base, returnTo, "link_failed")
      }

      // แปลง action link → token_hash redirect สำหรับ App Router
      const confirmUrl = new URL(`${base}/api/auth/confirm`)
      confirmUrl.searchParams.set("token_hash", linkData.properties.hashed_token)
      confirmUrl.searchParams.set("type", "magiclink")
      confirmUrl.searchParams.set("next", returnTo || "/member")

      return clearCookies(NextResponse.redirect(confirmUrl.toString()))
    }

    // ── ยังไม่ได้ Login (contact form flow) → เก็บใน cookie ────────────────────
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
