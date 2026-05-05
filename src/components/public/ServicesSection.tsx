import { TrendingUp, Target, Film, BarChart3 } from "lucide-react"
import type { HomepageSettings } from "@/lib/data/homepage"

const CARDS = [
  {
    num: "01",
    icon: TrendingUp,
    title: "ยิงแอด GMV Max",
    description: "เพิ่มยอดขายด้วยระบบโฆษณา GMV Max ของ TikTok Shop ที่ออปติไมซ์ให้ได้ ROI สูงสุด",
    highlight: "เฉลี่ย ROI 8–15x",
    color: "from-[#DC2626]/20 to-[#DC2626]/5",
    iconBg: "bg-[#DC2626]/15",
    iconColor: "text-[#DC2626]",
    border: "hover:border-[#DC2626]/40",
    glow: "hover:shadow-[#DC2626]/10",
  },
  {
    num: "02",
    icon: Target,
    title: "วางกลยุทธ์ TikTok Shop",
    description: "วิเคราะห์คู่แข่ง หาโอกาส และวางแผนการตลาดแบบครบวงจร ตั้งแต่ pricing ถึง campaign",
    highlight: "แผนรายเดือน",
    color: "from-indigo-500/20 to-indigo-500/5",
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-400",
    border: "hover:border-indigo-500/40",
    glow: "hover:shadow-indigo-500/10",
  },
  {
    num: "03",
    icon: Film,
    title: "Content & Creative",
    description: "ผลิต creative สำหรับยิงแอด ทำ thumbnail ที่ดึงดูด และ optimize เนื้อหาให้ convert",
    highlight: "A/B Testing ทุก creative",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    border: "hover:border-emerald-500/40",
    glow: "hover:shadow-emerald-500/10",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "รายงานผล & วิเคราะห์",
    description: "Dashboard รายสัปดาห์ วิเคราะห์ข้อมูลเชิงลึก และปรับ strategy แบบ real-time",
    highlight: "Weekly Report",
    color: "from-[#F59E0B]/20 to-[#F59E0B]/5",
    iconBg: "bg-[#F59E0B]/15",
    iconColor: "text-[#F59E0B]",
    border: "hover:border-[#F59E0B]/40",
    glow: "hover:shadow-[#F59E0B]/10",
  },
]

interface Props {
  settings: HomepageSettings["services_section"]
}

export function ServicesSection({ settings }: Props) {
  return (
    <section className="pt-2 pb-14 bg-[#0A0808]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-[#DC2626]/50" />
            <span className="text-[#DC2626] text-xs font-bold uppercase tracking-[0.2em]">
              {settings.badge}
            </span>
            <div className="h-px w-8 bg-[#DC2626]/50" />
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            {settings.heading}
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed">
            {settings.subtext}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CARDS.map((service) => {
            const Icon = service.icon
            return (
              <div
                key={service.title}
                className={`group relative bg-[#120808] border border-white/5 ${service.border} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${service.glow} overflow-hidden`}
              >
                {/* Gradient background top */}
                <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${service.color} opacity-60 pointer-events-none`} />

                {/* Number watermark */}
                <span className="absolute top-3 right-4 font-display font-black text-5xl text-white/[0.04] select-none leading-none">
                  {service.num}
                </span>

                <div className="relative">
                  {/* Icon */}
                  <div className={`w-11 h-11 ${service.iconBg} rounded-xl flex items-center justify-center mb-5`}>
                    <Icon size={20} className={service.iconColor} />
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-white text-base mb-2 leading-snug">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">
                    {service.description}
                  </p>

                  {/* Tag */}
                  <span className="inline-flex items-center gap-1.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold px-3 py-1 rounded-full border border-[#F59E0B]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    {service.highlight}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
