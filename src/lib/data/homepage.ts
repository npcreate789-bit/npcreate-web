export type HomepageSettings = {
  promo: { text: string; visible: boolean }
  hero: {
    line1: string
    line2: string
    line2_color: string
    line3: string
    size: "sm" | "md" | "lg" | "xl"
    subtext: string
    cta1_text: string
    cta2_text: string
  }
  stats: Array<{ value: string; label: string }>
  cta_section: {
    heading: string
    heading_highlight: string
    subtext: string
    cta_text: string
    footer_text: string
  }
}

export const DEFAULT_HOMEPAGE: HomepageSettings = {
  promo: {
    text: "รับลูกค้าใหม่ เดือน พ.ค. นี้ — เหลืออีก 3 สล็อต",
    visible: true,
  },
  hero: {
    line1: "ปั้นยอดขาย TikTok Shop",
    line2: "ให้โต 10 เท่า",
    line2_color: "#DC2626",
    line3: "ด้วย GMV Max",
    size: "md",
    subtext: "ดูแลมาแล้วมากกว่า 500 แบรนด์ สร้างยอดขายรวม 800+ ล้านบาท ด้วยกลยุทธ์ GMV Max ที่พิสูจน์แล้ว",
    cta1_text: "ปรึกษาฟรีผ่าน Line OA",
    cta2_text: "ดูผลงานทั้งหมด",
  },
  stats: [
    { value: "800M+", label: "GMV รวม (บาท)" },
    { value: "500+", label: "แบรนด์ที่ดูแล" },
    { value: "10x", label: "การเติบโตเฉลี่ย" },
  ],
  cta_section: {
    heading: "พร้อมปั้นยอดขาย",
    heading_highlight: "ไปด้วยกันไหม?",
    subtext: "ปรึกษาฟรี ไม่มีค่าใช้จ่าย วิเคราะห์ TikTok Shop ของคุณและเสนอแนวทางที่เหมาะสมที่สุด",
    cta_text: "ปรึกษาฟรีผ่าน Line OA",
    footer_text: "ตอบกลับภายใน 1 ชั่วโมง · ไม่มีข้อผูกมัด",
  },
}

export function mergeHomepage(
  override: Record<string, unknown>
): HomepageSettings {
  const d = DEFAULT_HOMEPAGE
  const o = override as Partial<HomepageSettings>
  return {
    promo:       { ...d.promo,       ...(o.promo       ?? {}) },
    hero:        { ...d.hero,        ...(o.hero        ?? {}) },
    stats:       o.stats ?? d.stats,
    cta_section: { ...d.cta_section, ...(o.cta_section ?? {}) },
  }
}
