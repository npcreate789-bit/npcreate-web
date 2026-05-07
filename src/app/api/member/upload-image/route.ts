import { type NextRequest, NextResponse } from "next/server"
import { requireSeller } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

const BUCKET   = "product-images"
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED  = ["image/jpeg", "image/png", "image/webp"]
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
}

export async function POST(req: NextRequest) {
  let userId: string
  try {
    const { user } = await requireSeller()
    userId = user.id
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 })
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "รองรับเฉพาะ JPG, PNG, WEBP" }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "ขนาดไฟล์ต้องไม่เกิน 5MB" }, { status: 400 })
  }

  const ext      = EXT_MAP[file.type] ?? "jpg"
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path     = `stores/${userId}/products/${filename}`

  const buffer  = Buffer.from(await file.arrayBuffer())
  const supabase = createAdminClient()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error("Storage upload error:", error.message)
    return NextResponse.json(
      { error: error.message.includes("not found") ? "กรุณาสร้าง bucket ชื่อ product-images ใน Supabase Storage ก่อน" : "อัปโหลดไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    )
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
