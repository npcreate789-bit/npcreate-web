import { Suspense } from "react"
import { ShoppingBag, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getMarketplaceProducts, getActiveCampaigns, getMyPullSet } from "./actions"
import { ProductCard } from "./_components/ProductCard"
import { SearchBar, SortSelect } from "./_components/SearchBar"
import { CampaignSection } from "./_components/CampaignSection"
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
  const isSeller     = profileRes.data?.role === "seller"
  const hasTiktok    = !!profileRes.data?.tiktok_channel_url
  const memberName   = profileRes.data ? (profileRes.data as { full_name?: string | null }).full_name ?? null : null

  return (
    <div className="min-h-screen bg-[#0A0808] pb-16">
      {/* Sticky header */}
      <div className="border-b border-white/5 bg-[#0A0808]/90 backdrop-blur-sm sticky top-0 z-10">
        {/* Member identity bar — logged-in only */}
        {isLoggedIn && (
          <div className="border-b border-white/[0.04] bg-white/[0.01]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${isAffiliate ? "bg-[#F59E0B]/20 text-[#F59E0B]" : isSeller ? "bg-emerald-500/20 text-emerald-400" : "bg-[#DC2626]/20 text-[#DC2626]"}`}>
                  {memberName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="text-slate-500 text-xs truncate">
                  {memberName ?? "สมาชิก"}
                  {isAffiliate && <span className="text-[#F59E0B] ml-1 font-medium">· Affiliate</span>}
                  {isSeller    && <span className="text-emerald-400 ml-1 font-medium">· Seller</span>}
                </span>
              </div>
              <Link href="/member"
                className="flex items-center gap-1 text-slate-500 hover:text-white text-[11px] transition-colors shrink-0">
                <LayoutDashboard size={11} /> Member Portal
              </Link>
            </div>
          </div>
        )}
        {/* Search + sort */}
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
              className="flex items-center gap-1.5 text-xs text-[#F59E0B] border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 bg-[#F59E0B]/5 hover:bg-[#F59E0B]/10 px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0">
              <ShoppingBag size={11} /> สินค้าของฉัน →
            </Link>
          )}
          {isLoggedIn && isSeller && (
            <Link href="/member/store"
              className="flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0">
              จัดการร้านค้า →
            </Link>
          )}
          {!isLoggedIn && (
            <Link href="/register"
              className="inline-flex items-center gap-1.5 text-xs text-[#DC2626] hover:text-[#FCA5A5] border border-[#DC2626]/30 hover:border-[#DC2626]/60 px-3 py-1.5 rounded-lg transition-colors shrink-0">
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

        {/* Active Campaigns */}
        <CampaignSection campaigns={campaigns} />

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
                isSeller={isSeller}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
