export type ProcessStep = {
  step: string
  title: string
  duration: string
  description: string
}

export type FAQItem = {
  q: string
  a: string
}

export type ServicesPageSettings = {
  label: string
  heading1: string
  heading2: string
  heading2_color: string
  description: string
  process_label: string
  process_heading: string
  process_subtext: string
  process_steps: ProcessStep[]
  faqs: FAQItem[]
}

const DEFAULT_STEPS: ProcessStep[] = [
  {
    step: "01",
    title: "วิเคราะห์ Shop ของคุณ",
    duration: "วันที่ 1–2",
    description:
      "ดู TikTok Shop analytics, ประวัติยอดขาย, คู่แข่ง และ product positioning เพื่อเข้าใจโอกาสและปัญหาที่มีอยู่",
  },
  {
    step: "02",
    title: "วางกลยุทธ์และ Creative Brief",
    duration: "วันที่ 3–7",
    description:
      "กำหนด target audience, วาง campaign structure, เตรียม creative brief และ set KPI ที่ measurable ร่วมกับคุณ",
  },
  {
    step: "03",
    title: "เปิด Campaign และ Optimize",
    duration: "สัปดาห์ที่ 1–2",
    description:
      "Setup และเปิด GMV Max campaign, monitor ผลลัพธ์รายวัน, ปรับ bid และ creative เพื่อหา winning combination",
  },
  {
    step: "04",
    title: "Scale และรายงานผล",
    duration: "ต่อเนื่องรายเดือน",
    description:
      "เมื่อหา winning formula ได้แล้ว scale งบกับสิ่งที่ work รายงานรายสัปดาห์ และ review strategy รายเดือน",
  },
]

const DEFAULT_FAQS: FAQItem[] = [
  {
    q: "GMV Max คืออะไร และต่างจากโฆษณา TikTok ปกติอย่างไร?",
    a: "GMV Max เป็นระบบโฆษณาของ TikTok Shop ที่ออปติไมซ์เพื่อเพิ่ม Gross Merchandise Value (ยอดขายรวม) โดยตรง ต่างจากโฆษณาปกติที่เน้น reach หรือ engagement — GMV Max วัดผลที่ยอดขายจริง ทำให้วัด ROI ได้ชัดเจนและแม่นยำกว่า",
  },
  {
    q: "ต้องมี Ad budget เท่าไหร่ถึงจะเริ่มได้?",
    a: "แนะนำ Ad budget ขั้นต่ำที่ 15,000–20,000 บาท/เดือน เพื่อให้ algorithm มีข้อมูลเพียงพอในการ optimize แต่ละ campaign ต้องการ data จึงจะทำงานได้ดี — budget น้อยเกินไปจะทำให้ผลลัพธ์ไม่สม่ำเสมอ",
  },
  {
    q: "ใช้เวลานานแค่ไหนถึงเห็นผล?",
    a: "โดยทั่วไปเห็นสัญญาณแรกใน 7–14 วัน และเริ่ม optimize ได้เต็มที่ใน 30 วัน ช่วงแรก algorithm ต้อง 'เรียนรู้' shop ของคุณ เราจะแจ้ง expectation ที่ชัดเจนก่อนเริ่มงานเสมอ",
  },
  {
    q: "ต้องเตรียมอะไรบ้างก่อนเริ่มงาน?",
    a: "หลักๆ คือ: (1) TikTok Shop seller account ที่ active (2) สินค้าที่มี stock พร้อมขาย (3) ภาพสินค้าและข้อมูล product ที่ครบถ้วน และ (4) งบโฆษณาที่พร้อม — ส่วนที่เหลือทีมเราจัดการให้",
  },
  {
    q: "ถ้าผลงานไม่ดีตามที่คาด จะทำอย่างไร?",
    a: "เราตั้ง KPI ร่วมกันก่อนเริ่มและรายงานความคืบหน้าทุกสัปดาห์ ถ้าผลงานต่ำกว่า target เราจะวิเคราะห์สาเหตุและปรับ strategy ทันที ทุก plan เป็นรายเดือน ถ้าไม่พอใจสามารถหยุดได้โดยไม่มีค่าปรับ",
  },
  {
    q: "สัญญาผูกมัดนานแค่ไหน?",
    a: "ไม่มีสัญญาระยะยาว — ทุก plan เป็นรายเดือน แจ้งล่วงหน้า 30 วันก่อนหยุด เราเชื่อว่าถ้าผลงานดี ลูกค้าจะอยู่เองโดยไม่ต้องผูกมัด",
  },
]

export const DEFAULT_SERVICES_PAGE: ServicesPageSettings = {
  label: "บริการของเรา",
  heading1: "ครบทุกขั้นตอน",
  heading2: "ดูแลถึง Result",
  heading2_color: "#DC2626",
  description:
    "ไม่ใช่แค่ยิงแอด — เราวางกลยุทธ์ ผลิต creative ติดตามผลลัพธ์ และปรับ campaign แบบ real-time เพื่อให้ทุกบาทที่ลงทุนได้ผลตอบแทนสูงสุด",
  process_label: "ขั้นตอนการทำงาน",
  process_heading: "เริ่มต้นอย่างไร",
  process_subtext: "ตั้งแต่วันแรกที่ติดต่อจนถึงการเห็นผลลัพธ์จริง",
  process_steps: DEFAULT_STEPS,
  faqs: DEFAULT_FAQS,
}

export function mergeServicesPage(raw: Record<string, unknown>): ServicesPageSettings {
  const base = DEFAULT_SERVICES_PAGE
  return {
    label: (raw.label as string) ?? base.label,
    heading1: (raw.heading1 as string) ?? base.heading1,
    heading2: (raw.heading2 as string) ?? base.heading2,
    heading2_color: (raw.heading2_color as string) ?? base.heading2_color,
    description: (raw.description as string) ?? base.description,
    process_label: (raw.process_label as string) ?? base.process_label,
    process_heading: (raw.process_heading as string) ?? base.process_heading,
    process_subtext: (raw.process_subtext as string) ?? base.process_subtext,
    process_steps: Array.isArray(raw.process_steps)
      ? (raw.process_steps as ProcessStep[])
      : base.process_steps,
    faqs: Array.isArray(raw.faqs) ? (raw.faqs as FAQItem[]) : base.faqs,
  }
}
