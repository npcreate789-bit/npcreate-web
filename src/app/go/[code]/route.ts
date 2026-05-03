import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctx: { params: Promise<{ code: string }> }
) {
  return NextResponse.redirect(new URL("/marketplace", request.url))
}
