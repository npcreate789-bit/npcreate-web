import { z } from "zod"

export const promoBannerSchema = z.object({
  heading:       z.string().min(1, "กรุณากรอกหัวข้อ"),
  banner_url:    z.string(),
  detail:        z.string(),
  price_text:    z.string(),
  contact_text:  z.string().min(1, "กรุณากรอกข้อความปุ่ม"),
  contact_url:   z.string().refine(
    (val) => val === "" || /^(https?:\/\/|\/[^/])/.test(val.trim()),
    { message: "contact_url ต้องเป็น https://, http:// หรือ /path" }
  ),
  display_order: z.number().int(),
  is_active:     z.boolean(),
})

export type PromoBannerInput = z.infer<typeof promoBannerSchema>
