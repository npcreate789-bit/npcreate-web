const steps = [
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

export function ProcessSection() {
  return (
    <section className="py-20 bg-[#0A0404]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">
            ขั้นตอนการทำงาน
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3">
            เริ่มต้นอย่างไร
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">
            ตั้งแต่วันแรกที่ติดต่อจนถึงการเห็นผลลัพธ์จริง
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {steps.map((step) => (
            <div key={step.step} className="relative bg-[#1C0D0D] border border-white/5 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 flex items-center justify-center mb-5">
                <span className="font-display font-bold text-[#DC2626] text-sm">{step.step}</span>
              </div>
              <span className="text-[#DC2626] text-xs font-medium">{step.duration}</span>
              <h3 className="font-display font-semibold text-white text-base mt-2 mb-3">
                {step.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
