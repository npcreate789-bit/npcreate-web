export type PortfolioCategory = 'all' | 'fashion' | 'food' | 'beauty' | 'health' | 'lifestyle'

export type PortfolioItem = {
  id: string
  brand: string
  category: Exclude<PortfolioCategory, 'all'>
  gradient: string
  stats: {
    gmv: string
    gmvBefore: string
    roas: string
    roasBefore: string
    growth: string
    growthBefore: string
  }
  description: string
  tags: string[]
  coverImage?: string
  bgImage?: string
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
    gradient: 'from-red-800 via-rose-700 to-red-600',
    stats: { gmv: '2.4M', gmvBefore: '200K', roas: '12x', roasBefore: '—', growth: '+340%', growthBefore: '—' },
    description: 'เพิ่มยอดขายจาก 200K → 2.4M/เดือน ใน 3 เดือนด้วยกลยุทธ์ GMV Max แบบ full funnel',
    tags: ['GMV Max', 'Fashion', 'TikTok Shop'],
  },
  {
    id: '2',
    brand: 'Glow Beauty',
    category: 'beauty',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
    stats: { gmv: '1.8M', gmvBefore: '180K', roas: '9x', roasBefore: '—', growth: '+280%', growthBefore: '—' },
    description: 'แบรนด์สกินแคร์ยอดนิยม สร้างยอดขาย 1.8M/เดือน ด้วย GMV Max และ creative ที่แม่นยำ',
    tags: ['GMV Max', 'Beauty', 'Skincare'],
  },
  {
    id: '3',
    brand: 'Fit Life',
    category: 'health',
    gradient: 'from-red-700 via-rose-600 to-red-500',
    stats: { gmv: '950K', gmvBefore: '—', roas: '15x', roasBefore: '—', growth: '+420%', growthBefore: '—' },
    description: 'อาหารเสริมสุขภาพ เติบโต 4x ใน 2 เดือนแรก จาก cold start ไม่มียอดขายเลย',
    tags: ['GMV Max', 'Health', 'Supplement'],
  },
  {
    id: '4',
    brand: 'Daily Kitchen',
    category: 'food',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    stats: { gmv: '3.2M', gmvBefore: '500K', roas: '8x', roasBefore: '—', growth: '+190%', growthBefore: '—' },
    description: 'อาหารพร้อมรับประทาน ทำ GMV รวม 3.2M ในเดือนเดียวด้วย campaign ช่วง Mega Sale',
    tags: ['GMV Max', 'Food', 'Ready to eat'],
  },
  {
    id: '5',
    brand: 'Urban Style',
    category: 'fashion',
    gradient: 'from-slate-500 via-gray-600 to-zinc-700',
    stats: { gmv: '1.2M', gmvBefore: '150K', roas: '11x', roasBefore: '—', growth: '+310%', growthBefore: '—' },
    description: 'เสื้อผ้าสตรีทแวร์ ยอดขายเพิ่ม 3 เท่าภายใน 45 วัน ด้วย creative A/B testing',
    tags: ['GMV Max', 'Street Fashion'],
  },
  {
    id: '6',
    brand: 'Pure Essence',
    category: 'beauty',
    gradient: 'from-red-900 via-red-700 to-rose-600',
    stats: { gmv: '760K', gmvBefore: '—', roas: '13x', roasBefore: '—', growth: '+250%', growthBefore: '—' },
    description: 'เซรั่มบำรุงผิว new launch เปิดตัวด้วย GMV Max ได้ผลทันทีตั้งแต่สัปดาห์แรก',
    tags: ['GMV Max', 'Serum', 'New Launch'],
  },
  {
    id: '7',
    brand: 'Home & Life',
    category: 'lifestyle',
    gradient: 'from-rose-600 via-red-500 to-red-700',
    stats: { gmv: '2.1M', gmvBefore: '400K', roas: '7x', roasBefore: '—', growth: '+160%', growthBefore: '—' },
    description: 'ของตกแต่งบ้าน สร้าง brand awareness และยอดขายพร้อมกันในแคมเปญเดียว',
    tags: ['GMV Max', 'Home Decor', 'Lifestyle'],
  },
  {
    id: '8',
    brand: 'Active Sport',
    category: 'health',
    gradient: 'from-yellow-500 via-amber-500 to-orange-600',
    stats: { gmv: '880K', gmvBefore: '—', roas: '10x', roasBefore: '—', growth: '+220%', growthBefore: '—' },
    description: 'อุปกรณ์ออกกำลังกาย ขึ้น For You Page ต่อเนื่อง 30 วัน ยอดขายทะลุทุกเป้า',
    tags: ['GMV Max', 'Sport', 'Fitness'],
  },
  {
    id: '9',
    brand: 'Sweet Corner',
    category: 'food',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    stats: { gmv: '540K', gmvBefore: '—', roas: '18x', roasBefore: '—', growth: '+500%', growthBefore: '—' },
    description: 'ขนมหวาน Handmade เปิดร้านใหม่ ทำ GMV 540K ใน 30 วันแรกด้วยงบโฆษณาที่จำกัด',
    tags: ['GMV Max', 'Food', 'Dessert'],
  },
]
