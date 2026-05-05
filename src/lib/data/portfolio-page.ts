export type PortfolioStat = { value: string; label: string }

export type PortfolioPageSettings = {
  label: string
  heading: string
  subtext: string
  stats: PortfolioStat[]
}

export const DEFAULT_PORTFOLIO_PAGE: PortfolioPageSettings = {
  label:   "ผลงานของเรา",
  heading: "ผลลัพธ์ที่พิสูจน์แล้ว",
  subtext: "ตัวเลขทุกตัวมาจาก TikTok Shop dashboard โดยตรง ไม่ใช่ตัวเลขที่สร้างขึ้น",
  stats: [
    { value: "800M+", label: "GMV รวม (บาท)" },
    { value: "500+",  label: "แบรนด์ที่ดูแล" },
    { value: "10x",   label: "Growth เฉลี่ย" },
  ],
}

export function mergePortfolioPage(raw: Record<string, unknown>): PortfolioPageSettings {
  const base = DEFAULT_PORTFOLIO_PAGE
  return {
    label:   typeof raw.label   === "string" ? raw.label   : base.label,
    heading: typeof raw.heading === "string" ? raw.heading : base.heading,
    subtext: typeof raw.subtext === "string" ? raw.subtext : base.subtext,
    stats:   Array.isArray(raw.stats) && raw.stats.length > 0
      ? (raw.stats as PortfolioStat[])
      : base.stats,
  }
}
