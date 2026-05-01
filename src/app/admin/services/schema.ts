import { z } from "zod"

export const serviceSchema = z.object({
  title:          z.string().min(1, "กรุณากรอกชื่อ"),
  slug:           z.string().min(1, "กรุณากรอก slug"),
  category:       z.enum(["service", "pricing"]),
  tagline:        z.string().optional().nullable(),
  highlight:      z.string().optional().nullable(),
  icon:           z.string().optional().nullable(),
  color:          z.string(),
  short_desc:     z.string().optional().nullable(),
  full_desc:      z.string().optional().nullable(),
  features:       z.array(z.string()),
  starting_price: z.string().optional().nullable(),
  cta:            z.string().optional().nullable(),
  badge:          z.string().optional().nullable(),
  is_popular:     z.boolean(),
  is_active:      z.boolean(),
  display_order:  z.number(),
})

export type ServiceInput = z.infer<typeof serviceSchema>
