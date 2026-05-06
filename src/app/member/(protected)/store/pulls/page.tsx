import { redirect } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight, Users, Package, Clock, CheckCircle2, Truck,
  XCircle, ExternalLink, MapPin, Phone, AlertTriangle, Music,
  Video, Radio, Layers,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { cn, safeUrl } from "@/lib/utils"
import { getStorePulls } from "./actions"
import { getMyStore } from "../actions"
import { PullActions } from "./_components/PullActions"
import { CopyAddressButton } from "./_components/CopyAddressButton"
import type { SampleStatus } from "@/types/database"
import type { AffiliateInfo } from "./actions"

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig: Record<SampleStatus, {
  label: string
  color: string
  border: string
  icon: React.ReactNode
}> = {
  pending:  {
    label: "รอพิจารณา",
    color:  "bg-slate-500/10 text-slate-400",
    border: "border-white/5",
    icon:   <Clock size={10} />,
  },
  approved: {
    label: "อนุมัติแล้ว",
    color:  "bg-emerald-500/10 text-emerald-400",
    border: "border-emerald-500/20",
    icon:   <CheckCircle2 size={10} />,
  },
  sent:     {
    label: "ส่งแล้ว",
    color:  "bg-blue-500/10 text-blue-400",
    border: "border-blue-500/15",
    icon:   <Truck size={10} />,
  },
  rejected: {
    label: "ปฏิเสธ",
    color:  "bg-red-500/10 text-red-400",
    border: "border-white/5",
    icon:   <XCircle size={10} />,
  },
}

