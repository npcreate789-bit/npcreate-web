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

export type Lead = {
  id: string
  line_user_id: string
  display_name: string
  picture_url: string
  name: string
  phone: string
  brand: string
  monthly_gmv: string
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

export type Profile = {
  id: string
  user_code: string
  full_name: string
  phone: string
  line_id: string
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  email?: string
}