import { Suspense } from "react"
import { ShoppingBag, Megaphone, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getMarketplaceProducts, getActiveCampaigns, getMyPullSet } from "./actions"
import { ProductCard } from "./_components/ProductCard"
import { SearchBar, SortSelect } from "./_components/SearchBar"
import Link from "next/link"

export const metadata = {
  title: "Marketplace — NP Create",
  description: "เลือกสินค้าโปรโมทผ่าน TikTok และรับค่าคอมมิชชั่น",
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>
}) {
  const { q, sort } = await searchParams
  const validSort = (["commission", "newest", "popular"] as const).find(s => s === sort) ?? "commission"

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [products, campaigns, profileRes, pulledSet] = await Promise.all([
    getMarketplaceProducts({ q, sort: validSort }),
    getActiveCampaigns(),
    user
      ? supabase.from("profiles").select("role, tiktok_channel_url, is_active").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user ? getMyPullSet() : Promise.resolve(new Set<string>()),
  ])

  const isLoggedIn   = !!user
  const isAffiliate  = profileRes.data?.role === "affiliate"
  const hasTiktok    = !!profileRes.data?.tiktok_channel_url

  return (
    <div className="min-h-screen bg-[#0A0808] pb-16">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0A0808]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <Suspense fallback={<div className="h-10 bg-white/5 rounded-xl animate-pulse" />}>
              <SearchBar defaultValue={q} />
            </Suspense>
          </div>
          <Suspense fallback={null}>
            <SortSelect defaultValue={validSort} />
          </Suspense>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-7">

        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-white text-2xl flex items-center gap-2">
              <ShoppingBag size={22} className="text-[#DC2626]" /> Marketplace
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {q ? `ผลการค้นหา "${q}" — ${products.length} สินค้า` : `${products.length} สินค้าทั้งหมด`}
            </p>
          </div>
          {isLoggedIn && isAffiliate && (
            <Link href="/member/my-products"
              className="text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
              สินค้าของฉัน →
            </Link>
          )}
          {!isLoggedIn && (
            <Link href="/register"
              className="inline-flex items-center gap-1.5 text-xs text-[#DC2626] hover:text-[#FCA5A5] border border-[#DC2626]/30 hover:border-[#DC2626]/60 px-3 py-1.5 rounded-lg transition-colors">
              สมัครสมาชิกฟรี →
            </Link>
          )}
        </div>

        {/* TikTok warn banner for affiliate without TikTok */}
        {isLoggedIn && isAffiliate && !hasTiktok && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-amber-300 text-sm font-medium">เพิ่มลิงก์ TikTok ของคุณ</p>
              <p className="text-amber-400/70 text-xs mt-0.5">Seller จะได้เห็นช่องของคุณและอาจส่งสินค้าตัวอย่างให้</p>
            </div>
            <Link href="/member/profile"
              className="shrink-0 text-xs text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/60 px-3 py-1.5 rounded-lg transition-colors">
              เพิ่มเลย →
            </Link>
          </div>
        )}

        {/* Active Campaigns strip */}
        {campaigns.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <Megaphone size={14} className="text-[#F59E0B]" /> แคมเปญที่กำลังดำเนิน
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-hide">
              {campaigns.map(c => {
                const daysLeft = Math.ceil((new Date(c.ends_at).getTime() - new Date().getTime()) / 86400000)
                return (
                  <div key={c.id}
                    className="shrink-0 bg-[#1C0D0D] border border-[#F59E0B]/20 rounded-xl px-4 py-3 space-y-1 w-[220px]">
                    <p className="text-white font-semibold text-xs line-clamp-1">{c.title}</p>
                    <p className="text-slate-500 text-[10px]">{c.store.name}</p>
                    <div className="flex items-center justify-between">
                      {c.special_commission_rate && (
                        <span className="text-[#F59E0B] font-bold text-xs">+{c.special_commission_rate}% คอม</span>
                      )}
                      <span className="text-slate-600 text-[10px] flex items-center gap-1 ml-auto">
                        <Clock size={9} /> {daysLeft} วัน
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-20 text-center space-y-3">
            <ShoppingBag size={36} className="text-slate-700 mx-auto" />
            <p className="text-slate-500 text-sm">
              {q ? `ไม่พบสินค้าที่ตรงกับ "${q}"` : "ยังไม่มีสินค้าใน Marketplace"}
            </p>
            {q && (
              <Link href="/marketplace" className="text-xs text-[#DC2626] hover:text-[#FCA5A5] transition-colors">
                ดูสินค้าทั้งหมด →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                isPulled={pulledSet.has(p.id)}
                isLoggedIn={isLoggedIn}
                isAffiliate={isAffiliate}
                hasTiktok={hasTiktok}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
