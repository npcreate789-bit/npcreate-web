import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Temporary debug endpoint — remove after confirming service role key is correct
// Access: GET /api/debug/admin-check?secret=npcreate-debug
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

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1 })

    if (error) {
      return NextResponse.json({
        ok:      false,
        problem: `Admin API call failed: ${error.message} (status ${error.status})`,
        keyPreview,
      })
    }

    return NextResponse.json({
      ok:         true,
      message:    "Admin client working correctly",
      userCount:  data?.users?.length ?? 0,
      keyPreview,
    })
  } catch (e) {
    return NextResponse.json({
      ok:      false,
      problem: String(e),
      keyPreview,
    })
  }
}
