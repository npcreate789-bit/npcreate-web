import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, ChevronRight, Package } from "lucide-react"
import { getStoreProducts } from "./actions"
import { getMyStore } from "../actions"
import { ProductRowActions } from "./_components/ProductRowActions"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

const stockLabel: Record<string, string> = {
  in_stock: "มีสินค้า", low_stock: "ใกล้หมด", out_of_stock: "หมด",
}
const stockColor: Record<string, string> = {
  in_stock: "bg-emerald-500/10 text-emerald-400",
  low_stock: "bg-[#F59E0B]/10 text-[#F59E0B]",
  out_of_stock: "bg-red-500/10 text-red-400",
}

export default async function StoreProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const store = await getMyStore()
  if (!store) redirect("/member/store")

  const products = await getStoreProducts()

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">

        <div className="flex items-center gap-3">
          <Link href="/member/store" className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0">
            <ChevronRight size={16} className="text-slate-400 group-hover:text-white rotate-180 transition-colors" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-white text-xl">สินค้าทั้งหมด</h1>
            <p className="text-slate-500 text-xs mt-0.5">{products.length} รายการ</p>
          </div>
          <Link href="/member/store/products/new"
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0">
            <Plus size={15} /> เพิ่มสินค้า
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-16 text-center space-y-3">
            <Package size={32} className="text-slate-600 mx-auto" />
            <p className="text-slate-500 text-sm">ยังไม่มีสินค้า</p>
            <Link href="/member/store/products/new"
              className="inline-flex items-center gap-1.5 text-[#DC2626] hover:text-[#FCA5A5] text-sm transition-colors">
              <Plus size={14} /> เพิ่มสินค้าแรก
            </Link>
          </div>
        ) : (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["สินค้า", "ราคา", "คอมฯ%", "สต็อก", "สถานะ", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-slate-500 font-medium text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg shrink-0 bg-white/5" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                              <Package size={16} className="text-slate-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate max-w-[160px]">{p.name}</p>
                            {p.tags.length > 0 && (
                              <p className="text-slate-600 text-xs truncate">{p.tags.slice(0,2).join(", ")}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-sm">฿{p.price.toLocaleString()}</p>
                        {p.original_price && (
                          <p className="text-slate-600 text-xs line-through">฿{p.original_price.toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#F59E0B] font-bold text-sm">{p.commission_rate}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", stockColor[p.stock_status] ?? stockColor.in_stock)}>
                          {stockLabel[p.stock_status] ?? p.stock_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", p.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-500")}>
                          {p.is_active ? "แสดง" : "ซ่อน"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ProductRowActions id={p.id} name={p.name} isActive={p.is_active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
