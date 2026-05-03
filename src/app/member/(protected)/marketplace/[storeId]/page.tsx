import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Store, ExternalLink, Megaphone, Clock, Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getStoreDetail, getMyPulledProducts } from "../actions"
import { ProductCard } from "../_components/ProductCard"
import type { Product } from "@/types/database"

export default async function StoreDetailPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const [detail, myPulls] = await Promise.all([
    getStoreDetail(storeId),
    getMyPulledProducts(),
  ])
  if (!detail) notFound()

  const { store, products, activeCampaigns } = detail
  const pulledMap = new Map(myPulls.map(p => [p.product_id, p.pull_code]))
  const storeProducts = products.map(p => ({ ...p, store: { id: store.id, name: store.name, logo_url: store.logo_url, is_verified: store.is_verified } }))

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Back */}
        <div className="flex items-center gap-3">
          <Link href="/member/marketplace" className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0">
            <ChevronRight size={16} className="text-slate-400 group-hover:text-white rotate-180 transition-colors" />
          </Link>
          <h1 className="font-display font-bold text-white text-xl truncate">{store.name}</h1>
        </div>

        {/* Store Info */}
        <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl p-5 flex gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/[0.03] shrink-0 flex items-center justify-center">
            {store.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <Store size={24} className="text-slate-600" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-bold text-base">{store.name}</p>
              {store.is_verified && (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">ยืนยันแล้ว</span>
              )}
            </div>
            {store.category && <p className="text-slate-500 text-xs">{store.category}</p>}
            {store.description && <p className="text-slate-400 text-sm leading-relaxed">{store.description}</p>}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-slate-600 text-xs flex items-center gap-1">
                <Package size={11} /> {products.length} สินค้า
              </span>
              {store.tiktok_shop_url && (
                <a href={store.tiktok_shop_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#F59E0B] hover:text-[#FCD34D] flex items-center gap-1 transition-colors">
                  <ExternalLink size={11} /> TikTok Shop
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        {activeCampaigns.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <Megaphone size={14} className="text-[#F59E0B]" /> แคมเปญที่กำลังดำเนิน
            </h2>
            <div className="space-y-2">
              {activeCampaigns.map(c => {
                const now = new Date()
                const daysLeft = Math.ceil((new Date(c.ends_at).getTime() - now.getTime()) / 86400000)
                return (
                  <div key={c.id} className="bg-[#1C0D0D] border border-[#F59E0B]/20 rounded-xl p-4 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white font-semibold text-sm">{c.title}</p>
                      {c.special_commission_rate && (
                        <span className="text-[#F59E0B] font-bold text-sm shrink-0">+{c.special_commission_rate}% คอม</span>
                      )}
                    </div>
                    {c.description && <p className="text-slate-500 text-xs">{c.description}</p>}
                    <p className="text-slate-600 text-xs flex items-center gap-1">
                      <Clock size={10} /> เหลือ {daysLeft} วัน
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Products */}
        <section className="space-y-3">
          <h2 className="text-white font-semibold text-sm">สินค้าทั้งหมด ({products.length})</h2>
          {products.length === 0 ? (
            <div className="bg-[#1C0D0D] border border-white/5 rounded-2xl py-12 text-center">
              <p className="text-slate-500 text-sm">ยังไม่มีสินค้า</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {storeProducts.map((p: Product & { store: { id: string; name: string; logo_url: string | null; is_verified: boolean } }) => (
                <ProductCard key={p.id} product={p} pullCode={pulledMap.get(p.id)} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
