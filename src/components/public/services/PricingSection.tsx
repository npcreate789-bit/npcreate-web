import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Starter",
    price: "15,000",
    description: "เหมาะสำหรับแบรนด์ที่เพิ่งเริ่มต้นบน TikTok Shop",
    features: [
      "GMV Max campaign (Ad budget ถึง 50K/เดือน)",
      "Creative 4 ชิ้น/เดือน",
      "Weekly report",
      "Line support",
      "Monthly review",
    ],
    cta: "เริ่มต้น",
    highlight: false,
  },
  {
    name: "Growth",
    price: "30,000",
    description: "สำหรับแบรนด์ที่ต้องการเติบโตอย่างจริงจัง",
    features: [
      "GMV Max campaign (Ad budget ไม่จำกัด)",
      "Creative 8 ชิ้น/เดือน + A/B testing",
      "Strategy รายเดือน",
      "Daily optimization",
      "Line + Video call support",
      "Competitor analysis",
    ],
    cta: "เลือกแพ็กเกจนี้",
    highlight: true,
    badge: "แนะนำ",
  },
  {
    name: "Scale",
    price: "ตามตกลง",
    description: "สำหรับแบรนด์ที่ต้องการ scale ยอดขายอย่างก้าวกระโดด",
    features: [
      "ทุกอย่างใน Growth",
      "Dedicated account manager",
      "Advanced A/B testing framework",
      "Multi-product campaign management",
      "Weekly strategy call",
      "Priority support ตลอด 24 ชม.",
    ],
    cta: "ติดต่อเพื่อปรึกษา",
    highlight: false,
  },
]

export function PricingSection() {
  return (
    <section className="py-20 bg-[#0F172A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-[#6366F1] text-sm font-semibold uppercase tracking-widest">
            แพ็กเกจราคา
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3">
            เลือกแพ็กเกจที่เหมาะกับคุณ
          </h2>
          <p className="text-slate-400 mt-4">
            ทุกแพ็กเกจรายเดือน ไม่มีสัญญาผูกมัดระยะยาว
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-7 flex flex-col",
                plan.highlight
                  ? "bg-[#6366F1] border border-[#818CF8]/30 shadow-2xl shadow-indigo-900/40"
                  : "bg-[#1E293B] border border-white/5"
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
                <h3
                  className={cn(
                    "font-display font-bold text-xl mb-1",
                    plan.highlight ? "text-white" : "text-white"
                  )}
                >
                  {plan.name}
                </h3>
                <p className={cn("text-sm", plan.highlight ? "text-indigo-200" : "text-slate-400")}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span
                    className={cn(
                      "font-display font-bold text-3xl",
                      plan.highlight ? "text-white" : "text-white"
                    )}
                  >
                    {plan.price === "ตามตกลง" ? plan.price : `฿${plan.price}`}
                  </span>
                  {plan.price !== "ตามตกลง" && (
                    <span className={cn("text-sm mb-1", plan.highlight ? "text-indigo-200" : "text-slate-400")}>
                      /เดือน
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={15}
                      className={cn("shrink-0 mt-0.5", plan.highlight ? "text-indigo-200" : "text-[#10B981]")}
                    />
                    <span
                      className={cn("text-sm", plan.highlight ? "text-indigo-100" : "text-slate-300")}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="https://lin.ee/XXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-full inline-flex items-center justify-center font-semibold text-sm py-3 rounded-xl transition-colors",
                  plan.highlight
                    ? "bg-white text-[#6366F1] hover:bg-indigo-50"
                    : "bg-[#6366F1]/10 text-[#818CF8] hover:bg-[#6366F1]/20 border border-[#6366F1]/20"
                )}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          ราคายังไม่รวม Ad budget · สามารถปรับแพ็กเกจตามความต้องการได้
        </p>
      </div>
    </section>
  )
}
