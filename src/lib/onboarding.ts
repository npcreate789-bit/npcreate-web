import type { Profile, UserRole } from "@/types/database"

export type OnboardingKey = "line" | "tiktok"

export type OnboardingItem = {
  key:         OnboardingKey
  label:       string
  description: string
  href:        string
  done:        boolean
}

export type OnboardingStatus = {
  isComplete:     boolean
  items:          OnboardingItem[]
  missing:        OnboardingItem[]
  completedCount: number
  totalCount:     number
  progressPct:    number
}

type ProfileForOnboarding = Pick<Profile, "role" | "line_user_id" | "tiktok_channel_url">

const LINE_LOGIN_HREF = "/api/auth/line?returnTo=/member/profile"

export function getOnboardingItems(role: UserRole, profile: ProfileForOnboarding): OnboardingItem[] {
  const lineDone   = !!profile.line_user_id
  const tiktokDone = !!profile.tiktok_channel_url

  if (role === "affiliate") {
    return [
      {
        key: "line",
        label: "เชื่อมต่อ LINE",
        description: "ให้ Seller และทีมงานติดต่อกลับได้สะดวก",
        href: LINE_LOGIN_HREF,
        done: lineDone,
      },
      {
        key: "tiktok",
        label: "เพิ่มช่อง TikTok",
        description: "เพื่อให้ Seller พิจารณาส่งสินค้าตัวอย่างให้",
        href: "/member/profile#tiktok",
        done: tiktokDone,
      },
    ]
  }

  if (role === "seller") {
    return [
      {
        key: "line",
        label: "เชื่อมต่อ LINE",
        description: "รับแจ้งเตือนเมื่อมี Affiliate ขอดึงสินค้า",
        href: LINE_LOGIN_HREF,
        done: lineDone,
      },
    ]
  }

  return []
}

export function getOnboardingStatus(profile: ProfileForOnboarding): OnboardingStatus {
  const items   = getOnboardingItems(profile.role, profile)
  const missing = items.filter(i => !i.done)
  const total   = items.length
  const done    = total - missing.length

  return {
    items,
    missing,
    completedCount: done,
    totalCount:     total,
    isComplete:     missing.length === 0,
    progressPct:    total === 0 ? 100 : Math.round((done / total) * 100),
  }
}

export function buildOnboardingError(missing: OnboardingItem[]): string {
  if (missing.length === 0) return ""
  const labels = missing.map(m => m.label).join(" และ ")
  return `กรุณา${labels}ก่อนใช้งานฟีเจอร์นี้`
}
