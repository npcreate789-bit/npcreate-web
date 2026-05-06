import { Package, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { PullButton } from "./PullButton"
import type { ProductWithStore } from "../actions"

const stockLabel: Record<string, string> = {
  in_stock: "มีสินค้า", low_stock: "ใกล้หมด", out_of_stock: "หมด",
}
const stockColor: Record<string, string> = {
  in_stock: "text-emerald-400", low_stock: "text-[#F59E0B]", out_of_stock: "text-red-400",
}
const tagLabel: Record<string, string> = {
  best_seller: "🔥 ขายดี", flash_sale: "⚡ Flash Sale",
  new: "✨ ใหม่", limited: "⏳ Limited", recommended: "👍 แนะนำ",
}

export function ProductCard({ product, pullCode }: {
  product: ProductWithStore
  pullCode?: string
}) {
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <div className="bg-[#1C0D0D] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-colors flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-white/[0.03] overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-slate-700" />
          </div>
        )}
        {/* Commission badge */}
        <div className="absolute top-2 right-2 bg-[#0A0808]/90 backdrop-blur-sm border border-[#F59E0B]/30 rounded-lg px-2 py-1">
          <span className="text-[#F59E0B] font-bold text-sm">{product.commission_rate}%</span>
        </div>
        {discount && (
          <div className="absolute top-2 left-2 bg-[#DC2626] rounded-lg px-2 py-1">
            <span className="text-white font-bold text-xs">-{discount}%</span>
          </div>
        )}
        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {product.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] bg-[#0A0808]/80 backdrop-blur-sm text-slate-300 px-1.5 py-0.5 rounded-md">
                {tagLabel[tag] ?? tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <p className="text-white font-semibold text-sm leading-snug line-clamp-2">{product.name}</p>
          <p className="text-slate-500 text-xs mt-1 truncate">{product.store.name}</p>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-white font-bold text-base">฿{product.price.toLocaleString()}</p>
            {product.original_price && (
              <p className="text-slate-600 text-xs line-through">฿{product.original_price.toLocaleString()}</p>
            )}
          </div>
          <div className="text-right">
            <p className={cn("text-xs", stockColor[product.stock_status] ?? "text-emerald-400")}>
              {stockLabel[product.stock_status] ?? "มีสินค้า"}
            </p>
            {product.monthly_sales_est > 0 && (
              <p className="text-slate-600 text-xs flex items-center gap-1 justify-end mt-0.5">
                <TrendingUp size={9} /> {product.monthly_sales_est.toLocaleString()}/เดือน
              </p>
            )}
          </div>
        </div>

        <PullButton productId={product.id} initialPullCode={pullCode} />
      </div>
    </div>
  )
}
