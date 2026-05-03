import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Package, Megaphone, Users, MousePointerClick,
  Plus, ChevronRight, CheckCircle2, ExternalLink,
  Store as StoreIcon,
} from "lucide-react"
import { getMyStore, getStoreDashboardStats } from "./actions"
import { StoreSetupForm } from "./_components/StoreSetupForm"
import { cn } from "@/lib/utils"

export default async function StoreDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const store = await getMyStore()

  if (!store) {
    return (
      <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="flex items-center gap-3">
            <Link href="/member" className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0">
              <ChevronRight size={16} className="text-slate-400 group-hover:text-white rotate-180 transition-colors" />
            </Link>
            <h1 className="font-display font-bold text-white text-xl">ร้านค้าของฉัน</h1>
          </div>

          <div className="bg-[#1C0D0D] border border-emerald-500/10 rounded-2xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
              <StoreIcon size={28} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-lg">สร้างร้านค้าของคุณ</h2>
              <p className="text-slate-400 text-sm mt-1">เพิ่มสินค้า แคมเปญ และให้ Affiliate ช่วยขายให้คุณ</p>
            </div>
            <StoreSetupForm />
          </div>
        </div>
      </div>
    )
  }

  const stats = await getStoreDashboardStats(store.id)

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/member" className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0">
            <ChevronRight size={16} className="text-slate-400 group-hover:text-white rotate-180 transition-colors" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-white text-xl truncate">{store.name}</h1>
            <p className="text-slate-500 text-xs mt-0.5">{store.category}</p>
          </div>
          {store.is_verified && (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
              <CheckCircle2 size={11} /> ยืนยันแล้ว
            </span>
          )}
          {store.tiktok_shop_url && (
            <a href={store.tiktok_shop_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors shrink-0">
              <ExternalLink size={12} /> TikTok Shop
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<Package size={16} className="text-indigo-400" />} label="สินค้า (active)" value={`${stats.activeProducts}/${stats.totalProducts}`} color="bg-indigo-500/10" />
          <StatCard icon={<Megaphone size={16} className="text-[#F59E0B]" />} label="แคมเปญ active" value={stats.activeCampaigns} color="bg-[#F59E0B]/10" />
          <StatCard icon={<Users size={16} className="text-[#DC2626]" />} label="Affiliate ดึงสินค้า" value={stats.totalPulls} color="bg-[#DC2626]/10" />
          <StatCard icon={<MousePointerClick size={16} className="text-emerald-400" />} label="คลิกทั้งหมด" value={stats.totalClicks} color="bg-emerald-500/10" />
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/member/store/products"
            className="group flex items-center gap-4 bg-[#1C0D0D] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-2xl p-5 transition-colors">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Package size={18} className="text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">จัดการสินค้า</p>
              <p className="text-slate-500 text-xs mt-0.5">{stats.totalProducts} รายการ</p>
            </div>
            <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-indigo-400 transition-colors" />
          </Link>

          <Link href="/member/store/campaigns"
            className="group flex items-center gap-4 bg-[#1C0D0D] border border-white/5 hover:border-[#F59E0B]/30 hover:bg-[#F59E0B]/5 rounded-2xl p-5 transition-colors">
            <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center shrink-0">
              <Megaphone size={18} className="text-[#F59E0B]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-sm group-hover:text-[#F59E0B] transition-colors">จัดการแคมเปญ</p>
              <p className="text-slate-500 text-xs mt-0.5">{stats.activeCampaigns} active</p>
            </div>
            <ChevronRight size={15} className="text-slate-600 shrink-0 group-hover:text-[#F59E0B] transition-colors" />
          </Link>
        </div>

        {/* Quick add buttons */}
        <div className="flex gap-3 flex-wrap">
          <Link href="/member/store/products/new"
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={15} /> เพิ่มสินค้า
          </Link>
          <Link href="/member/store/campaigns/new"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={15} /> สร้างแคมเปญ
          </Link>
        </div>

      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className={cn("bg-[#1C0D0D] border border-white/5 rounded-2xl p-4 space-y-2")}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
        {icon}
      </div>
      <p className="text-white font-bold text-xl leading-none">{value}</p>
      <p className="text-slate-500 text-xs leading-tight">{label}</p>
    </div>
  )
}
