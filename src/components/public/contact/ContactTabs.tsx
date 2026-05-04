"use client"

import { useState } from "react"
import { Store, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { SellerContactForm } from "./SellerContactForm"
import { AffiliateContactForm } from "./AffiliateContactForm"
import { ContactInfo } from "./ContactInfo"

type Tab = "seller" | "affiliate"
type LineSession = { userId: string; displayName: string; pictureUrl: string }

interface Props {
  defaultTab:              Tab
  sellerHasSubmitted:      boolean
  affiliateHasSubmitted:   boolean
  lineSession:             LineSession | null
  isMember:                boolean
  lineOaHref:              string
}

export function ContactTabs({
  defaultTab,
  sellerHasSubmitted,
  affiliateHasSubmitted,
  lineSession,
  isMember,
  lineOaHref,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)

  return (
    <div className="space-y-6">

      {/* Tab switcher */}
      <div className="grid grid-cols-2 gap-2 bg-[#1C0D0D] border border-white/5 rounded-2xl p-1.5">
        <TabButton
          active={activeTab === "seller"}
          onClick={() => setActiveTab("seller")}
          icon={<Store size={15} />}
          label="สำหรับ Seller"
          desc="ยิงแอด / ดูแลร้านค้า"
          activeColor="bg-[#DC2626]"
        />
        <TabButton
          active={activeTab === "affiliate"}
          onClick={() => setActiveTab("affiliate")}
          icon={<GraduationCap size={15} />}
          label="คอร์ส & Affiliate"
          desc="เรียน / วางแผนกลยุทธ์"
          activeColor="bg-[#F59E0B]"
          activeTextColor="text-black"
        />
      </div>

      {/* Context subtitle */}
      <div className="text-center space-y-1 pb-1">
        {activeTab === "seller" ? (
          <>
            <p className="text-white font-semibold text-sm">ปรึกษา ยิงแอด GMV Max และวางกลยุทธ์ TikTok Shop</p>
            <p className="text-slate-500 text-xs">ปรึกษาฟรี ไม่มีข้อผูกมัด — เราวิเคราะห์ให้ก่อน ไม่ต้องตัดสินใจตอนนี้</p>
          </>
        ) : (
          <>
            <p className="text-white font-semibold text-sm">คอร์สเรียน TikTok Affiliate และบริการวางแผนกลยุทธ์</p>
            <p className="text-slate-500 text-xs">สำหรับ Creator ที่ต้องการเพิ่มรายได้จาก TikTok Shop — ไม่ต้องสมัครสมาชิก</p>
          </>
        )}
      </div>

      {/* Form area */}
      {activeTab === "seller" ? (
        <SellerContactForm
          hasSubmitted={sellerHasSubmitted}
          lineSession={lineSession}
          isMember={isMember}
          lineOaHref={lineOaHref}
        />
      ) : (
        <AffiliateContactForm
          hasSubmitted={affiliateHasSubmitted}
          lineSession={lineSession}
          lineOaHref={lineOaHref}
        />
      )}

      {/* Info cards */}
      <ContactInfo lineHref={lineOaHref} />

    </div>
  )
}

function TabButton({
  active, onClick, icon, label, desc, activeColor, activeTextColor = "text-white",
}: {
  active:           boolean
  onClick:          () => void
  icon:             React.ReactNode
  label:            string
  desc:             string
  activeColor:      string
  activeTextColor?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-center transition-all duration-200",
        active
          ? cn(activeColor, activeTextColor)
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <span className={cn("text-[11px]", active ? "opacity-75" : "text-slate-600")}>{desc}</span>
    </button>
  )
}
