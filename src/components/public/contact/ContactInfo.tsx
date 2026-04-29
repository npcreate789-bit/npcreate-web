import { Clock, MessageCircle, Shield } from "lucide-react"

const channels = [
  {
    icon: MessageCircle,
    title: "Line OA",
    value: "@npcreate",
    description: "ช่องทางหลัก — ตอบเร็วที่สุด",
    href: "https://lin.ee/XXXXXXX",
    color: "text-[#06C755]",
    bg: "bg-[#06C755]/10",
  },
  {
    icon: Clock,
    title: "เวลาทำการ",
    value: "09:00 – 20:00 น.",
    description: "จันทร์ – อาทิตย์",
    color: "text-[#6366F1]",
    bg: "bg-[#6366F1]/10",
  },
  {
    icon: Shield,
    title: "รับประกัน",
    value: "ตอบกลับใน 1 ชม.",
    description: "ในเวลาทำการ ไม่ทำให้รอนาน",
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
  },
]

export function ContactInfo() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-white text-2xl mb-2">
          ติดต่อเราได้เลย
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          กรอกฟอร์มด้านขวา หรือทักหา Line OA โดยตรง เราพร้อมให้คำปรึกษาฟรีโดยไม่มีข้อผูกมัด
        </p>
      </div>

      <div className="space-y-3">
        {channels.map((ch) => {
          const Icon = ch.icon
          const content = (
            <div className="flex items-start gap-4 bg-[#1E293B] border border-white/5 rounded-xl p-4">
              <div className={`w-10 h-10 ${ch.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={18} className={ch.color} />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{ch.title}</p>
                <p className="text-white font-semibold text-sm mt-0.5">{ch.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{ch.description}</p>
              </div>
            </div>
          )

          return ch.href ? (
            <a
              key={ch.title}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              {content}
            </a>
          ) : (
            <div key={ch.title}>{content}</div>
          )
        })}
      </div>

      {/* Direct Line CTA */}
      <a
        href="https://lin.ee/XXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-[#06C755] hover:bg-[#05a847] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
      >
        <LineIcon />
        ทักหาเราผ่าน Line OA เลย
      </a>

      <p className="text-slate-500 text-xs text-center">
        ปรึกษาฟรี · ไม่มีข้อผูกมัด · ไม่ต้องรอนาน
      </p>
    </div>
  )
}

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}
