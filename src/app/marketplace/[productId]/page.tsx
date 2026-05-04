import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight, Package, Users, BadgeCheck,
  ExternalLink, Lock, TrendingUp, ShoppingBag,
} from "lucide-react"
import { cn, safeUrl } from "@/lib/utils"
import { getProductDetail } from "../actions"
import { PullButton } from "../_components/PullButton"

const stockColor: Record<string, string> = {
  in_stock:     "bg-emerald-500/10 text-emerald-400",
  low_stock:    "bg-[#F59E0B]/10 text-[#F59E0B]",
  out_of_stock: "bg-red-500/10 text-red-400",
}
const stockLabel: Record<string, string> = {
  in_stock:     "มีสินค้า",
  low_stock:    "ใกล้หมด",
  out_of_stock: "หมด",
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const detail = await getProductDetail(productId)
  if (!detail) notFound()

  const { product, isPulled, hasTiktok } = detail

  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <div className="min-h-screen bg-[#0A0808] pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 space-y-6">

        {/* Back */}
        <Link href="/marketplace"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors p-2 -ml-2 rounded-xl hover:bg-white/5">
          <ChevronRight size={15} className="rotate-180" /> กลับ Marketplace
        </Link>

        {/* Product Image */}
        <div className="relative aspect-square sm:aspect-video bg-[#1C0D0D] rounded-2xl overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={48} className="text-slate-700" />
            </div>
          )}
          {discount && (
            <div className="absolute top-3 left-3 bg-[#DC2626] rounded-xl px-3 py-1">
              <span className="text-white font-bold text-sm">-{discount}%</span>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-[#0A0808]/90 backdrop-blur-sm border border-[#F59E0B]/30 rounded-xl px-3 py-1">
            <span className="text-[#F59E0B] font-bold text-sm">{product.commission_rate}%</span>
            <span className="text-slate-500 text-xs ml-1">คอม</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          {/* Title + Store */}
          <div>
            <h1 className="font-display font-bold text-white text-xl leading-snug">{product.name}</h1>
            <div className="flex items-center gap-1.5 mt-2">
              {product.store.is_verified && <BadgeCheck size={14} className="text-emerald-400" />}
              <span className="text-slate-400 text-sm">{product.store.name}</span>
            </div>
          </div>

          {/* Tags + Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={cn("text-xs px-2.5 py-1 rounded-full", stockColor[product.stock_status] ?? stockColor.in_stock)}>
              {stockLabel[product.stock_status] ?? "มีสินค้า"}
            </span>
            {product.pull_count > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-400 flex items-center gap-1">
                <Users size={11} /> {product.pull_count} Affiliate เลือกสินค้านี้
              </span>
            )}
            {product.monthly_sales_est > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-400 flex items-center gap-1">
                <TrendingUp size={11} /> {product.monthly_sales_est.toLocaleString()} ขาย/เดือน
              </span>
            )}
          </div>

          {/* Price */}
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-xl sm:text-2xl">฿{product.price.toLocaleString()}</p>
              {product.original_price && (
                <p className="text-slate-600 text-sm line-through">฿{product.original_price.toLocaleString()}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs">คอมมิชชั่น</p>
              <p className="text-[#F59E0B] font-bold text-xl sm:text-2xl">{product.commission_rate}%</p>
              <p className="text-[#F59E0B]/70 text-xs">
                ≈ ฿{Math.round(product.price * product.commission_rate / 100).toLocaleString()}/ชิ้น
              </p>
            </div>
          </div>

          {/* Promotion */}
          {product.promotion_text && (
            <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl px-4 py-3">
              <p className="text-[#F59E0B] text-xs font-semibold mb-1">โปรโมชั่น</p>
              <p className="text-slate-300 text-sm leading-relaxed">{product.promotion_text}</p>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-1.5">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">รายละเอียดสินค้า</p>
              <p className="text-slate-300 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* TikTok Product Link */}
          {safeUrl(product.tiktok_product_url) && (
            <a href={safeUrl(product.tiktok_product_url)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#F59E0B] hover:text-[#FCD34D] transition-colors">
              <ExternalLink size={14} /> ดูสินค้าบน TikTok Shop
            </a>
          )}

          {/* ── Affiliate-only section ── */}
          {detail.isAffiliate ? (
            <div className="space-y-3">
              {product.caption_suggestions && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                  <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Caption แนะนำสำหรับ Affiliate</p>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{product.caption_suggestions}</p>
                </div>
              )}
              {product.forbidden_words && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-2">
                  <p className="text-red-400 text-xs font-semibold uppercase tracking-wider">⚠ คำต้องห้าม — ห้ามใช้โดยเด็ดขาด</p>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{product.forbidden_words}</p>
                </div>
              )}
            </div>
          ) : (
            /* Guest or non-affiliate: locked section CTA */
            (product.caption_suggestions || product.forbidden_words) && (
              <div className="bg-[#1C0D0D] border border-white/10 rounded-xl p-5 text-center space-y-3">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">ข้อมูลสำหรับ Affiliate</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Caption แนะนำและคำต้องห้าม<br />
                    สมัครสมาชิกเพื่อดูข้อมูลเหล่านี้
                  </p>
                </div>
                <Link href={`/register?next=/marketplace/${product.id}`}
                  className="inline-flex items-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                  สมัครสมาชิกฟรี →
                </Link>
              </div>
            )
          )}

          {/* Pull Button */}
          <PullButton
            productId={product.id}
            isLoggedIn={detail.isLoggedIn}
            isAffiliate={detail.isAffiliate}
            isPulled={isPulled}
            hasTiktok={hasTiktok}
          />

          {/* "ดูสินค้าของฉัน" — affiliate who already pulled */}
          {isPulled && detail.isAffiliate && (
            <Link href="/member/my-products"
              className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-medium py-2.5 rounded-xl text-xs transition-colors">
              <ShoppingBag size={13} /> ดูในสินค้าของฉัน →
            </Link>
          )}

        </div>
      </div>
    </div>
  )
}
