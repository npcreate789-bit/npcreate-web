import { TrendingUp, Target, Film, BarChart3, CheckCircle2 } from "lucide-react"

const services = [
  {
    icon: TrendingUp,
    title: "ยิงแอด GMV Max",
    tagline: "เพิ่มยอดขายด้วย ROAS สูงสุด",
    description:
      "GMV Max คือระบบโฆษณาของ TikTok Shop ที่ออปติไมซ์เพื่อเพิ่มยอดขายโดยตรง ไม่ใช่แค่ impression หรือ click เราจัดการ campaign ตั้งแต่ setup จนถึง daily optimization เพื่อให้ได้ ROAS สูงสุดในทุกบาทที่ลงทุน",
    benefits: [
      "Setup campaign ถูกต้องตั้งแต่ต้น ไม่เสียงบเปล่า",
      "Optimize bid strategy ตาม product margin",
      "ปรับ budget allocation แบบ real-time",
      "Monitor และแก้ปัญหา campaign ทุกวัน",
    ],
    highlight: "ROAS เฉลี่ย 8–15x",
    color: "from-violet-500 to-indigo-600",
  },
  {
    icon: Target,
    title: "วางกลยุทธ์ TikTok Shop",
    tagline: "แผนการตลาดแบบครบวงจร",
    description:
      "ก่อนยิงแอด ต้องมีกลยุทธ์ที่แม่นยำ เราวิเคราะห์ shop คุณ คู่แข่ง และ market opportunity จากนั้นวางแผน pricing, bundling, campaign calendar และ KPI ที่ชัดเจนรายเดือน",
    benefits: [
      "วิเคราะห์คู่แข่งและ pricing strategy",
      "วาง campaign calendar ล่วงหน้า",
      "กำหนด KPI และ success metrics",
      "ปรับแผนตาม data ทุกเดือน",
    ],
    highlight: "แผนรายเดือน + KPI ชัดเจน",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Film,
    title: "Content & Creative",
    tagline: "Creative ที่ convert ไม่ใช่แค่สวย",
    description:
      "Creative คือหัวใจของโฆษณา TikTok เราออกแบบและผลิต creative ที่เน้น conversion สูง ทำ A/B testing เพื่อหา winning creative แล้ว scale งบไปกับสิ่งที่ work จริง",
    benefits: [
      "Creative brief ที่มาจาก data ไม่ใช่ความรู้สึก",
      "A/B testing ทุก creative อย่างเป็นระบบ",
      "Thumbnail และ hook ที่ดึงดูด attention",
      "Scale งบกับ winning creative ที่พิสูจน์แล้ว",
    ],
    highlight: "A/B Testing ทุก creative",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: BarChart3,
    title: "รายงานผล & วิเคราะห์",
    tagline: "ข้อมูลโปร่งใส ดูได้ทุกวัน",
    description:
      "เราให้ความโปร่งใสเต็มที่ — access dashboard โฆษณาตรง ไม่ปิดบังตัวเลข รายงานรายสัปดาห์วิเคราะห์สิ่งที่ทำ ผลที่ได้ และแผนสัปดาห์ถัดไปอย่างละเอียด",
    benefits: [
      "Weekly report ทุกจันทร์",
      "Dashboard access โดยตรง ไม่ผ่านคนกลาง",
      "วิเคราะห์ตัวเลขเชิงลึก ไม่ใช่แค่ screenshot",
      "Monthly review call เพื่อ align strategy",
    ],
    highlight: "Weekly Report + Dashboard Access",
    color: "from-sky-500 to-blue-600",
  },
]

export function ServicesDetail() {
  return (
    <section className="py-20 bg-[#0F172A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="space-y-6">
          {services.map((service, i) => {
            const Icon = service.icon
            const isEven = i % 2 === 0
            return (
              <div
                key={service.title}
                className="grid md:grid-cols-2 gap-0 bg-[#1E293B] border border-white/5 rounded-2xl overflow-hidden"
              >
                {/* Visual side */}
                <div
                  className={`relative p-10 bg-gradient-to-br ${service.color} flex flex-col justify-between min-h-56 ${isEven ? "md:order-first" : "md:order-last"}`}
                >
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Icon size={26} className="text-white" />
                  </div>
                  <div>
                    <div className="inline-block bg-black/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                      {service.highlight}
                    </div>
                    <h3 className="font-display font-bold text-white text-2xl sm:text-3xl leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-white/60 text-sm mt-2">{service.tagline}</p>
                  </div>
                  {/* Watermark number */}
                  <span className="absolute top-4 right-6 font-display font-black text-7xl text-white/10 select-none leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Content side */}
                <div className="p-8 sm:p-10 flex flex-col justify-center">
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-3">
                    {service.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
