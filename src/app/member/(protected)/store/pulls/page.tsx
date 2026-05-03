import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Users, Package, Clock, CheckCircle2, Truck, XCircle, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import { getStorePulls } from "./actions"
import { getMyStore } from "../actions"
import { PullActions } from "./_components/PullActions"
import type { SampleStatus } from "@/types/database"

const statusConfig: Record<SampleStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: "รอพิจารณา",    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",    icon: <Clock size={10} /> },
  approved: { label: "อนุมัติแล้ว",  color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <CheckCircle2 size={10} /> },
  sent:     { label: "ส่งแล้ว",      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",       icon: <Truck size={10} /> },
  rejected: { label: "ปฏิเสธ",       color: "bg-red-500/10 text-red-400 border-red-500/20",          icon: <XCircle size={10} /> },
}

const STATUS_TABS = [
  { value: "all",      label: "ทั้งหมด" },
  { value: "pending",  label: "รอพิจารณา" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "sent",     label: "ส่งแล้ว" },
  { value: "rejected", label: "ปฏิเสธ" },
]

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

  const [pulls, products] = await Promise.all([
    getStorePulls({ status, productId: product }),
    supabase.from("products").select("id, name").eq("store_id", store.id).order("name"),
  ])

  const activeStatus = status ?? "all"

  // Count by status for tab badges
  const allPulls = await getStorePulls()
  const countByStatus = allPulls.reduce<Record<string, number>>((acc, p) => {
    acc[p.sample_status] = (acc[p.sample_status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/member/store" className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0">
            <ChevronRight size={16} className="text-slate-400 group-hover:text-white rotate-180 transition-colors" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-white text-xl flex items-center gap-2">
              <Users size={18} className="text-[#DC2626]" /> Affiliate ที่ดึงสินค้า
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">{store.name} · {allPulls.length} รายการทั้งหมด</p>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {STATUS_TABS.map(tab => {
            const count = tab.value === "all" ? allPulls.length : (countByStatus[tab.value] ?? 0)
            return (
              <Link
                key={tab.value}
                href={`/member/store/pulls?status=${tab.value}${product ? `&product=${product}` : ""}`}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border",
                  activeStatus === tab.value
                    ? "bg-[#DC2626]/10 text-[#FCA5A5] border-[#DC2626]/20"
                    : "bg-[#1C0D0D] text-slate-400 border-white/5 hover:text-white hover:border-white/10"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    activeStatus === tab.value ? "bg-[#DC2626]/20 text-[#FCA5A5]" : "bg-white/10 text-slate-400"
                  )}>
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Product filter */}
        {(products.data ?? []).length > 0 && (
          <form method="GET" className="flex items-center gap-2">
            <input type="hidden" name="status" value={activeStatus} />
            <select
              name="product"
              defaultValue={product ?? ""}
              className="flex-1 bg-[#1C0D0D] border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs outline-none focus:border-white/20 transition-colors"
            >
              <option value="">สินค้าทั้งหมด</option>
              {(products.data ?? []).map(p => (
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
                className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
              >
                ล้าง
              </Link>
            )}
          </form>
        )}

        {/* Pull list */}
        {pulls.length === 0 ? (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-20 text-center space-y-2">
            <Users size={32} className="text-slate-700 mx-auto" />
            <p className="text-slate-500 text-sm">
              {activeStatus === "all" ? "ยังไม่มี Affiliate ดึงสินค้า" : "ไม่มีรายการในสถานะนี้"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pulls.map(pull => {
              const statusCfg = statusConfig[pull.sample_status] ?? statusConfig.pending
              const affiliate = pull.affiliate
              const product = pull.product

              return (
                <div key={pull.id} className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-4 space-y-3">
                  {/* Top row: product + affiliate */}
                  <div className="flex gap-3">
                    {/* Product thumbnail */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/[0.03] shrink-0 flex items-center justify-center">
                      {product?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt={product.name ?? ""} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} className="text-slate-700" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{product?.name ?? "—"}</p>
                          <p className="text-[#F59E0B] text-xs font-semibold">{product?.commission_rate ?? 0}% คอม</p>
                        </div>
                        <span className={cn(
                          "shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium",
                          statusCfg.color
                        )}>
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                      </div>

                      {/* Affiliate info */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-6 h-6 rounded-full bg-[#DC2626]/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {affiliate?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={affiliate.avatar_url} alt={affiliate.full_name ?? ""} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[#DC2626] text-[10px] font-bold">
                              {affiliate?.full_name?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-300 text-xs font-medium truncate">
                          {affiliate?.full_name ?? "—"}
                        </span>
                        {affiliate?.tiktok_channel_url && (
                          <a
                            href={affiliate.tiktok_channel_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 text-[#F59E0B] hover:text-[#FCD34D] text-[10px] transition-colors border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 px-2 py-0.5 rounded-full"
                          >
                            <ExternalLink size={9} /> TikTok
                          </a>
                        )}
                        <span className="text-slate-600 text-[10px] ml-auto shrink-0">
                          {new Date(pull.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                        </span>
                      </div>

                      {/* Existing seller note (read preview) */}
                      {pull.seller_note && (
                        <p className="text-slate-500 text-[10px] italic truncate">
                          โน้ต: {pull.seller_note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <PullActions
                    pullId={pull.id}
                    status={pull.sample_status}
                    note={pull.seller_note}
                  />
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
