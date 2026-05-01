"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Loader2, CheckCircle2,
  TrendingUp, Target, Film, BarChart3,
  Zap, ShoppingBag, Rocket, Megaphone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { serviceSchema, type ServiceInput } from "../schema"
import { createService, updateService } from "../actions"
import type { Service } from "@/types/database"

function toSlug(text: string) {
  return (
    text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || `service-${Date.now()}`
  )
}

// ── Icon system ────────────────────────────────────────────────────────────────
const ICON_OPTIONS = [
  { name: "TrendingUp", Icon: TrendingUp },
  { name: "Target",     Icon: Target },
  { name: "Film",       Icon: Film },
  { name: "BarChart3",  Icon: BarChart3 },
  { name: "Zap",        Icon: Zap },
  { name: "ShoppingBag",Icon: ShoppingBag },
  { name: "Rocket",     Icon: Rocket },
  { name: "Megaphone",  Icon: Megaphone },
]

// Gradient options — strings must be literals for Tailwind JIT
const COLOR_OPTIONS = [
  "from-red-600 to-rose-700",
  "from-rose-500 to-red-700",
  "from-amber-500 to-orange-600",
  "from-red-700 to-rose-800",
  "from-pink-500 to-rose-700",
  "from-rose-600 to-red-800",
  "from-orange-500 to-red-600",
  "from-slate-600 to-gray-700",
]

interface Props {
  service?: Service
}