const STATUS_TABS = [
  { value: "all",      label: "ทั้งหมด" },
  { value: "pending",  label: "รอพิจารณา" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "sent",     label: "ส่งแล้ว" },
  { value: "rejected", label: "ปฏิเสธ" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasDeliveryAddress(affiliate: AffiliateInfo | null): boolean {
  return !!(affiliate?.address_line1 && affiliate.address_name)
}

function formatAddressText(affiliate: AffiliateInfo): string {
  return [
    affiliate.address_name,
    affiliate.address_phone ?? "",
    affiliate.address_line1,
    [
      affiliate.address_subdistrict ? `ต.${affiliate.address_subdistrict}` : null,
      affiliate.address_district    ? `อ.${affiliate.address_district}`    : null,
      affiliate.address_province,
    ].filter(Boolean).join(" "),
    affiliate.address_postcode ?? "",
  ].filter(Boolean).join("\n")
}

// ─── Sub-components (server) ──────────────────────────────────────────────────

function AddressPanel({ affiliate, status }: { affiliate: AffiliateInfo | null; status: SampleStatus }) {
  if (status !== "approved" && status !== "sent") return null

  if (!hasDeliveryAddress(affiliate)) {
    return (
      <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3.5 py-3">
        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-300 text-xs font-semibold">ยังไม่มีที่อยู่จัดส่ง</p>
          <p className="text-amber-400/60 text-[11px] mt-0.5">
            Affiliate ยังไม่ได้กรอกที่อยู่ — รอให้กรอกก่อนส่งสินค้า
          </p>
        </div>
      </div>
    )
  }

  const af = affiliate!
  const isSent = status === "sent"
  const addressText = formatAddressText(af)

  return (
    <div className={cn(
      "rounded-xl border p-3.5 space-y-2.5",
      isSent
        ? "bg-blue-500/5 border-blue-500/15"
        : "bg-emerald-500/5 border-emerald-500/20"
    )}>
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <MapPin size={12} className={isSent ? "text-blue-400" : "text-emerald-400"} />
        <p className={cn("text-xs font-semibold", isSent ? "text-blue-300" : "text-emerald-300")}>
          ที่อยู่จัดส่ง
        </p>
      </div>

      {/* Address detail */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <p className="text-white text-xs font-semibold">{af.address_name}</p>
            {af.address_phone && (
              <div className="flex items-center gap-1">
                <Phone size={9} className="text-slate-500 shrink-0" />
                <p className="text-slate-400 text-xs">{af.address_phone}</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed">
          {af.address_line1}
          {(af.address_subdistrict || af.address_district || af.address_province) && (
            <>
              <br />
              {[
                af.address_subdistrict ? `ต.${af.address_subdistrict}` : null,
                af.address_district    ? `อ.${af.address_district}`    : null,
                af.address_province,
              ].filter(Boolean).join(" ")}
              {af.address_postcode && ` ${af.address_postcode}`}
            </>
          )}
        </p>
      </div>

      {/* Copy button */}
      <div className="flex justify-end">
        <CopyAddressButton text={addressText} />
      </div>
    </div>
  )
}

const contentTypeConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  clip: { icon: <Video size={9} />, label: "คลิปปักตะกร้า" },
  live: { icon: <Radio size={9} />, label: "ไลฟ์สด" },
  both: { icon: <Layers size={9} />, label: "คลิป + ไลฟ์" },
}

function ContentTypeBadge({ type }: { type: string }) {
  const cfg = contentTypeConfig[type]
  if (!cfg) return null
  return (
    <span className="inline-flex items-center gap-1 text-[#F59E0B]/80 text-[10px] bg-[#F59E0B]/8 border border-[#F59E0B]/20 px-2 py-0.5 rounded-full">
      {cfg.icon} {cfg.label}
    </span>
  )
}

function AffiliateSection({ affiliate }: { affiliate: AffiliateInfo | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-t border-white/5">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-[#DC2626]/10 flex items-center justify-center shrink-0 overflow-hidden">
        {affiliate?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={affiliate.avatar_url} alt={affiliate.full_name ?? ""} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[#DC2626] text-sm font-bold">
            {affiliate?.full_name?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Name + code */}
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white font-semibold text-sm truncate">
            {affiliate?.full_name ?? "ไม่ระบุชื่อ"}
          </p>
          {affiliate?.user_code && (
            <span className="text-[#F59E0B] font-mono text-[10px] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded shrink-0">
              {affiliate.user_code}
            </span>
          )}
        </div>

        {/* Contact row */}
        <div className="flex items-center gap-3 flex-wrap">
          {affiliate?.phone && (
            <a
              href={`tel:${affiliate.phone}`}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs transition-colors"
            >
              <Phone size={10} />
              {affiliate.phone}
            </a>
          )}
          {safeUrl(affiliate?.tiktok_channel_url) && (
            <a
              href={safeUrl(affiliate?.tiktok_channel_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#F59E0B] hover:text-[#FCD34D] text-[11px] border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 px-2 py-0.5 rounded-full transition-colors"
            >
              <Music size={9} /> TikTok
            </a>
          )}
          {affiliate?.content_type && (
            <ContentTypeBadge type={affiliate.content_type} />
          )}
          {!affiliate?.phone && !affiliate?.tiktok_channel_url && !affiliate?.content_type && (
            <p className="text-slate-600 text-xs">ไม่มีข้อมูลติดต่อ</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StorePullsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; product?: string }>
}) {
  const { status, product } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const store = await getMyStore()
  if (!store) redirect("/member/store")

  const [pulls, allPulls, productsRes] = await Promise.all([
    getStorePulls({ status, productId: product }),
    getStorePulls(),
    supabase.from("products").select("id, name").eq("store_id", store.id).order("name"),
  ])

  const activeStatus = status ?? "all"

  // Count by status for tab badges
  const countByStatus = allPulls.reduce<Record<string, number>>((acc, p) => {
    acc[p.sample_status] = (acc[p.sample_status] ?? 0) + 1
    return acc
  }, {})

  // Identify approved items without address (need seller attention)
  const approvedNoAddress = allPulls.filter(
    p => p.sample_status === "approved" && !hasDeliveryAddress(p.affiliate)
  )

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/member/store"
            className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0"
          >
            <ChevronRight size={16} className="text-slate-400 group-hover:text-white rotate-180 transition-colors" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-white text-xl flex items-center gap-2">
              <Users size={18} className="text-[#DC2626]" /> Affiliate ที่ดึงสินค้า
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">{store.name} · {allPulls.length} รายการทั้งหมด</p>
          </div>
        </div>

        {/* Warning banner — approved without address */}
        {approvedNoAddress.length > 0 && (
          <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/25 rounded-2xl px-4 py-3.5">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-amber-300 text-sm font-semibold">
                มี {approvedNoAddress.length} รายการ รออยู่รับที่อยู่จัดส่ง
              </p>
              <p className="text-amber-400/70 text-xs mt-0.5">
                Affiliate เหล่านี้ยังไม่ได้กรอกที่อยู่ — รอจนกว่าพวกเขาจะกรอก แล้วค่อยส่งสินค้า
              </p>
            </div>
          </div>
        )}

        {/* Status tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {STATUS_TABS.map(tab => {
            const count = tab.value === "all" ? allPulls.length : (countByStatus[tab.value] ?? 0)
            const isActive = activeStatus === tab.value
            return (
              <Link
                key={tab.value}
                href={`/member/store/pulls?status=${tab.value}${product ? `&product=${product}` : ""}`}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border",
                  isActive
                    ? "bg-[#DC2626]/10 text-[#FCA5A5] border-[#DC2626]/20"
                    : "bg-[#1C0D0D] text-slate-400 border-white/5 hover:text-white hover:border-white/10"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    isActive ? "bg-[#DC2626]/20 text-[#FCA5A5]" : "bg-white/10 text-slate-400"
                  )}>
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Product filter */}
        {(productsRes.data ?? []).length > 1 && (
          <form method="GET" className="flex items-center gap-2">
            <input type="hidden" name="status" value={activeStatus} />
            <select
              name="product"
              defaultValue={product ?? ""}
              className="flex-1 bg-[#1C0D0D] border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs outline-none focus:border-white/20 transition-colors"
            >
              <option value="">สินค้าทั้งหมด</option>
              {(productsRes.data ?? []).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-3 py-2 rounded-xl transition-colors"
            >
              กรอง
            </button>
            {product && (
              <Link
                href={`/member/store/pulls?status=${activeStatus}`}
                className="text-slate-500 hover:text-slate-300 text-xs transition-colors whitespace-nowrap"
              >
                ล้างตัวกรอง
              </Link>
            )}
          </form>
        )}

        {/* Pull list */}
        {pulls.length === 0 ? (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-20 text-center space-y-3">
            <Users size={32} className="text-slate-700 mx-auto" />
            <div>
              <p className="text-slate-400 text-sm font-medium">
                {activeStatus === "all" ? "ยังไม่มี Affiliate ดึงสินค้า" : "ไม่มีรายการในสถานะนี้"}
              </p>
              {activeStatus === "all" && (
                <p className="text-slate-600 text-xs mt-1">
                  เมื่อ Affiliate เลือกสินค้าจาก ProductAds รายการจะปรากฏที่นี่
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {pulls.map(pull => {
              const statusCfg = statusConfig[pull.sample_status] ?? statusConfig.pending
              const affiliate = pull.affiliate
              const productItem = pull.product
              const addrOk = hasDeliveryAddress(affiliate)

              return (
                <div
                  key={pull.id}
                  className={cn(
                    "bg-[#1C0D0D] border rounded-2xl p-4 space-y-0 transition-colors",
                    statusCfg.border
                  )}
                >
                  {/* ── Product row ───────────────────────────────────────── */}
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <Link
                      href={`/member/store/products/${productItem?.id}/edit`}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-white/[0.03] shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      {productItem?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={productItem.image_url}
                          alt={productItem.name ?? ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={16} className="text-slate-700" />
                      )}
                    </Link>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm leading-snug truncate">
                            {productItem?.name ?? "—"}
                          </p>
                          <p className="text-[#F59E0B] text-xs font-semibold mt-0.5">
                            {productItem?.commission_rate ?? 0}% คอมมิชชั่น
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold",
                            statusCfg.color
                          )}>
                            {statusCfg.icon} {statusCfg.label}
                          </span>
                          <span className="text-slate-600 text-[10px]">
                            {new Date(pull.created_at).toLocaleDateString("th-TH", {
                              day: "numeric", month: "short", year: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* TikTok product link */}
                      {productItem && (
                        <Link
                          href={`/product-ads/${productItem.id}`}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-400 text-[10px] mt-1.5 transition-colors"
                          target="_blank"
                        >
                          <ExternalLink size={9} /> ดูใน ProductAds
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* ── Affiliate row ─────────────────────────────────────── */}
                  <AffiliateSection affiliate={affiliate} />

                  {/* ── Delivery address ─────────────────────────────────── */}
                  {(pull.sample_status === "approved" || pull.sample_status === "sent") && (
                    <div className="pt-3">
                      <AddressPanel affiliate={affiliate} status={pull.sample_status} />
                    </div>
                  )}

                  {/* ── Existing seller note preview ──────────────────────── */}
                  {pull.seller_note && (
                    <div className="pt-2.5">
                      <p className="text-slate-600 text-[11px] italic bg-white/[0.02] rounded-lg px-3 py-2 border border-white/5">
                        📝 โน้ตของคุณ: &ldquo;{pull.seller_note}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* ── Actions ───────────────────────────────────────────── */}
                  <PullActions
                    pullId={pull.id}
                    status={pull.sample_status}
                    note={pull.seller_note}
                    hasAddress={addrOk}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Summary footer */}
        {pulls.length > 0 && (
          <p className="text-center text-slate-700 text-xs">
            แสดง {pulls.length} จาก {allPulls.length} รายการ
          </p>
        )}

      </div>
    </div>
  )
}
