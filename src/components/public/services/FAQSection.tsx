"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FAQItem } from "@/lib/data/services-page"

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

interface Props {
  faqs?: FAQItem[]
  lineHref?: string
}

export function FAQSection({ faqs, lineHref = "/api/auth/line" }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const items = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className="py-14 pb-20 bg-[#0A0404]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-[#DC2626] text-xs font-bold uppercase tracking-[0.2em]">FAQ</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3 leading-snug">
            คำถามที่พบบ่อย
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((faq, i) => (
            <div
              key={i}
              className="bg-[#1C0D0D] border border-white/5 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span className="font-medium text-white text-sm">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-slate-400 shrink-0 transition-transform duration-200",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>

              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-slate-400 text-sm mb-4">ยังมีคำถามอื่นอีก?</p>
          <a
            href={lineHref}
            className="inline-flex items-center gap-2 text-[#DC2626] hover:text-[#FCA5A5] font-medium text-sm transition-colors"
          >
            ถามผ่าน Line OA ได้เลย →
          </a>
        </div>
      </div>
    </section>
  )
}
