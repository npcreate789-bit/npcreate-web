import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Service } from "@/types/database"

// Hardcoded fallback shown before any DB data exists
const FALLBACK = [
  {
    title: "Starter",
    short_desc: "เหมาะสำหรับแบรนด์ที่เพิ่งเริ่มต้นบน TikTok Shop",
    starting_price: "15,000",
    cta: "เริ่มต้น",
    badge: null as string | null,
    is_popular: false,
    features: [
      "GMV Max campaign (Ad budget ถึง 50K/เดือน)",
      "Creative 4 ชิ้น/เดือน",
      "Weekly report",
      "Line support",
      "Monthly review",
    ],
  },
  {
    title: "Growth",
    short_desc: "สำหรับแบรนด์ที่ต้องการเติบโตอย่างจริงจัง",
    starting_price: "30,000",
    cta: "เลือกแพ็กเกจนี้",
    badge: "แนะนำ" as string | null,
    is_popular: true,
    features: [
      "GMV Max campaign (Ad budget ไม่จำกัด)",
      "Creative 8 ชิ้น/เดือน + A/B testing",
      "Strategy รายเดือน",
      "Daily optimization",
      "Line + Video call support",
      "Competitor analysis",
    ],
  },
  {
    title: "Scale",
    short_desc: "สำหรับแบรนด์ที่ต้องการ scale ยอดขายอย่างก้าวกระโดด",
    starting_price: "ตามตกลง",
    cta: "ติดต่อเพื่อปรึกษา",
    badge: null as string | null,
    is_popular: false,
    features: [
      "ทุกอย่างใน Growth",
      "Dedicated account manager",
      "Advanced A/B testing framework",
      "Multi-product campaign management",
      "Weekly strategy call",
      "Priority support ตลอด 24 ชม.",
    ],
  },
]

type PlanItem = Pick<Service, "title" | "short_desc" | "starting_price" | "cta" | "badge" | "is_popular" | "features">

interface Props {
  plans?: Service[]
  lineHref?: string
  label?: string
  heading?: string
  subtext?: string
}

export function PricingSection({
  plans,
  lineHref = "/api/auth/line",
  label = "แพ็กเกจราคา",
  heading = "เลือกแพ็กเกจที่เหมาะกับคุณ",
  subtext = "ทุกแพ็กเกจรายเดือน ไม่มีสัญญาผูกมัดระยะยาว",
}: Props) {
  const items: PlanItem[] = plans && plans.length > 0 ? plans : FALLBACK

  return (
    <section className="py-14 bg-[#0A0808]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-[#DC2626] text-xs font-bold uppercase tracking-[0.2em]">
            {label}
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3 leading-snug">
            {heading}
          </h2>
          {subtext && <p className="text-slate-400 text-sm mt-3">{subtext}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((plan) => (
            <div
              key={plan.title}
              className={cn(
                "relative rounded-2xl p-7 flex flex-col",
                plan.is_popular
                  ? "bg-[#DC2626] border border-[#FCA5A5]/30 shadow-2xl shadow-red-900/40"
                  : "bg-[#1C0D0D] border border-white/5"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#F59E0B] text-black text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-bold text-xl text-white mb-1">{plan.title}</h3>
                <p className={cn("text-sm", plan.is_popular ? "text-red-100" : "text-slate-400")}>
                  {plan.short_desc}
                </p>
              </div>

              {plan.starting_price && (
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="font-display font-bold text-3xl text-white">
                      {plan.starting_price === "ตามตกลง" ? plan.starting_price : `฿${plan.starting_price}`}
                    </span>
                    {plan.starting_price !== "ตามตกลง" && (
                      <span className={cn("text-sm mb-1", plan.is_popular ? "text-red-100" : "text-slate-400")}>
                        /เดือน
                      </span>
                    )}
                  </div>
                </div>
              )}

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={15}
                      className={cn("shrink-0 mt-0.5", plan.is_popular ? "text-red-100" : "text-[#DC2626]")}
                    />
                    <span className={cn("text-sm", plan.is_popular ? "text-white/80" : "text-slate-300")}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={lineHref}
                className={cn(
                  "w-full inline-flex items-center justify-center font-semibold text-sm py-3 rounded-xl transition-colors",
                  plan.is_popular
                    ? "bg-white text-[#DC2626] hover:bg-red-50"
                    : "bg-[#DC2626]/10 text-[#FCA5A5] hover:bg-[#DC2626]/20 border border-[#DC2626]/20"
                )}
              >
                {plan.cta ?? "ติดต่อเลย"}
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
