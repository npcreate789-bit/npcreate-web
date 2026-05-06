import { z } from "zod"

export const portfolioSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อ"),
  slug: z.string().min(1, "กรุณากรอก slug"),
  client_name: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  service_type: z.array(z.string()),
  short_desc: z.string().optional().nullable(),
  gmv_before: z.number().nullable(),
  gmv_after: z.number().nullable(),
  gmv_growth_pct: z.number().nullable(),
  roas: z.number().nullable(),
  roas_before: z.number().nullable().optional(),
  growth_pct_before: z.number().nullable().optional(),
  duration_days: z.number().nullable(),
  cover_image: z.string().refine((v) => !v || /^https?:\/\//.test(v), "URL ต้องเป็น https://").optional().nullable(),
  media_type: z.enum(["image", "video", "tiktok"]),
  video_id: z.string().optional().nullable(),
  gradient: z.string().optional().nullable(),
  bg_image: z.string().optional().nullable(),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  display_order: z.number(),
})

export type PortfolioInput = z.infer<typeof portfolioSchema>
