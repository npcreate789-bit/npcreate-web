import Link from "next/link"
import { Megaphone, Clock } from "lucide-react"
import type { CampaignWithStore } from "../actions"

export function CampaignBanner({ campaign }: { campaign: CampaignWithStore }) {
  const endsAt = new Date(campaign.ends_at)
  const daysLeft = Math.ceil((endsAt.getTime() - Date.now()) / 86400000)

  return (
    <Link href={`/member/marketplace/${campaign.store_id}`}
      className="relative bg-[#1C0D0D] border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 rounded-2xl overflow-hidden transition-colors shrink-0 w-[260px] flex flex-col">
      {campaign.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={campaign.banner_url} alt={campaign.title} className="w-full h-28 object-cover" />
      ) : (
        <div className="w-full h-28 bg-gradient-to-br from-[#F59E0B]/10 to-[#DC2626]/10 flex items-center justify-center">
          <Megaphone size={28} className="text-[#F59E0B]/40" />
        </div>
      )}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-white font-semibold text-sm leading-snug line-clamp-2">{campaign.title}</p>
        <p className="text-slate-500 text-xs truncate">{campaign.store.name}</p>
        <div className="flex items-center justify-between mt-auto pt-1">
          {campaign.special_commission_rate && (
            <span className="text-[#F59E0B] font-bold text-sm">+{campaign.special_commission_rate}% คอม</span>
          )}
          {daysLeft > 0 && (
            <span className="text-slate-500 text-xs flex items-center gap-1 ml-auto">
              <Clock size={10} /> {daysLeft} วัน
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
