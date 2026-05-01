import { z } from "zod"

export const heroMediaSchema = z.object({
  type:          z.enum(["image", "video"]),
  media_url:     z.string().min(1, "กรุณาเพิ่มสื่อ"),
  caption:       z.string().optional().nullable(),
  display_order: z.number(),
  is_active:     z.boolean(),
})

export type HeroMediaInput = z.infer<typeof heroMediaSchema>
