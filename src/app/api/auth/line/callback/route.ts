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
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
      // JWT service role key starts with "eyJ"; placeholder / publishable key is invalid
      if (!serviceKey || !serviceKey.startsWith("eyJ")) {
        console.error("LINE login: SUPABASE_SERVICE_ROLE_KEY is missing or invalid (got:", serviceKey.slice(0, 10), "...)")
        return redirectWithError(base, returnTo, "server_config_error")
      }

      const admin        = createAdminClient()
      // Supabase normalizes emails to lowercase — must match or listUsers comparison fails
      const virtualEmail = `${profile.userId.toLowerCase()}@line.npcreate.co.th`

      let userId: string | null = null

      // ── 1. หา user จาก profiles.line_user_id ──
      const { data: existingProfile, error: profileLookupErr } = await admin
        .from("profiles")
        .select("id")
        .eq("line_user_id", profile.userId)
        .maybeSingle()

      if (profileLookupErr) {
        console.error("LINE login: profiles lookup failed:", profileLookupErr.message, profileLookupErr.code)
        return redirectWithError(base, returnTo, "server_config_error")
      }

      if (existingProfile) {
        userId = existingProfile.id
      } else {
        // ── 2. หา auth user จาก virtual email (กรณี trigger สร้าง user แต่ profile ยังไม่มี line_user_id) ──
        const { data: userList, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 })

        if (listErr) {
          console.error("LINE login: listUsers failed:", listErr.message, listErr.status)
          // 401/403 = wrong service role key
          if (listErr.status === 401 || listErr.status === 403) {
            return redirectWithError(base, returnTo, "server_config_error")
          }
          return redirectWithError(base, returnTo, "create_user_failed")
        }

        const existingAuthUser = userList?.users?.find(
          u => u.email?.toLowerCase() === virtualEmail
        )

        if (existingAuthUser) {
          userId = existingAuthUser.id
          // อัปเดต profile ที่ยังไม่ได้ link LINE
          await admin.from("profiles").update({
            line_user_id:      profile.userId,
            line_display_name: profile.displayName,
            updated_at:        new Date().toISOString(),
          }).eq("id", userId)
        } else {
          // ── 3. สร้าง auth user ใหม่ ──
          const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
            email:          virtualEmail,
            email_confirm:  true,
            user_metadata:  {
              full_name:  profile.displayName,
              avatar_url: profile.pictureUrl,
              provider:   "line",
            },
          })
          if (createErr || !newUser?.user) {
            console.error("LINE createUser failed — status:", createErr?.status, "msg:", createErr?.message)
            // 401/403 = wrong service role key; show clearer error
            if (createErr?.status === 401 || createErr?.status === 403) {
              return redirectWithError(base, returnTo, "server_config_error")
            }
            // 422 = user already exists despite listUsers not finding them (edge case)
            if (createErr?.status === 422) {
              console.error("LINE createUser 422: user may already exist, retrying listUsers")
              const { data: retryList } = await admin.auth.admin.listUsers({ perPage: 1000 })
              const retryUser = retryList?.users?.find(u => u.email?.toLowerCase() === virtualEmail)
              if (retryUser) {
                userId = retryUser.id
                await admin.from("profiles").update({
                  line_user_id:      profile.userId,
                  line_display_name: profile.displayName,
                  updated_at:        new Date().toISOString(),
                }).eq("id", userId)
              } else {
                return redirectWithError(base, returnTo, "create_user_failed")
              }
            } else {
              return redirectWithError(base, returnTo, "create_user_failed")
            }
          } else {
            userId = newUser.user.id
            // อัปเดต line fields บน profile ที่ trigger สร้างให้
            await admin.from("profiles").update({
              line_user_id:      profile.userId,
              line_display_name: profile.displayName,
              updated_at:        new Date().toISOString(),
            }).eq("id", userId)
          }
        }
      }

      if (!userId) {
        return redirectWithError(base, returnTo, "create_user_failed")
      }

      // ── 4. Generate magic link → sign in ──
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type:    "magiclink",
        email:   virtualEmail,
        options: { redirectTo: `${base}${returnTo || "/member"}` },
      })
      if (linkErr || !linkData?.properties?.hashed_token) {
        console.error("LINE generateLink failed — status:", linkErr?.status, "msg:", linkErr?.message)
        return redirectWithError(base, returnTo, "link_failed")
      }

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
