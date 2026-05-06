import { z } from "zod"

export const productSchema = z.object({
  store_id:            z.string().uuid("กรุณาเลือกร้านค้า"),
  name:                z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  description:         z.string().optional().nullable(),
  price:               z.number().min(0),
  original_price:      z.number().nullable(),
  commission_rate:     z.number().min(1, "ขั้นต่ำ 1%").max(100, "สูงสุด 100%"),
  image_url:           z.string().refine((v) => !v || /^https?:\/\//.test(v), "URL ต้องเป็น https://").optional().nullable(),
  tiktok_product_url:  z.string().refine((v) => !v || /^https?:\/\//.test(v), "URL ต้องเป็น https://").optional().nullable(),
  stock_status:        z.enum(["in_stock", "low_stock", "out_of_stock"]),
  is_active:           z.boolean(),
  monthly_sales_est:   z.number().min(0),
  promotion_text:      z.string().optional().nullable(),
  caption_suggestions: z.string().optional().nullable(),
  forbidden_words:     z.string().optional().nullable(),
  tags:                z.array(z.string()),
})

export type ProductInput = z.infer<typeof productSchema>
