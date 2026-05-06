export type Portfolio = {
  id: string
  title: string
  slug: string
  client_name: string | null
  client_logo: string | null
  industry: string | null
  service_type: string[]
  short_desc: string | null
  challenge: string | null
  strategy: string | null
  result: string | null
  gmv_before: number | null
  gmv_after: number | null
  gmv_growth_pct: number | null
  roas: number | null
  roas_before: number | null
  growth_pct_before: number | null
  ad_spend: number | null
  duration_days: number | null
  cover_image: string | null
  media_type: "image" | "video" | "tiktok"
  video_id: string | null
  gradient: string | null
  is_featured: boolean
  is_published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type PortfolioMedia = {
  id: string
  portfolio_id: string
  media_type: 'image' | 'video' | 'tiktok_embed' | 'youtube_embed'
  url: string | null
  thumbnail_url: string | null
  embed_code: string | null
  caption: string | null
  display_order: number
  created_at: string
}

export type Service = {
  id: string
  title: string
  slug: string
  category: "service" | "pricing"
  tagline: string | null
  highlight: string | null
  icon: string | null
  color: string
  short_desc: string | null
  full_desc: string | null
  features: string[]
  starting_price: string | null
  cta: string | null
  badge: string | null
  is_popular: boolean
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Testimonial = {
  id: string
  client_name: string
  client_role: string | null
  client_company: string | null
  client_avatar: string | null
  content: string
  short_quote: string | null
  rating: number | null
  related_portfolio_id: string | null
  is_featured: boolean
  is_published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type ClientLogo = {
  id: string
  name: string
  logo_url: string
  website_url: string | null
  display_order: number
  created_at: string
}

export type LeadStatus = 'new' | 'contacted' | 'closed'
export type LeadType = 'seller' | 'affiliate'

export type Lead = {
  id: string
  lead_type: LeadType
  line_user_id: string | null
  display_name: string | null
  picture_url: string | null
  line_id: string | null
  member_id: string | null
  name: string
  phone: string
  brand: string | null
  monthly_gmv: string | null
  tiktok_url: string | null
  service: string
  message: string | null
  status: LeadStatus
  created_at: string
  updated_at: string
}

export type PromoBanner = {
  id: string
  heading: string
  banner_url: string | null
  detail: string | null
  price_text: string | null
  contact_text: string
  contact_url: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type HeroMedia = {
  id: string
  type: "image" | "video"
  media_url: string
  caption: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type UserRole = 'admin' | 'affiliate' | 'seller'

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export type SampleStatus = 'pending' | 'approved' | 'sent' | 'rejected'

export type Profile = {
  id: string
  user_code: string
  full_name: string
  phone: string
  line_id: string
  line_user_id: string | null
  line_display_name: string | null
  role: UserRole
  role_confirmed: boolean
  avatar_url: string | null
  is_active: boolean
  tiktok_channel_url: string | null
  content_type: "clip" | "live" | "both" | null
  address_name: string | null
  address_phone: string | null
  address_line1: string | null
  address_subdistrict: string | null
  address_district: string | null
  address_province: string | null
  address_postcode: string | null
  created_at: string
  updated_at: string
  email?: string
}

export type Store = {
  id: string
  seller_id: string
  name: string
  description: string | null
  logo_url: string | null
  category: string
  tiktok_shop_url: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  store_id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  commission_rate: number
  image_url: string | null
  tiktok_product_url: string | null
  tags: string[]
  stock_status: StockStatus
  is_active: boolean
  monthly_sales_est: number
  caption_suggestions: string | null
  forbidden_words: string | null
  promotion_text: string | null
  created_at: string
  updated_at: string
}

export type Campaign = {
  id: string
  store_id: string
  title: string
  description: string | null
  special_commission_rate: number | null
  starts_at: string
  ends_at: string
  product_ids: string[]
  script: string | null
  banner_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AffiliatePull = {
  id: string
  affiliate_id: string
  product_id: string
  sample_status: SampleStatus
  seller_note: string | null
  created_at: string
}
