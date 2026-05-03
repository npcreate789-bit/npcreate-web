import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = await createClient()
  const userAgent = request.headers.get("user-agent") ?? undefined

  // Fire-and-forget click tracking
  void supabase.rpc("increment_pull_clicks", {
    p_pull_code: code,
    p_user_agent: userAgent,
  })

  // Look up the product URL
  const { data } = await supabase
    .from("affiliate_pulls")
    .select("product:products(tiktok_product_url)")
    .eq("pull_code", code)
    .maybeSingle()

  const productUrl = (data?.product as { tiktok_product_url?: string | null } | null)?.tiktok_product_url

  if (productUrl) {
    return NextResponse.redirect(productUrl)
  }

  return NextResponse.redirect(new URL("/", request.url))
}
