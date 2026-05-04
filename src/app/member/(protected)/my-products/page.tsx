import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Package, ExternalLink, ShoppingBag, Clock, CheckCircle2,
  Truck, XCircle, ArrowLeft, Home, UserCog, ChevronRight, Rocket,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getMyPulledProducts } from "../marketplace/actions"
import { cn } from "@/lib/utils"
import type { SampleStatus } from "@/types/database"

const sampleStatusConfig: Record<SampleStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: "รอพิจารณา",    color: "bg-slate-500/10 text-slate-400",     icon: <Clock size={11} /> },
  approved: { label: "อนุมัติแล้ว",  color: "bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 size={11} /> },
  sent:     { label: "ส่งสินค้าแล้ว", color: "bg-blue-500/10 text-blue-400",      icon: <Truck size={11} /> },
  rejected: { label: "ไม่ผ่าน",      color: "bg-red-500/10 text-red-400",        icon: <XCircle size={11} /> },
}

export default async function MyProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const pulls = await getMyPulledProducts()

  const counts = {
    pending:  pulls.filter(p => p.sample_status === "pending").length,
    approved: pulls.filter(p => p.sample_status === "approved").length,
    sent:     pulls.filter(p => p.sample_status === "sent").length,
    rejected: pulls.filter(p => p.sample_status === "rejected").length,
  }

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">

        {/* Top navigation — same pattern as /member/profile */}
        <div className="flex items-center gap-3">
          <Link
            href="/member"
            className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0"
          >
            <ArrowLeft size={16} className="text-slate-400 group-hover:text-white transition-colors" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-white text-xl leading-tight">สินค้าของฉัน</h1>
            <p className="text-slate-500 text-xs mt-0.5">{pulls.length} สินค้าที่ดึงมาแล้ว</p>
          </div>
          <Link
            href="/"
            className="group flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition-colors shrink-0"
          >
            <Home size={13} />
            หน้าหลัก
          </Link>
        </div>

        {/* Quick nav tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
          <Link href="/marketplace"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C0D0D] border border-white/5 hover:border-[#F59E0B]/30 text-slate-400 hover:text-[#F59E0B] text-xs font-medium transition-colors whitespace-nowrap shrink-0">
            <ShoppingBag size={13} />
            Marketplace
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold whitespace-nowrap shrink-0">
            <Package size={13} />
            สินค้าของฉัน
          </div>
          <Link href="/member/profile"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C0D0D] border border-white/5 hover:border-white/15 text-slate-400 hover:text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0">
            <UserCog size={13} />
            โปรไฟล์
          </Link>
        </div>

        {/* Status summary — show only when there are products */}
        {pulls.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <StatusSummaryCard
              count={counts.pending}
              label="รอพิจารณา"
              color="text-slate-400"
              bg="bg-slate-500/10"
              icon={<Clock size={13} />}
            />
            <StatusSummaryCard
              count={counts.approved + counts.sent}
              label="ผ่านแล้ว"
              color="text-emerald-400"
              bg="bg-emerald-500/10"
              icon={<CheckCircle2 size={13} />}
            />
            <StatusSummaryCard
              count={counts.rejected}
              label="ไม่ผ่าน"
              color="text-red-400"
              bg="bg-red-500/10"
              icon={<XCircle size={13} />}
            />
          </div>
        )}

        {/* Approved action banner — show when there are approved products */}
        {counts.approved > 0 && (
          <Link href="/member/profile#address"
            className="group flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded-2xl p-4 transition-colors">
            <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Truck size={16} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-emerald-400 font-semibold text-sm">มี {counts.approved} สินค้าที่รออยู่รับสินค้า</p>
              <p className="text-slate-500 text-xs mt-0.5">กรอกที่อยู่จัดส่งเพื่อรับสินค้าตัวอย่าง</p>
            </div>
            <ChevronRight size={15} className="text-emerald-500/50 shrink-0 group-hover:text-emerald-400 transition-colors" />
          </Link>
        )}

        {/* Product list */}
        {pulls.length === 0 ? (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-20 text-center space-y-4">
            <Package size={36} className="text-slate-700 mx-auto" />
            <div>
              <p className="text-slate-400 text-sm font-medium">ยังไม่มีสินค้าที่ดึงมา</p>
              <p className="text-slate-600 text-xs mt-1">เลือกสินค้าจาก Marketplace เพื่อเริ่มโปรโมท</p>
            </div>
            <Link href="/marketplace"
              className="inline-flex items-center gap-2 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 text-[#F59E0B] font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
              <ShoppingBag size={15} />
              ไป Marketplace
              <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {pulls.map(pull => {
                const product   = pull.product
                const statusCfg = sampleStatusConfig[pull.sample_status] ?? sampleStatusConfig.pending
                return (
                  <div key={pull.id} className="p-4 flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/[0.03] shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={18} className="text-slate-700" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                          <p className="text-slate-500 text-xs truncate">{product.store.name}</p>
                        </div>
                        <span className="text-[#F59E0B] font-bold text-sm shrink-0">{product.commission_rate}%</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                          statusCfg.color
                        )}>
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                      </div>

                      {/* Status-based CTA */}
                      {pull.sample_status === "approved" && (
                        <Link href="/member/profile#address"
                          className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors font-medium">
                          <Truck size={11} />
                          กรอกที่อยู่รับสินค้า
                          <ChevronRight size={10} />
                        </Link>
                      )}
                      {pull.sample_status === "sent" && product.tiktok_product_url && (
                        <a href={product.tiktok_product_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 text-[#F59E0B] px-3 py-1.5 rounded-lg transition-colors font-medium">
                          <Rocket size={11} />
                          เริ่มโปรโมท
                          <ExternalLink size={10} />
                        </a>
                      )}
                      {pull.sample_status === "rejected" && (
                        <Link href="/marketplace"
                          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                          <ShoppingBag size={11} />
                          ดูสินค้าอื่น →
                        </Link>
                      )}

                      {/* Seller note */}
                      {pull.seller_note && (
                        <p className="text-slate-500 text-xs italic">&ldquo;{pull.seller_note}&rdquo;</p>
                      )}

                      <div className="flex items-center gap-3 pt-0.5">
                        <span className="text-white font-semibold text-xs">฿{product.price.toLocaleString()}</span>
                        <span className="text-slate-600 text-xs">คอม {product.commission_rate}%</span>
                        {product.tiktok_product_url && pull.sample_status !== "sent" && (
                          <a href={product.tiktok_product_url} target="_blank" rel="noopener noreferrer"
                            className="text-slate-600 hover:text-[#F59E0B] transition-colors ml-auto">
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bottom CTA — browse more */}
        {pulls.length > 0 && (
          <Link href="/marketplace"
            className="group flex items-center gap-3 bg-[#1C0D0D] border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 hover:bg-[#F59E0B]/5 rounded-2xl p-4 sm:p-5 transition-colors">
            <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBag size={18} className="text-[#F59E0B]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm group-hover:text-[#F59E0B] transition-colors">ดูสินค้าเพิ่มเติม</p>
              <p className="text-slate-500 text-xs mt-0.5">เลือกสินค้าใหม่จาก Marketplace</p>
            </div>
            <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-[#F59E0B] transition-colors" />
          </Link>
        )}

      </div>
    </div>
  )
}

function StatusSummaryCard({
  count, label, color, bg, icon,
}: {
  count: number
  label: string
  color: string
  bg: string
  icon: React.ReactNode
}) {
  return (
    <div className={cn("rounded-2xl border border-white/5 p-3 text-center space-y-1", "bg-[#1C0D0D]")}>
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mx-auto", bg, color)}>
        {icon}
      </div>
      <p className={cn("font-bold text-lg leading-none", color)}>{count}</p>
      <p className="text-slate-600 text-[10px]">{label}</p>
    </div>
  )
}
