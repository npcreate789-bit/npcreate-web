import {
  TrendingUp, Target, Film, BarChart3,
  Zap, ShoppingBag, Rocket, Megaphone,
  CheckCircle2, type LucideIcon,
} from "lucide-react"
import type { Service } from "@/types/database"

// Map icon name string → lucide component
const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp, Target, Film, BarChart3,
  Zap, ShoppingBag, Rocket, Megaphone,
}

// Hardcoded fallback shown before any DB data exists
const FALLBACK: Omit<Service, "id" | "slug" | "category" | "starting_price" | "cta" | "badge" | "is_popular" | "display_order" | "is_active" | "created_at" | "updated_at" | "full_desc">[] = [
  {
    title: "ยิงแอด GMV Max",
    tagline: "เพิ่มยอดขายด้วย ROI สูงสุด",
    short_desc: "GMV Max คือระบบโฆษณาของ TikTok Shop ที่ออปติไมซ์เพื่อเพิ่มยอดขายโดยตรง เราจัดการ campaign ตั้งแต่ setup จนถึง daily optimization เพื่อให้ได้ ROI สูงสุด",
    highlight: "ROI เฉลี่ย 8–15x",
    icon: "TrendingUp",
    color: "from-red-600 to-rose-700",
    features: [
      "Setup campaign ถูกต้องตั้งแต่ต้น ไม่เสียงบเปล่า",
      "Optimize bid strategy ตาม product margin",
      "ปรับ budget allocation แบบ real-time",
      "Monitor และแก้ปัญหา campaign ทุกวัน",
    ],
  },
  {
    title: "วางกลยุทธ์ TikTok Shop",
    tagline: "แผนการตลาดแบบครบวงจร",
    short_desc: "ก่อนยิงแอด ต้องมีกลยุทธ์ที่แม่นยำ เราวิเคราะห์ shop คุณ คู่แข่ง และ market opportunity จากนั้นวางแผน pricing, bundling, campaign calendar และ KPI ที่ชัดเจนรายเดือน",
    highlight: "แผนรายเดือน + KPI ชัดเจน",
    icon: "Target",
    color: "from-rose-500 to-red-700",
    features: [
      "วิเคราะห์คู่แข่งและ pricing strategy",
      "วาง campaign calendar ล่วงหน้า",
      "กำหนด KPI และ success metrics",
      "ปรับแผนตาม data ทุกเดือน",
    ],
  },
  {
    title: "Content & Creative",
    tagline: "Creative ที่ convert ไม่ใช่แค่สวย",
    short_desc: "Creative คือหัวใจของโฆษณา TikTok เราออกแบบและผลิต creative ที่เน้น conversion สูง ทำ A/B testing เพื่อหา winning creative แล้ว scale งบไปกับสิ่งที่ work จริง",
    highlight: "A/B Testing ทุก creative",
    icon: "Film",
    color: "from-amber-500 to-orange-600",
    features: [
      "Creative brief ที่มาจาก data ไม่ใช่ความรู้สึก",
      "A/B testing ทุก creative อย่างเป็นระบบ",
      "Thumbnail และ hook ที่ดึงดูด attention",
      "Scale งบกับ winning creative ที่พิสูจน์แล้ว",
    ],
  },
  {
    title: "รายงานผล & วิเคราะห์",
    tagline: "ข้อมูลโปร่งใส ดูได้ทุกวัน",
    short_desc: "เราให้ความโปร่งใสเต็มที่ — access dashboard โฆษณาตรง ไม่ปิดบังตัวเลข รายงานรายสัปดาห์วิเคราะห์สิ่งที่ทำ ผลที่ได้ และแผนสัปดาห์ถัดไปอย่างละเอียด",
    highlight: "Weekly Report + Dashboard Access",
    icon: "BarChart3",
    color: "from-red-700 to-rose-800",
    features: [
      "Weekly report ทุกจันทร์",
      "Dashboard access โดยตรง ไม่ผ่านคนกลาง",
      "วิเคราะห์ตัวเลขเชิงลึก ไม่ใช่แค่ screenshot",
      "Monthly review call เพื่อ align strategy",
    ],
  },
]

interface Props {
  services?: Service[]
}

export function ServicesDetail({ services }: Props) {
  const items = services && services.length > 0 ? services : FALLBACK

  return (
    <section className="py-20 bg-[#0A0808]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="space-y-6">
          {items.map((service, i) => {
            const Icon = ICON_MAP[service.icon ?? ""] ?? null
            const isEven = i % 2 === 0
            return (
              <div
                key={service.title}
                className="grid md:grid-cols-2 gap-0 bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden"
              >
                {/* Visual side */}
                <div
                  className={`relative p-10 bg-gradient-to-br ${service.color} flex flex-col justify-between min-h-56 ${isEven ? "md:order-first" : "md:order-last"}`}
                >
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    {Icon
                      ? <Icon size={26} className="text-white" />
                      : <span className="text-white text-2xl">{service.icon}</span>
                    }
                  </div>
                  <div>
                    {service.highlight && (
                      <div className="inline-block bg-black/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                        {service.highlight}
                      </div>
                    )}
                    <h3 className="font-display font-bold text-white text-2xl sm:text-3xl leading-tight">
                      {service.title}
                    </h3>
                    {service.tagline && (
                      <p className="text-white/60 text-sm mt-2">{service.tagline}</p>
                    )}
                  </div>
                  <span className="absolute top-4 right-6 font-display font-black text-7xl text-white/10 select-none leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Content side */}
                <div className="p-8 sm:p-10 flex flex-col justify-center">
                  {service.short_desc && (
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      {service.short_desc}
                    </p>
                  )}
                  {service.features.length > 0 && (
                    <ul className="space-y-3">
                      {service.features.map((benefit, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <CheckCircle2 size={16} className="text-[#DC2626] shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
