import { Clock, MessageCircle, Shield } from "lucide-react"

function buildChannels(lineHref: string) {
  return [
    {
      icon: MessageCircle,
      title: "Line OA",
      value: "@npcreate",
      description: "ช่องทางหลัก — ตอบเร็วที่สุด",
      href: lineHref,
      color: "text-[#06C755]",
      bg: "bg-[#06C755]/10",
    },
    {
      icon: Clock,
      title: "เวลาทำการ",
      value: "09:00 – 20:00 น.",
      description: "จันทร์ – อาทิตย์",
      color: "text-[#DC2626]",
      bg: "bg-[#DC2626]/10",
    },
    {
      icon: Shield,
      title: "รับประกัน",
      value: "ตอบกลับใน 1 ชม.",
      description: "ในเวลาทำการ ไม่ทำให้รอนาน",
      color: "text-[#DC2626]",
      bg: "bg-[#DC2626]/10",
    },
  ]
}

export function ContactInfo({ lineHref = "/api/auth/line" }: { lineHref?: string }) {
  const channels = buildChannels(lineHref)
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {channels.map((ch) => {
        const Icon = ch.icon
        const content = (
          <div className="flex flex-col gap-2 bg-[#1C0D0D] border border-white/5 rounded-xl p-4 h-full">
            <div className={`w-9 h-9 ${ch.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={16} className={ch.color} />
            </div>
            <div>
              <p className="text-slate-400 text-xs">{ch.title}</p>
              <p className="text-white font-semibold text-sm mt-0.5">{ch.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{ch.description}</p>
            </div>
          </div>
        )

        return ch.href ? (
          <a key={ch.title} href={ch.href} className="block hover:opacity-80 transition-opacity">
            {content}
          </a>
        ) : (
          <div key={ch.title}>{content}</div>
        )
      })}
    </div>
  )
}
