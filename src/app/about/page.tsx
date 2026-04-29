import type { Metadata } from "next"
import { CheckCircle2, Target, Eye, Heart, Zap } from "lucide-react"
import { CTASection } from "@/components/public/CTASection"

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "NP Create คือทีมผู้เชี่ยวชาญด้าน TikTok Shop GMV Max ดูแลแบรนด์กว่า 50 ราย สร้างยอดขายรวมทะลุ 100 ล้านบาท",
}

const values = [
  {
    icon: Target,
    title: "เน้นผลลัพธ์จริง",
    description:
      "ทุกการตัดสินใจมาจากข้อมูล ไม่ใช่ความรู้สึก เราวัดความสำเร็จด้วยยอดขายจริงของลูกค้า",
  },
  {
    icon: Eye,
    title: "โปร่งใสทุกขั้นตอน",
    description:
      "ให้ access dashboard โฆษณาตรง รายงานทุกสัปดาห์ ไม่มีตัวเลขสวยหรูที่ไม่ตรงความจริง",
  },
  {
    icon: Heart,
    title: "ดูแลเหมือนธุรกิจตัวเอง",
    description:
      "เราโฟกัสแบรนด์ที่รับดูแลอย่างจำกัด เพื่อให้ทุกแบรนด์ได้รับความใส่ใจอย่างเต็มที่",
  },
  {
    icon: Zap,
    title: "เชี่ยวชาญเฉพาะทาง",
    description:
      "ไม่กระจายทำหลาย platform เราโฟกัสเฉพาะ TikTok Shop GMV Max ซึ่งทำให้ผลลัพธ์ดีกว่าเอเจนซีทั่วไป",
  },
]

const milestones = [
  { year: "2022", title: "จุดเริ่มต้น", desc: "เริ่มทดลองยิงแอด TikTok Shop ในยุคที่ยังไม่มีใครทำ" },
  { year: "2023", title: "GMV Max", desc: "เป็นหนึ่งในทีมแรกๆ ที่ใช้ GMV Max และค้นพบ formula ที่ work" },
  { year: "2024", title: "100 ล้าน", desc: "สะสม GMV ทะลุ 100 ล้านบาท ดูแลแบรนด์ครบ 50 ราย" },
  { year: "2025", title: "NP Create", desc: "เปิดเป็น agency อย่างเป็นทางการ รับดูแลแบรนด์คัดสรร" },
]

const stats = [
  { value: "50+", label: "แบรนด์ที่ดูแล" },
  { value: "100M+", label: "GMV รวม (บาท)" },
  { value: "3 ปี", label: "ประสบการณ์ TikTok Shop" },
  { value: "10x", label: "Growth เฉลี่ย" },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] pt-24">

      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6366F1]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-[#6366F1] text-sm font-semibold uppercase tracking-widest">
              เกี่ยวกับเรา
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-6 leading-tight">
              ทีมผู้เชี่ยวชาญ
              <br />
              <span className="text-[#6366F1]">TikTok Shop GMV Max</span>
              <br />
              โดยเฉพาะ
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              NP Create เกิดจากความเชื่อที่ว่า — การยิงแอด TikTok Shop ให้ได้ผลจริงต้องการความเชี่ยวชาญเฉพาะทาง
              ไม่ใช่แค่เปิด campaign ตามคู่มือ
            </p>
            <p className="text-slate-400 text-lg leading-relaxed">
              เราเริ่มต้นจากการทดลอง ล้มเหลว และเรียนรู้กับระบบ GMV Max มาตั้งแต่ยุคแรก
              จนค้นพบ formula ที่ทำให้แบรนด์กว่า <span className="text-white font-semibold">50 ราย</span> เติบโตอย่างมีนัยสำคัญ
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-[#0A0F1E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-3xl sm:text-4xl text-[#F59E0B]">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story / Timeline */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[#10B981] text-sm font-semibold uppercase tracking-widest">
                เรื่องราวของเรา
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3 mb-6">
                จากการทดลอง
                <br />
                สู่ผลลัพธ์ที่พิสูจน์แล้ว
              </h2>
              <p className="text-slate-400 leading-relaxed mb-5">
                ในยุคที่ TikTok Shop เพิ่งเริ่มต้นในไทย เราเริ่มทดลองยิงแอดในแบบที่ยังไม่มีคู่มือ
                ใช้เวลากว่า 2 ปีในการทำความเข้าใจ algorithm ของ GMV Max อย่างลึกซึ้ง
              </p>
              <p className="text-slate-400 leading-relaxed">
                ทุกครั้งที่ campaign ล้มเหลว เราเรียนรู้ว่าอะไรไม่ work ทุกครั้งที่สำเร็จ เราบันทึกว่าอะไร work
                ผลลัพธ์ที่ได้คือ framework ที่ทดสอบมาแล้วกับแบรนด์กว่า 50 ราย ในหลากหลาย category
              </p>
            </div>

            <div className="space-y-0">
              {milestones.map((m, i) => (
                <div key={m.year} className="flex gap-5">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-center justify-center shrink-0">
                      <span className="text-[#6366F1] text-xs font-bold">{m.year}</span>
                    </div>
                    {i < milestones.length - 1 && (
                      <div className="w-px flex-1 bg-white/5 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`pb-8 ${i === milestones.length - 1 ? "pb-0" : ""}`}>
                    <h3 className="font-semibold text-white text-sm mb-1">{m.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#0A0F1E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[#6366F1] text-sm font-semibold uppercase tracking-widest">
              สิ่งที่เราเชื่อ
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3">
              ค่านิยมของเรา
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <div
                  key={v.title}
                  className="flex gap-4 bg-[#1E293B] border border-white/5 rounded-2xl p-6"
                >
                  <div className="w-11 h-11 bg-[#6366F1]/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-[#6366F1]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">{v.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{v.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why boutique */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#10B981] text-sm font-semibold uppercase tracking-widest">
            ทำไมถึงรับแบรนด์จำกัด
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3 mb-6">
            คุณภาพ {'>'} ปริมาณ
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            เราเลือกที่จะดูแลแบรนด์ในจำนวนจำกัด เพราะเชื่อว่าทุกแบรนด์ที่รับดูแล
            สมควรได้รับความใส่ใจและ strategy ที่ออกแบบมาเฉพาะ ไม่ใช่ template สำเร็จรูป
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "ไม่ outsource งานให้ freelance",
              "ทีมงานประจำดูแลตรง",
              "รับสล็อตจำกัดต่อเดือน",
              "Strategy ที่ custom ทุกแบรนด์",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                <CheckCircle2 size={15} className="text-[#10B981] shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  )
}