export function ServiceForm({ service }: Props) {
  const isEdit = !!service
  const [serverError, setServerError] = useState<string | null>(null)
  // Features managed as textarea text, synced to form array
  const [featuresText, setFeaturesText] = useState(
    (service?.features ?? []).join("\n")
  )

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          title:          service.title,
          slug:           service.slug,
          category:       service.category ?? "service",
          tagline:        service.tagline ?? "",
          highlight:      service.highlight ?? "",
          icon:           service.icon ?? "",
          color:          service.color ?? COLOR_OPTIONS[0],
          short_desc:     service.short_desc ?? "",
          full_desc:      service.full_desc ?? "",
          features:       service.features ?? [],
          starting_price: service.starting_price ?? "",
          cta:            service.cta ?? "",
          badge:          service.badge ?? "",
          is_popular:     service.is_popular,
          is_active:      service.is_active,
          display_order:  service.display_order,
        }
      : {
          title: "", slug: "", category: "service",
          tagline: "", highlight: "", icon: "", color: COLOR_OPTIONS[0],
          short_desc: "", full_desc: "", features: [],
          starting_price: "", cta: "ติดต่อเลย", badge: "",
          is_popular: false, is_active: true, display_order: 0,
        },
  })

  const watched   = useWatch({ control })
  const category  = watched.category ?? "service"
  const icon      = watched.icon ?? ""
  const color     = watched.color ?? COLOR_OPTIONS[0]
  const isService = category === "service"

  const syncFeatures = (text: string) => {
    setFeaturesText(text)
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
    setValue("features", lines)
  }

  const onSubmit = async (data: ServiceInput) => {
    setServerError(null)
    try {
      if (isEdit && service) {
        await updateService(service.id, data)
      } else {
        await createService(data)
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่")
    }
  }

  // Preview data
  const features = (watched.features ?? []).filter(Boolean)
  const SelectedIcon = ICON_OPTIONS.find((o) => o.name === icon)?.Icon

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        {/* ประเภท */}
        <Section title="ประเภท">
          <div className="flex gap-3">
            {([
              { value: "service", label: "🛠 บริการ (ServicesDetail)" },
              { value: "pricing", label: "💰 แพ็กเกจ (PricingSection)" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("category", opt.value)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all",
                  category === opt.value
                    ? "bg-[#DC2626] border-[#DC2626] text-white"
                    : "bg-transparent border-white/10 text-slate-400 hover:text-white"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-1">
            {isService
              ? "แสดงในส่วน 4 บริการ บนหน้า /services"
              : "แสดงในส่วน แพ็กเกจราคา บนหน้า /services"}
          </p>
        </Section>

        {/* ข้อมูลหลัก */}
        <Section title="ข้อมูลหลัก">
          <Field label="ชื่อ" error={errors.title?.message} required>
            <input
              {...register("title", {
                onChange: (e) => { if (!isEdit) setValue("slug", toSlug(e.target.value)) },
              })}
              placeholder={isService ? "เช่น ยิงแอด GMV Max" : "เช่น Growth"}
              className={inputClass(!!errors.title)}
            />
          </Field>

          <Field label="Slug (URL)" error={errors.slug?.message} required>
            <input {...register("slug")} placeholder="gmv-max-ads" className={inputClass(!!errors.slug)} />
          </Field>

          {isService && (
            <Field label="Tagline (ประโยคสั้นใต้ชื่อ)">
              <input
                {...register("tagline")}
                placeholder="เช่น เพิ่มยอดขายด้วย ROI สูงสุด"
                className={inputClass(false)}
              />
            </Field>
          )}

          {isService && (
            <Field label="Highlight Badge (ตัวเลขโดดเด่น)">
              <input
                {...register("highlight")}
                placeholder="เช่น ROI เฉลี่ย 8–15x"
                className={inputClass(false)}
              />
            </Field>
          )}
        </Section>

        {/* ภาพลักษณ์ (สำหรับ service เท่านั้น) */}
        {isService && (
          <Section title="ภาพลักษณ์การ์ด">
            <Field label="ไอคอน">
              <div className="flex flex-wrap gap-2 mt-1">
                {ICON_OPTIONS.map(({ name, Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setValue("icon", name)}
                    title={name}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all",
                      icon === name
                        ? "border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626]"
                        : "border-white/10 text-slate-400 hover:text-white hover:border-white/30"
                    )}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </Field>

            <Field label="สีพื้นหลังการ์ด (gradient)">
              <div className="flex flex-wrap gap-2 mt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue("color", c)}
                    title={c}
                    className={cn(
                      "w-9 h-9 rounded-xl bg-gradient-to-br border-2 transition-all",
                      c,
                      color === c
                        ? "border-white shadow-lg scale-110"
                        : "border-transparent opacity-60 hover:opacity-90 hover:scale-105"
                    )}
                  />
                ))}
              </div>
            </Field>
          </Section>
        )}

        {/* รายละเอียด */}
        <Section title="รายละเอียด">
          <Field label={isService ? "คำอธิบาย (แสดงในการ์ด)" : "คำอธิบายแพ็กเกจ"}>
            <textarea
              {...register("short_desc")}
              rows={3}
              placeholder={isService
                ? "อธิบายสิ่งที่บริการนี้ทำ ประโยชน์ และวิธีการทำงาน"
                : "เหมาะสำหรับแบรนด์ที่..."}
              className={cn(inputClass(false), "resize-none")}
            />
          </Field>

          <Field label={isService ? "ประโยชน์ / สิ่งที่ได้รับ (1 บรรทัด = 1 ข้อ)" : "สิ่งที่รวมในแพ็กเกจ (1 บรรทัด = 1 ข้อ)"}>
            <textarea
              value={featuresText}
              onChange={(e) => syncFeatures(e.target.value)}
              rows={5}
              placeholder={isService
                ? "Setup campaign ถูกต้องตั้งแต่ต้น\nOptimize bid strategy ตาม product margin\nปรับ budget allocation แบบ real-time"
                : "GMV Max campaign (Ad budget ถึง 50K/เดือน)\nCreative 4 ชิ้น/เดือน\nWeekly report"}
              className={cn(inputClass(false), "resize-none font-mono text-xs")}
            />
            <p className="text-slate-600 text-xs mt-1">พิมพ์แต่ละข้อในบรรทัดใหม่</p>
          </Field>
        </Section>

        {/* ราคา (สำหรับ pricing หรือ service ที่มีราคา) */}
        <Section title={isService ? "ราคาเริ่มต้น (ถ้ามี)" : "ราคาและ CTA"}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="ราคา">
              <input
                {...register("starting_price")}
                placeholder={isService ? "เช่น 15,000" : "เช่น 30,000 หรือ ตามตกลง"}
                className={inputClass(false)}
              />
            </Field>
            <Field label="ปุ่ม CTA">
              <input
                {...register("cta")}
                placeholder="เช่น เลือกแพ็กเกจนี้"
                className={inputClass(false)}
              />
            </Field>
          </div>
          {!isService && (
            <Field label="Badge พิเศษ (เช่น แนะนำ)">
              <input
                {...register("badge")}
                placeholder="แนะนำ"
                className={inputClass(false)}
              />
            </Field>
          )}
        </Section>

        {/* การแสดงผล */}
        <Section title="การแสดงผล">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("is_active")} className="w-4 h-4 accent-[#DC2626]" />
              <span className="text-slate-300 text-sm">เปิดใช้งาน (แสดงบนหน้า /services)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("is_popular")} className="w-4 h-4 accent-[#DC2626]" />
              <span className="text-slate-300 text-sm">Highlight (เน้นการ์ดนี้)</span>
            </label>
          </div>
          <Field label="ลำดับแสดงผล">
            <input
              type="number"
              {...register("display_order", { valueAsNumber: true })}
              placeholder="0"
              className={cn(inputClass(false), "max-w-[120px]")}
            />
          </Field>
        </Section>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "บันทึกการแก้ไข" : "สร้างรายการ"}
          </button>
          <a href="/admin/services" className="text-slate-400 hover:text-white text-sm transition-colors">
            ยกเลิก
          </a>
        </div>
      </form>

      {/* ── Preview ── */}
      <div className="xl:sticky xl:top-6 space-y-3">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
          ตัวอย่าง
        </p>

        {isService ? (
          <ServiceCardPreview
            title={watched.title || "ชื่อบริการ"}
            tagline={watched.tagline || ""}
            highlight={watched.highlight || ""}
            desc={watched.short_desc || "คำอธิบายบริการ"}
            features={features}
            color={color}
            Icon={SelectedIcon}
          />
        ) : (
          <PricingCardPreview
            name={watched.title || "ชื่อแพ็กเกจ"}
            price={watched.starting_price || ""}
            desc={watched.short_desc || "คำอธิบายแพ็กเกจ"}
            features={features}
            cta={watched.cta || "ติดต่อเลย"}
            badge={watched.badge || ""}
            isPopular={watched.is_popular ?? false}
          />
        )}

        <p className="text-slate-600 text-[10px] text-center">
          {isService ? "ตัวอย่างการ์ดใน ServicesDetail" : "ตัวอย่างการ์ดใน PricingSection"}
        </p>
      </div>
    </div>
  )
}

