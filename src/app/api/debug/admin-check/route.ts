import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Temporary debug endpoint — remove after LINE login is confirmed working
// Access: GET /api/debug/admin-check?secret=npcreate-debug[&test=create]
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== "npcreate-debug") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  const keyPreview = serviceKey.slice(0, 20) + "..."
  const isJwt      = serviceKey.startsWith("eyJ")

  if (!isJwt) {
    return NextResponse.json({
      ok:      false,
      problem: "SUPABASE_SERVICE_ROLE_KEY is not a JWT (should start with eyJ...)",
      keyPreview,
    })
  }

  const admin = createAdminClient()

  // Basic connectivity check
  const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 1 })
  if (listError) {
    return NextResponse.json({
      ok:      false,
      step:    "listUsers",
      problem: `${listError.message} (status ${listError.status})`,
      keyPreview,
    })
  }

  // If ?test=create — try creating a throw-away user to verify the DB trigger works
  if (req.nextUrl.searchParams.get("test") === "create") {
    const testEmail = `debug-test-${Date.now()}@line.npcreate.co.th`

    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email:         testEmail,
      email_confirm: true,
      user_metadata: { full_name: "Debug Test", provider: "line" },
    })

    if (createError || !newUser?.user) {
      return NextResponse.json({
        ok:      false,
        step:    "createUser",
        problem: `${createError?.message ?? "no user returned"} (status ${createError?.status})`,
        hint:    "DB trigger handle_new_user() may be failing — check Supabase logs",
        keyPreview,
      })
    }

    // Clean up — delete the test user
    await admin.auth.admin.deleteUser(newUser.user.id)

    return NextResponse.json({
      ok:        true,
      message:   "createUser + deleteUser both succeeded — trigger works",
      userCount: listData?.users?.length ?? 0,
      keyPreview,
    })
  }

  return NextResponse.json({
    ok:        true,
    message:   "Admin client working. Add ?test=create to also test user creation.",
    userCount: listData?.users?.length ?? 0,
    keyPreview,
  })
}
