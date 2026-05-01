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
  services_section: { badge: string; heading: string; subtext: string }
  why_us: {
    badge: string
    heading: string
    subtext: string
    cta_text: string
    reasons: Array<{ title: string; description: string }>
  }
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
  services_section: {
    badge: "บริการของเรา",
    heading: "ครบทุกขั้นตอน ดูแลถึง Result",
    subtext: "ไม่ใช่แค่ยิงแอด — เราวางกลยุทธ์ ผลิต creative และติดตามผลลัพธ์จริงให้คุณ",
  },
  why_us: {
    badge: "ทำไมต้องเลือก NP Create",
    heading: "ผลงานพูดแทนทุกอย่าง",
    subtext: "ตลาด TikTok Shop เติบโตเร็ว แต่การยิงแอดให้ได้ผลต้องอาศัยความเชี่ยวชาญเฉพาะ เราช่วยให้แบรนด์ของคุณได้เปรียบก่อนคู่แข่งจะตามทัน",
    cta_text: "คุยกับทีมงานเลย",
    reasons: [
      { title: "เชี่ยวชาญ GMV Max เท่านั้น", description: "เราโฟกัสเฉพาะ TikTok Shop GMV Max ไม่กระจายทำหลาย platform ความเชี่ยวชาญเฉพาะทางให้ผลลัพธ์ที่ดีกว่า" },
      { title: "ผลลัพธ์โปร่งใส ดูได้ Real-time", description: "ให้ access dashboard โฆษณาตรง ไม่มีปิดบัง ตัวเลข ROI, GMV ดูได้ทุกวัน" },
      { title: "ทีมที่รู้จริง ไม่ใช้ Freelance", description: "ทีมงานประจำที่มีประสบการณ์กับ TikTok Shop โดยตรง ไม่ outsource งานให้ freelance ที่ไม่มีประสบการณ์" },
      { title: "สัญญารายเดือน ไม่ผูกมัดยาว", description: "ไม่มีสัญญา 6–12 เดือน เริ่มได้เลยรายเดือน ถ้าไม่พอใจผลงาน หยุดได้ทันที" },
    ],
  },
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
    promo:            { ...d.promo,            ...(o.promo            ?? {}) },
    hero:             { ...d.hero,             ...(o.hero             ?? {}) },
    stats:            o.stats            ?? d.stats,
    services_section: { ...d.services_section, ...(o.services_section ?? {}) },
    why_us: {
      ...d.why_us,
      ...(o.why_us ?? {}),
      reasons: o.why_us?.reasons ?? d.why_us.reasons,
    },
    cta_section: { ...d.cta_section, ...(o.cta_section ?? {}) },
  }
}
