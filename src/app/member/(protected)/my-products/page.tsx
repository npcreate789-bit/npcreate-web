import { redirect } from "next/navigation"
import Link from "next/link"
import { Package, ExternalLink, ShoppingBag, Clock, CheckCircle2, Truck, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getMyPulledProducts } from "../marketplace/actions"
import { cn } from "@/lib/utils"
import type { SampleStatus } from "@/types/database"

const sampleStatusConfig: Record<SampleStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: "รอพิจารณา",    color: "bg-slate-500/10 text-slate-400",   icon: <Clock size={11} /> },
  approved: { label: "อนุมัติแล้ว",  color: "bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 size={11} /> },
  sent:     { label: "ส่งสินค้าแล้ว", color: "bg-blue-500/10 text-blue-400",     icon: <Truck size={11} /> },
  rejected: { label: "ไม่ผ่าน",      color: "bg-red-500/10 text-red-400",       icon: <XCircle size={11} /> },
}

export default async function MyProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const pulls = await getMyPulledProducts()

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">

        <div>
          <h1 className="font-display font-bold text-white text-xl flex items-center gap-2">
            <Package size={20} className="text-[#DC2626]" /> สินค้าของฉัน
          </h1>
          <p className="text-slate-500 text-xs mt-1">{pulls.length} สินค้าที่ดึงมาแล้ว</p>
        </div>

        {pulls.length === 0 ? (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-20 text-center space-y-3">
            <Package size={36} className="text-slate-700 mx-auto" />
            <p className="text-slate-500 text-sm">ยังไม่มีสินค้าที่ดึงมา</p>
            <Link href="/marketplace"
              className="inline-flex items-center gap-1.5 text-[#DC2626] hover:text-[#FCA5A5] text-sm transition-colors">
              <ShoppingBag size={14} /> ไป Marketplace
            </Link>
          </div>
        ) : (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {pulls.map(pull => {
                const product = pull.product
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
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                          <p className="text-slate-500 text-xs truncate">{product.store.name}</p>
                        </div>
                        <span className="text-[#F59E0B] font-bold text-sm shrink-0">{product.commission_rate}%</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Sample status badge */}
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                          statusCfg.color
                        )}>
                          {statusCfg.icon} {statusCfg.label}
                        </span>

                        {/* Approved: prompt to fill address */}
                        {pull.sample_status === "approved" && (
                          <Link href="/member/profile#address"
                            className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">
                            กรอกที่อยู่รับสินค้า →
                          </Link>
                        )}
                      </div>

                      {/* Seller note */}
                      {pull.seller_note && (
                        <p className="text-slate-500 text-xs italic">&ldquo;{pull.seller_note}&rdquo;</p>
                      )}

                      <div className="flex items-center gap-3 pt-0.5">
                        <span className="text-white font-semibold text-xs">฿{product.price.toLocaleString()}</span>
                        <span className="text-slate-600 text-xs">คอม {product.commission_rate}%</span>
                        {product.tiktok_product_url && (
                          <a href={product.tiktok_product_url} target="_blank" rel="noopener noreferrer"
                            className="text-[#F59E0B] hover:text-[#FCD34D] transition-colors ml-auto">
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

      </div>
    </div>
  )
}