// ── Service card preview ───────────────────────────────────────────────────────

function ServiceCardPreview({
  title, tagline, highlight, desc, features, color, Icon,
}: {
  title: string; tagline: string; highlight: string; desc: string
  features: string[]; color: string
  Icon?: React.ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-xl overflow-hidden text-xs">
      {/* Visual panel */}
      <div className={cn("relative p-5 bg-gradient-to-br min-h-28 flex flex-col justify-between", color)}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          {Icon ? <Icon size={16} className="text-white" /> : <div className="w-4 h-4 bg-white/40 rounded" />}
        </div>
        <div>
          {highlight && (
            <div className="inline-block bg-black/20 text-white text-[10px] px-2.5 py-0.5 rounded-full mb-1.5">
              {highlight}
            </div>
          )}
          <p className="font-bold text-white text-base leading-tight">{title}</p>
          {tagline && <p className="text-white/60 text-[10px] mt-0.5">{tagline}</p>}
        </div>
      </div>
      {/* Content panel */}
      <div className="p-4">
        {desc && <p className="text-slate-400 text-[10px] leading-relaxed mb-3 line-clamp-2">{desc}</p>}
        <ul className="space-y-1.5">
          {features.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={11} className="text-[#DC2626] shrink-0 mt-0.5" />
              <span className="text-slate-300 text-[10px] leading-tight">{f}</span>
            </li>
          ))}
          {features.length > 4 && (
            <li className="text-slate-500 text-[10px] pl-[15px]">+{features.length - 4} อื่นๆ</li>
          )}
        </ul>
      </div>
    </div>
  )
}

// ── Pricing card preview ───────────────────────────────────────────────────────

function PricingCardPreview({
  name, price, desc, features, cta, badge, isPopular,
}: {
  name: string; price: string; desc: string
  features: string[]; cta: string; badge: string; isPopular: boolean
}) {
  return (
    <div className={cn(
      "relative rounded-xl p-5 text-xs",
      isPopular ? "bg-[#DC2626] border border-[#FCA5A5]/30" : "bg-[#1C0D0D] border border-white/5"
    )}>
      {badge && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="bg-[#F59E0B] text-black text-[9px] font-bold px-3 py-0.5 rounded-full">
            {badge}
          </span>
        </div>
      )}
      <p className="font-bold text-white text-base mb-0.5">{name}</p>
      <p className={cn("text-[10px] mb-3", isPopular ? "text-red-100" : "text-slate-400")}>{desc}</p>
      {price && (
        <div className="mb-3">
          <span className="font-bold text-white text-xl">
            {price === "ตามตกลง" ? price : `฿${price}`}
          </span>
          {price !== "ตามตกลง" && (
            <span className={cn("text-[10px] ml-1", isPopular ? "text-red-100" : "text-slate-400")}>
              /เดือน
            </span>
          )}
        </div>
      )}
      <ul className="space-y-1.5 mb-4">
        {features.slice(0, 5).map((f, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <CheckCircle2 size={11} className={cn("shrink-0 mt-0.5", isPopular ? "text-red-100" : "text-[#DC2626]")} />
            <span className={cn("text-[10px] leading-tight", isPopular ? "text-white/80" : "text-slate-300")}>{f}</span>
          </li>
        ))}
        {features.length > 5 && (
          <li className={cn("text-[10px] pl-[15px]", isPopular ? "text-red-200" : "text-slate-500")}>
            +{features.length - 5} อื่นๆ
          </li>
        )}
      </ul>
      <div className={cn(
        "w-full text-center py-2 rounded-lg text-[11px] font-semibold",
        isPopular ? "bg-white text-[#DC2626]" : "bg-[#DC2626]/10 text-[#FCA5A5] border border-[#DC2626]/20"
      )}>
        {cta || "ติดต่อเลย"}
      </div>
    </div>
  )
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-6 space-y-4">
      <h2 className="text-white font-semibold text-sm">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label, error, required, children,
}: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-slate-300 text-xs font-medium">
        {label}{required && <span className="text-[#DC2626] ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full bg-[#0A0808] border rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600",
    "focus:outline-none focus:ring-2 transition-colors appearance-none",
    hasError
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-white/10 focus:border-[#DC2626]/50 focus:ring-[#DC2626]/20"
  )
}
