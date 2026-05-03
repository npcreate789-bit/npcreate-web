import Link from "next/link"
import { Store, Package } from "lucide-react"
import type { StoreWithCount } from "../actions"

export function StoreCard({ store }: { store: StoreWithCount }) {
  return (
    <Link href={`/member/marketplace/${store.id}`}
      className="bg-[#1C0D0D] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center gap-3 transition-colors group">
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/[0.03] shrink-0 flex items-center justify-center">
        {store.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <Store size={20} className="text-slate-600" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white font-semibold text-sm truncate group-hover:text-[#FCA5A5] transition-colors">{store.name}</p>
        {store.category && <p className="text-slate-500 text-xs truncate">{store.category}</p>}
        <p className="text-slate-600 text-xs mt-0.5 flex items-center gap-1">
          <Package size={10} /> {store.product_count} สินค้า
        </p>
      </div>
    </Link>
  )
}
