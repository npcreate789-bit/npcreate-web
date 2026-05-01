import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// /member/* paths that do NOT require authentication
const MEMBER_PUBLIC_PREFIXES = ["/member/login", "/member/forgot-password"]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          // Must forward to request first, then to the new response
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() refreshes expired access tokens — must not be moved or skipped
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isMemberPath   = pathname.startsWith("/member")
  const isPublicMember = MEMBER_PUBLIC_PREFIXES.some(p => pathname.startsWith(p))

  if (!user && isMemberPath && !isPublicMember) {
    const url = request.nextUrl.clone()
    url.pathname = "/member/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
