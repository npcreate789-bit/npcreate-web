import Link from "next/link"
import { Package, Users, TrendingUp, BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { PullButton } from "./PullButton"
import type { ProductWithMeta } from "../actions"

const stockColor: Record<string, string> = {
  in_stock:     "text-emerald-400",
  low_stock:    "text-[#F59E0B]",
  out_of_stock: "text-red-400",
}
const stockLabel: Record<string, string> = {
  in_stock:     "มีสินค้า",
  low_stock:    "ใกล้หมด",
  out_of_stock: "หมด",
}

export function ProductCard({ product, isPulled, isLoggedIn, isAffiliate, hasLine, hasTiktok, isSeller }: {
  product: ProductWithMeta
  isPulled: boolean
  isLoggedIn: boolean
  isAffiliate: boolean
  hasLine: boolean
  hasTiktok: boolean
  isSeller?: boolean
}) {
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <div className="bg-[#1C0D0D] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-colors flex flex-col group">
      {/* Image */}
      <Link href={`/product-ads/${product.id}`} className="relative aspect-square bg-white/[0.03] overflow-hidden block">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={28} className="text-slate-700" />
          </div>
        )}
        {/* Commission badge */}
        <div className="absolute top-2 right-2 bg-[#0A0808]/90 backdrop-blur-sm border border-[#F59E0B]/30 rounded-lg px-2 py-0.5">
          <span className="text-[#F59E0B] font-bold text-xs">{product.commission_rate}%</span>
        </div>
        {discount && (
          <div className="absolute top-2 left-2 bg-[#DC2626] rounded-lg px-2 py-0.5">
            <span className="text-white font-bold text-[10px]">-{discount}%</span>
          </div>
        )}
        {isPulled && (
          <div className="absolute bottom-2 right-2 bg-emerald-500/90 backdrop-blur-sm rounded-lg px-2 py-0.5">
            <span className="text-white font-bold text-[10px]">ดึงแล้ว</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="flex-1 min-w-0">
          <Link href={`/product-ads/${product.id}`}>
            <p className="text-white font-semibold text-xs leading-snug line-clamp-2 hover:text-[#FCA5A5] transition-colors">{product.name}</p>
          </Link>
          <div className="flex items-center gap-1 mt-1">
            {product.store.is_verified && <BadgeCheck size={10} className="text-emerald-400 shrink-0" />}
            <p className="text-slate-500 text-[10px] truncate">{product.store.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div>
            <p className="text-white font-bold text-sm">฿{product.price.toLocaleString()}</p>
            {product.original_price && (
              <p className="text-slate-600 text-[10px] line-through">฿{product.original_price.toLocaleString()}</p>
            )}
          </div>
          <div className="text-right">
            <p className={cn("text-[10px]", stockColor[product.stock_status] ?? "text-emerald-400")}>
              {stockLabel[product.stock_status] ?? "มีสินค้า"}
            </p>
            {product.pull_count > 0 && (
              <p className="text-slate-600 text-[10px] flex items-center gap-0.5 justify-end mt-0.5">
                <Users size={8} /> {product.pull_count}
              </p>
            )}
          </div>
        </div>

        {product.promotion_text && (
          <p className="text-[#F59E0B] text-[10px] leading-snug line-clamp-1 bg-[#F59E0B]/5 rounded-lg px-2 py-1">
            {product.promotion_text}
          </p>
        )}

        {product.monthly_sales_est > 0 && (
          <p className="text-slate-600 text-[10px] flex items-center gap-1">
            <TrendingUp size={9} /> {product.monthly_sales_est.toLocaleString()} ขาย/เดือน
          </p>
        )}

        {isSeller ? (
          <Link href={`/product-ads/${product.id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-medium py-2.5 rounded-xl text-xs transition-colors">
            ดูรายละเอียด →
          </Link>
        ) : (
          <PullButton
            productId={product.id}
            isLoggedIn={isLoggedIn}
            isAffiliate={isAffiliate}
            isPulled={isPulled}
            hasLine={hasLine}
            hasTiktok={hasTiktok}
          />
        )}
      </div>
    </div>
  )
}
