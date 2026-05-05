import type { Metadata, Viewport } from "next"
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Thai } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"
import "./globals.css"
import { OrganizationJsonLd } from "@/components/JsonLd"
import { createClient } from "@/lib/supabase/server"
import { mergeSiteInfo } from "@/lib/data/site-info"

const inter    = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jakarta  = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" })
const notoThai = Noto_Sans_Thai({ subsets: ["thai"], variable: "--font-thai", weight: ["300", "400", "500", "600", "700"] })

const BASE_URL = "https://npcreate.co.th"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "site_info")
    .maybeSingle()

  const info = mergeSiteInfo((data?.value ?? {}) as Record<string, unknown>)
  const title = info.seo_title || "NP Create — รับยิงแอด GMV Max & TikTok Shop"
  const description = info.seo_description || "ปั้นยอดขาย TikTok Shop ของคุณให้โต 10 เท่าด้วย GMV Max ดูแลมาแล้วมากกว่า 500 แบรนด์ ยอดขายรวมทะลุ 800 ล้านบาท"
  const keywords = info.seo_keywords
    ? info.seo_keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : ["รับยิงแอด GMV Max", "TikTok Shop", "ยิงแอด TikTok", "การตลาดออนไลน์", "NP Create", "เพิ่มยอดขาย TikTok Shop"]

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: title,
      template: `%s | ${info.site_name || "NP Create"}`,
    },
    description,
    keywords,
    authors: [{ name: info.site_name || "NP Create", url: BASE_URL }],
    creator: info.site_name || "NP Create",
    alternates: { canonical: BASE_URL },
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: BASE_URL,
      siteName: info.site_name || "NP Create",
      title,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: info.site_name || "NP Create" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    robots: { index: true, follow: true },
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning className="bg-[#0A0808]">
      <body className={`${inter.variable} ${jakarta.variable} ${notoThai.variable} font-sans antialiased bg-[#0A0808]`}>
        <OrganizationJsonLd />
        {children}
        <Toaster position="bottom-center" theme="dark" richColors duration={3000} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
