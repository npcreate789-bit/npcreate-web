"use client"

import { useState } from "react"
import { Store, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { SellerContactForm } from "./SellerContactForm"
import { AffiliateContactForm } from "./AffiliateContactForm"
import { ContactInfo } from "./ContactInfo"

type FormType   = "seller" | "affiliate"
type UserRole   = "seller" | "affiliate" | "admin" | null
type LineSession = { userId: string; displayName: string; pictureUrl: string }

interface Props {
  userRole:              UserRole
  defaultFormType:       FormType     // fallback เมื่อ userRole = null (จาก URL ?type=)
  sellerHasSubmitted:    boolean
  affiliateHasSubmitted: boolean
  lineSession:           LineSession | null
  isMember:              boolean
  lineOaHref:            string
}

export function ContactForm({
  userRole,
  defaultFormType,
  sellerHasSubmitted,
  affiliateHasSubmitted,
  lineSession,
  isMember,
  lineOaHref,
}: Props) {
  // Logged-in: lock form type to user's role (cannot change)
  // Not logged-in: allow manual switch via compact pills, default from URL param
  const lockedType: FormType | null =
    userRole === "affiliate" ? "affiliate"
    : (userRole === "seller" || userRole === "admin") ? "seller"
    : null

  const [formType, setFormType] = useState<FormType>(lockedType ?? defaultFormType)
  const isLocked = lockedType !== null

  return (
    <div className="space-y-5">

      {/* ── Role indicator: logged-in → auto-detected, no switcher ─────────────── */}
      {isLocked ? (
        <div className={cn(
          "flex items-center gap-2.5 px-4 py-3 rounded-2xl border",
          formType === "seller"
            ? "bg-emerald-500/8 border-emerald-500/20"
            : "bg-[#F59E0B]/8 border-[#F59E0B]/20"
        )}>
          {formType === "seller"
            ? <Store size={14} className="text-emerald-400 shrink-0" />
            : <TrendingUp size={14} className="text-[#F59E0B] shrink-0" />
          }
          <p className={cn(
            "text-sm font-medium",
            formType === "seller" ? "text-emerald-300" : "text-[#F59E0B]"
          )}>
            ส่งข้อมูลในฐานะ <strong>{formType === "seller" ? "Seller" : "Affiliate"}</strong>
            <span className="ml-1.5 font-normal opacity-60 text-xs">· ตรวจสอบจากบัญชีของคุณอัตโนมัติ</span>
          </p>
        </div>
      ) : (
        /* ── Compact switcher: not logged-in → ยังไม่รู้ role ────────────────── */
        <div className="flex items-center gap-1.5 bg-[#1C0D0D] border border-white/5 rounded-2xl p-1.5">
          <SwitchPill
            active={formType === "seller"}
            onClick={() => setFormType("seller")}
            icon={<Store size={13} />}
            label="สำหรับ Seller"
            activeClass="bg-[#DC2626] text-white"
          />
          <SwitchPill
            active={formType === "affiliate"}
            onClick={() => setFormType("affiliate")}
            icon={<TrendingUp size={13} />}
            label="คอร์ส & Affiliate"
            activeClass="bg-[#F59E0B] text-black"
          />
        </div>
      )}

      {/* ── Context subtitle ─────────────────────────────────────────────────── */}
      <div className="text-center space-y-0.5 pb-1">
        {formType === "seller" ? (
          <>
            <p className="text-white font-semibold text-sm">ปรึกษา ยิงแอด GMV Max และวางกลยุทธ์ TikTok Shop</p>
            <p className="text-slate-500 text-xs">ปรึกษาฟรี ไม่มีข้อผูกมัด — เราวิเคราะห์ให้ก่อน ไม่ต้องตัดสินใจตอนนี้</p>
          </>
        ) : (
          <>
            <p className="text-white font-semibold text-sm">คอร์สเรียน TikTok Affiliate และบริการวางแผนกลยุทธ์</p>
            <p className="text-slate-500 text-xs">สำหรับ Creator ที่ต้องการเพิ่มรายได้จาก TikTok Shop</p>
          </>
        )}
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      {formType === "seller" ? (
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

      {/* ── Info cards ────────────────────────────────────────────────────────── */}
      <ContactInfo lineHref={lineOaHref} />
    </div>
  )
}

function SwitchPill({
  active, onClick, icon, label, activeClass,
}: {
  active:      boolean
  onClick:     () => void
  icon:        React.ReactNode
  label:       string
  activeClass: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
        active ? activeClass : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
      {label}
    </button>
  )
}
