import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { Service } from "@/types/database"
import { ServiceRowActions } from "./_components/ServiceRowActions"
import { ServicesPageSettingsForm } from "./_components/ServicesPageSettingsForm"
import { mergeServicesPage } from "@/lib/data/services-page"

export default async function ServicesAdminPage() {
  const supabase = await createClient()

  const [{ data: services }, { data: pageData }] = await Promise.all([
    supabase.from("services").select("*").order("category").order("display_order"),
    supabase.from("site_settings").select("value").eq("key", "services_page").maybeSingle(),
  ])

  const serviceItems = (services as Service[]) ?? []
  const pageSettings = mergeServicesPage((pageData?.value ?? {}) as Record<string, unknown>)

  const byCategory = {
    service: serviceItems.filter((s) => s.category === "service"),
    pricing: serviceItems.filter((s) => s.category === "pricing"),
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">บริการ</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            จัดการบริการและแพ็กเกจที่แสดงบนหน้า /services
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          เพิ่มรายการ
        </Link>
      </div>

      {/* ── Page header settings ── */}
      <ServicesPageSettingsForm initial={pageSettings} />

      {/* ── Service tables ── */}
      {serviceItems.length === 0 ? (
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-16 text-center">
          <p className="text-slate-500 text-sm">ยังไม่มีข้อมูล</p>
          <Link
            href="/admin/services/new"
            className="mt-4 inline-flex items-center gap-1.5 text-[#DC2626] hover:text-[#FCA5A5] text-sm transition-colors"
          >
            <Plus size={14} /> เพิ่มรายการแรก
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <ServiceTable
            title="🛠 บริการ (ServicesDetail)"
            rows={byCategory.service}
            emptyHint="ยังไม่มีบริการ — เพิ่มเพื่อแสดงในส่วน ServicesDetail"
          />
          <ServiceTable
            title="💰 แพ็กเกจราคา (PricingSection)"
            rows={byCategory.pricing}
            emptyHint="ยังไม่มีแพ็กเกจ — เพิ่มเพื่อแสดงในส่วน PricingSection"
          />
        </div>
      )}
    </div>
  )
}

function ServiceTable({
  title,
  rows,
  emptyHint,
}: {
  title: string
  rows: Service[]
  emptyHint: string
}) {
  return (
    <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">{title}</h2>
        <span className="text-slate-500 text-xs">{rows.length} รายการ</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-slate-500 text-sm px-5 py-8 text-center">{emptyHint}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["ชื่อ / Highlight", "Tagline / ราคา", "ลำดับ", "สถานะ", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-slate-500 font-medium text-xs whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-white font-medium">{s.title}</p>
                    {s.highlight && (
                      <p className="text-slate-500 text-xs mt-0.5">{s.highlight}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs max-w-[180px] truncate">
                    {s.category === "pricing" && s.starting_price
                      ? `฿${s.starting_price}/เดือน`
                      : s.tagline ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{s.display_order}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        s.is_active
                          ? "text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full"
                          : "text-[10px] font-medium bg-white/5 text-slate-500 px-2 py-0.5 rounded-full"
                      }
                    >
                      {s.is_active ? "เปิด" : "ปิด"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <ServiceRowActions id={s.id} title={s.title} isActive={s.is_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
