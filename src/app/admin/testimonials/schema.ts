import { z } from "zod"

export const testimonialSchema = z.object({
  client_name:    z.string().min(1, "กรุณากรอกชื่อ"),
  client_role:    z.string().optional().nullable(),
  client_company: z.string().optional().nullable(),
  client_avatar:  z.string().refine((v) => !v || /^https?:\/\//.test(v), "URL ต้องเป็น https://").optional().nullable(),
  content:        z.string().min(1, "กรุณากรอกรีวิว"),
  short_quote:    z.string().optional().nullable(),
  rating:         z.number().min(1).max(5).nullable(),
  is_featured:    z.boolean(),
  is_published:   z.boolean(),
  display_order:  z.number(),
})

export type TestimonialInput = z.infer<typeof testimonialSchema>
