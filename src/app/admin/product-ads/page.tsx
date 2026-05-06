import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, Package, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductRowActions } from "./_components/ProductRowActions"
import type { Product, Store } from "@/types/database"

type ProductRow = Product & { store: Pick<Store, "id" | "name" | "is_verified"> | null }

const PAGE_SIZE = 20

const stockColor: Record<string, string> = {
  in_stock:     "bg-emerald-500/10 text-emerald-400",
  low_stock:    "bg-[#F59E0B]/10 text-[#F59E0B]",
  out_of_stock: "bg-red-500/10 text-red-400",
}
const stockLabel: Record<string, string> = {
  in_stock: "มีสินค้า", low_stock: "ใกล้หมด", out_of_stock: "หมด",
}

export default async function AdminProductAdsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; store?: string; page?: string }>
}) {
  const { q, store, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const supabase = await createClient()

  let query = supabase
    .from("products")
    .select("*, store:stores(id, name, is_verified)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (q) query = query.ilike("name", `%${q}%`)
  if (store) query = query.eq("store_id", store)

  const [{ data: products, count }, { data: stores }] = await Promise.all([
    query,
    supabase.from("stores").select("id, name").order("name"),
  ])

  const rows = (products ?? []) as ProductRow[]
  const total = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (store) params.set("store", store)
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return `/admin/product-ads${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#DC2626]" /> ProductAds
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">จัดการสินค้าใน ProductAds</p>
        </div>
        <Link
          href="/admin/product-ads/new"
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} /> เพิ่มสินค้า
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex items-center gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="ค้นหาชื่อสินค้า..."
          className="flex-1 max-w-xs bg-[#1C0D0D] border border-white/10 focus:border-[#DC2626]/40 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600 outline-none transition-colors"
        />
        <select
          name="store"
          defaultValue={store ?? ""}
          className="bg-[#1C0D0D] border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-sm outline-none focus:border-white/20 transition-colors"
        >
          <option value="">ทุกร้านค้า</option>
          {(stores ?? []).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-white/5 hover:bg-white/10 text-slate-300 text-sm px-4 py-2 rounded-xl transition-colors"
        >
          ค้นหา
        </button>
        {(q || store) && (
          <Link
            href="/admin/product-ads"
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            ล้าง
          </Link>
        )}
      </form>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>{total} สินค้า</span>
        {totalPages > 1 && <span>หน้า {page}/{totalPages}</span>}
      </div>

      {/* Table */}
      <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Package size={36} className="text-slate-700 mx-auto" />
            <p className="text-slate-500 text-sm">
              {q || store ? "ไม่พบสินค้าที่ตรงกัน" : "ยังไม่มีสินค้า"}
            </p>
            <Link
              href="/admin/product-ads/new"
              className="inline-flex items-center gap-1.5 text-[#DC2626] hover:text-[#FCA5A5] text-sm transition-colors"
            >
              <Plus size={14} /> เพิ่มสินค้าแรก
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["สินค้า", "ร้านค้า", "ราคา", "คอม", "สต็อก", ""].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-slate-500 font-medium text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map(p => (
                  <tr key={p.id} className={cn("hover:bg-white/[0.02] transition-colors", !p.is_active && "opacity-50")}>
                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] overflow-hidden shrink-0">
                          {p.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={14} className="text-slate-700" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate max-w-[200px]">{p.name}</p>
                          {p.promotion_text && (
                            <p className="text-[#F59E0B] text-[10px] truncate max-w-[200px] mt-0.5">{p.promotion_text}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Store */}
                    <td className="px-5 py-4">
                      <p className="text-slate-300 text-xs whitespace-nowrap">
                        {p.store?.name ?? "—"}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-white font-semibold text-sm">฿{p.price.toLocaleString()}</p>
                      {p.original_price && (
                        <p className="text-slate-600 text-[10px] line-through">
                          ฿{p.original_price.toLocaleString()}
                        </p>
                      )}
                    </td>

                    {/* Commission */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-[#F59E0B] font-bold text-sm">{p.commission_rate}%</p>
                      <p className="text-[#F59E0B]/60 text-[10px]">
                        ≈ ฿{Math.round(p.price * p.commission_rate / 100).toLocaleString()}
                      </p>
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        stockColor[p.stock_status] ?? stockColor.in_stock
                      )}>
                        {stockLabel[p.stock_status] ?? "มีสินค้า"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <ProductRowActions id={p.id} name={p.name} isActive={p.is_active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={pageHref(page - 1)}
            aria-disabled={page <= 1}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors",
              page <= 1
                ? "pointer-events-none text-slate-600"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <ChevronLeft size={14} /> ก่อนหน้า
          </Link>
          <span className="text-slate-500 text-xs">หน้า {page} / {totalPages}</span>
          <Link
            href={pageHref(page + 1)}
            aria-disabled={page >= totalPages}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors",
              page >= totalPages
                ? "pointer-events-none text-slate-600"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            ถัดไป <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}
