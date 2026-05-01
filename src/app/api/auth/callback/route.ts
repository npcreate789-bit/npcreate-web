import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const base = process.env.NEXT_PUBLIC_SITE_URL!

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const user = data.session.user

      // sync line_user_id เมื่อ login ด้วย LINE OAuth
      const lineIdentity = user.identities?.find(i => i.provider === "line")
      if (lineIdentity) {
        const lineUserId      = lineIdentity.identity_data?.provider_id as string | undefined
        const lineDisplayName = (user.user_metadata?.name ?? user.user_metadata?.full_name ?? null) as string | null
        if (lineUserId) {
          await supabase.from("profiles").update({
            line_user_id:      lineUserId,
            line_display_name: lineDisplayName,
            updated_at:        new Date().toISOString(),
          }).eq("id", user.id)
        }
      }

      return NextResponse.redirect(`${base}${next}`)
    }
  }

  return NextResponse.redirect(`${base}/member/login?error=invalid_link`)
}
