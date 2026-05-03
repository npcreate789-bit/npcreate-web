import { redirect } from "next/navigation"
import { ShoppingBag, Store, Megaphone } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getMarketplaceData, getMyPulledProducts } from "./actions"
import { ProductCard } from "./_components/ProductCard"
import { StoreCard } from "./_components/StoreCard"
import { CampaignBanner } from "./_components/CampaignBanner"

export default async function MarketplacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const [{ stores, featuredProducts, activeCampaigns }, myPulls] = await Promise.all([
    getMarketplaceData(),
    getMyPulledProducts(),
  ])

  const pulledMap = new Map(myPulls.map(p => [p.product_id, p.pull_code]))

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-white text-2xl flex items-center gap-2">
            <ShoppingBag size={22} className="text-[#DC2626]" /> Marketplace
          </h1>
          <p className="text-slate-500 text-sm mt-1">เลือกสินค้าเพื่อสร้างลิงก์แนะนำและรับคอมมิชชั่น</p>
        </div>

        {/* Active Campaigns */}
        {activeCampaigns.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <Megaphone size={15} className="text-[#F59E0B]" /> แคมเปญที่กำลังดำเนิน
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
              {activeCampaigns.map(c => (
                <CampaignBanner key={c.id} campaign={c} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <ShoppingBag size={15} className="text-[#DC2626]" /> สินค้าแนะนำ (คอมสูงสุด)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {featuredProducts.map(p => (
                <ProductCard key={p.id} product={p} pullCode={pulledMap.get(p.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Stores */}
        {stores.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <Store size={15} className="text-slate-400" /> ร้านค้าทั้งหมด
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stores.map(s => (
                <StoreCard key={s.id} store={s} />
              ))}
            </div>
          </section>
        )}

        {stores.length === 0 && featuredProducts.length === 0 && (
          <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-20 text-center space-y-3">
            <ShoppingBag size={36} className="text-slate-700 mx-auto" />
            <p className="text-slate-500 text-sm">ยังไม่มีสินค้าใน Marketplace</p>
            <p className="text-slate-600 text-xs">รอร้านค้าเพิ่มสินค้าเข้ามา</p>
          </div>
        )}

      </div>
    </div>
  )
}
