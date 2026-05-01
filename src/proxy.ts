import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// /member/* paths that do NOT require authentication
const MEMBER_PUBLIC_PREFIXES = ["/member/login", "/member/forgot-password"]

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )

  // getUser() refreshes expired access tokens — must not be skipped
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect /admin routes
  if (pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/member/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // Protect /member/* routes (except public paths like login)
  const isMemberPath   = pathname.startsWith("/member")
  const isPublicMember = MEMBER_PUBLIC_PREFIXES.some(p => pathname.startsWith(p))
  if (isMemberPath && !isPublicMember && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/member/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
