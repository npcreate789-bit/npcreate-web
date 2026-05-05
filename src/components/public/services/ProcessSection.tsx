import type { ProcessStep } from "@/lib/data/services-page"

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

interface Props {
  steps?: ProcessStep[]
  label?: string
  heading?: string
  subtext?: string
}

export function ProcessSection({
  steps,
  label = "ขั้นตอนการทำงาน",
  heading = "เริ่มต้นอย่างไร",
  subtext = "ตั้งแต่วันแรกที่ติดต่อจนถึงการเห็นผลลัพธ์จริง",
}: Props) {
  const items = steps && steps.length > 0 ? steps : DEFAULT_STEPS

  return (
    <section className="py-14 bg-[#0A0404]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-10">
          <span className="text-[#DC2626] text-xs font-bold uppercase tracking-[0.2em]">
            {label}
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3 leading-snug">
            {heading}
          </h2>
          {subtext && (
            <p className="text-slate-400 text-sm mt-3 max-w-md mx-auto">{subtext}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-[22px] left-[calc(12.5%+16px)] right-[calc(12.5%+16px)] h-px bg-gradient-to-r from-[#DC2626]/20 via-[#DC2626]/40 to-[#DC2626]/20" />

          {items.map((step, i) => (
            <div
              key={step.step}
              className="relative bg-[#1C0D0D] border border-white/5 hover:border-[#DC2626]/20 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 group"
            >
              {/* Step badge */}
              <div className="relative w-11 h-11 mb-5">
                <div className="absolute inset-0 bg-[#DC2626]/10 rounded-xl border border-[#DC2626]/20 group-hover:bg-[#DC2626]/15 transition-colors duration-200" />
                <span className="relative z-10 w-full h-full flex items-center justify-center font-display font-bold text-[#DC2626] text-sm">
                  {step.step}
                </span>
              </div>

              <span className="inline-block text-[#DC2626]/70 text-[11px] font-semibold mb-2">
                {step.duration}
              </span>
              <h3 className="font-display font-semibold text-white text-sm sm:text-base leading-snug mb-2.5">
                {step.title}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Step connector dot (desktop) */}
              {i < items.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-[22px] w-4 h-4 bg-[#DC2626]/20 border border-[#DC2626]/30 rounded-full z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
