import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Testimonial } from "@/types/database"

interface Props {
  testimonials: Testimonial[]
}

export function TestimonialsSection({ testimonials }: Props) {
  if (testimonials.length === 0) return null

  return (
    <section className="py-24 bg-[#0A0808]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest">
            รีวิวจากลูกค้า
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3">
            ผลลัพธ์ที่แบรนด์ได้รับจริง
          </h2>
          <p className="text-slate-400 mt-4">
            ไม่ใช่แค่ตัวเลข — ประสบการณ์จากแบรนด์ที่เราดูแลมาแล้ว
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  const initials = t.client_name.charAt(0).toUpperCase()
  const displayText = t.short_quote || t.content

  return (
    <div
      className={cn(
        "flex flex-col bg-[#1C0D0D] border rounded-2xl p-6",
        t.is_featured
          ? "border-[#DC2626]/30 shadow-lg shadow-red-900/10"
          : "border-white/5"
      )}
    >
      {/* Stars */}
      {t.rating && (
        <div className="flex gap-0.5 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={14}
              className={t.rating! >= n ? "text-[#F59E0B] fill-[#F59E0B]" : "text-slate-700"}
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <p className="text-slate-300 text-sm leading-relaxed flex-1 italic mb-5">
        &ldquo;{displayText}&rdquo;
      </p>

      {/* Client */}
      <div className="flex items-center gap-3 mt-auto">
        <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden bg-[#DC2626]/20 flex items-center justify-center">
          {t.client_avatar ? (
            <img
              src={t.client_avatar}
              alt={t.client_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[#DC2626] font-bold text-sm">{initials}</span>
          )}
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">{t.client_name}</p>
          {(t.client_role || t.client_company) && (
            <p className="text-slate-500 text-xs mt-0.5">
              {[t.client_role, t.client_company].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
