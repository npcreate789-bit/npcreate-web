import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getMyStore } from "../../actions"
import { getStoreProducts } from "../../products/actions"
import { CampaignForm } from "../_components/CampaignForm"

export default async function NewCampaignPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/member/login")

  const store = await getMyStore()
  if (!store) redirect("/member/store")

  const products = await getStoreProducts()

  return (
    <div className="min-h-screen bg-[#0A0808] pt-10 pb-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/member/store/campaigns" className="group w-9 h-9 flex items-center justify-center bg-[#1C0D0D] border border-white/5 hover:border-white/15 rounded-xl transition-colors shrink-0">
            <ChevronRight size={16} className="text-slate-400 group-hover:text-white rotate-180 transition-colors" />
          </Link>
          <h1 className="font-display font-bold text-white text-xl">สร้างแคมเปญ</h1>
        </div>
        <CampaignForm products={products} />
      </div>
    </div>
  )
}
