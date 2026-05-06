export type PortfolioCategory = 'all' | 'fashion' | 'food' | 'beauty' | 'health' | 'lifestyle'
export type PortfolioMediaType = 'all' | 'image' | 'video'

export type PortfolioItem = {
  id: string
  brand: string
  category: Exclude<PortfolioCategory, 'all'>
  type: Exclude<PortfolioMediaType, 'all'>
  gradient: string
  stats: {
    gmv: string       // GMV หลังดูแล (บาท/6เดือน)
    gmvBefore: string // GMV ก่อนดูแล (บาท/6เดือน)
    roas: string
    growth: string
  }
  description: string
  tags: string[]
  videoId?: string
  tiktokId?: string
  coverImage?: string
}

export const categoryOptions: { value: PortfolioCategory; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'fashion', label: 'แฟชั่น' },
  { value: 'food', label: 'อาหาร' },
  { value: 'beauty', label: 'ความงาม' },
  { value: 'health', label: 'สุขภาพ' },
  { value: 'lifestyle', label: 'ไลฟ์สไตล์' },
]

export const categoryLabel: Record<string, string> = {
  fashion: 'แฟชั่น',
  food: 'อาหาร',
  beauty: 'ความงาม',
  health: 'สุขภาพ',
  lifestyle: 'ไลฟ์สไตล์',
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: '1',
    brand: 'Luxe Fashion',
    category: 'fashion',
    type: 'video',
    gradient: 'from-red-800 via-rose-700 to-red-600',
    stats: { gmv: '2.4M', gmvBefore: '200K', roas: '12x', growth: '+340%' },
    description: 'เพิ่มยอดขายจาก 200K → 2.4M/เดือน ใน 3 เดือนด้วยกลยุทธ์ GMV Max แบบ full funnel',
    tags: ['GMV Max', 'Fashion', 'TikTok Shop'],
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: '2',
    brand: 'Glow Beauty',
    category: 'beauty',
    type: 'image',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
    stats: { gmv: '1.8M', gmvBefore: '180K', roas: '9x', growth: '+280%' },
    description: 'แบรนด์สกินแคร์ยอดนิยม สร้างยอดขาย 1.8M/เดือน ด้วย GMV Max และ creative ที่แม่นยำ',
    tags: ['GMV Max', 'Beauty', 'Skincare'],
  },
  {
    id: '3',
    brand: 'Fit Life',
    category: 'health',
    type: 'video',
    gradient: 'from-red-700 via-rose-600 to-red-500',
    stats: { gmv: '950K', gmvBefore: '—', roas: '15x', growth: '+420%' },
    description: 'อาหารเสริมสุขภาพ เติบโต 4x ใน 2 เดือนแรก จาก cold start ไม่มียอดขายเลย',
    tags: ['GMV Max', 'Health', 'Supplement'],
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: '4',
    brand: 'Daily Kitchen',
    category: 'food',
    type: 'image',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    stats: { gmv: '3.2M', gmvBefore: '500K', roas: '8x', growth: '+190%' },
    description: 'อาหารพร้อมรับประทาน ทำ GMV รวม 3.2M ในเดือนเดียวด้วย campaign ช่วง Mega Sale',
    tags: ['GMV Max', 'Food', 'Ready to eat'],
  },
  {
    id: '5',
    brand: 'Urban Style',
    category: 'fashion',
    type: 'image',
    gradient: 'from-slate-500 via-gray-600 to-zinc-700',
    stats: { gmv: '1.2M', gmvBefore: '150K', roas: '11x', growth: '+310%' },
    description: 'เสื้อผ้าสตรีทแวร์ ยอดขายเพิ่ม 3 เท่าภายใน 45 วัน ด้วย creative A/B testing',
    tags: ['GMV Max', 'Street Fashion'],
  },
  {
    id: '6',
    brand: 'Pure Essence',
    category: 'beauty',
    type: 'video',
    gradient: 'from-red-900 via-red-700 to-rose-600',
    stats: { gmv: '760K', gmvBefore: '—', roas: '13x', growth: '+250%' },
    description: 'เซรั่มบำรุงผิว new launch เปิดตัวด้วย GMV Max ได้ผลทันทีตั้งแต่สัปดาห์แรก',
    tags: ['GMV Max', 'Serum', 'New Launch'],
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: '7',
    brand: 'Home & Life',
    category: 'lifestyle',
    type: 'video',
    gradient: 'from-rose-600 via-red-500 to-red-700',
    stats: { gmv: '2.1M', gmvBefore: '400K', roas: '7x', growth: '+160%' },
    description: 'ของตกแต่งบ้าน สร้าง brand awareness และยอดขายพร้อมกันในแคมเปญเดียว',
    tags: ['GMV Max', 'Home Decor', 'Lifestyle'],
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: '8',
    brand: 'Active Sport',
    category: 'health',
    type: 'image',
    gradient: 'from-yellow-500 via-amber-500 to-orange-600',
    stats: { gmv: '880K', gmvBefore: '—', roas: '10x', growth: '+220%' },
    description: 'อุปกรณ์ออกกำลังกาย ขึ้น For You Page ต่อเนื่อง 30 วัน ยอดขายทะลุทุกเป้า',
    tags: ['GMV Max', 'Sport', 'Fitness'],
  },
  {
    id: '9',
    brand: 'Sweet Corner',
    category: 'food',
    type: 'video',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    stats: { gmv: '540K', gmvBefore: '—', roas: '18x', growth: '+500%' },
    description: 'ขนมหวาน Handmade เปิดร้านใหม่ ทำ GMV 540K ใน 30 วันแรกด้วยงบโฆษณาที่จำกัด',
    tags: ['GMV Max', 'Food', 'Dessert'],
    videoId: 'dQw4w9WgXcQ',
  },
]
