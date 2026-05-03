import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Thai } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"
import "./globals.css"
import { OrganizationJsonLd } from "@/components/JsonLd"

const inter    = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jakarta  = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" })
const notoThai = Noto_Sans_Thai({ subsets: ["thai"], variable: "--font-thai" })

const BASE_URL = "https://npcreate.co.th"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "NP Create — รับยิงแอด GMV Max & TikTok Shop",
    template: "%s | NP Create",
  },
  description:
    "ปั้นยอดขาย TikTok Shop ของคุณให้โต 10 เท่าด้วย GMV Max ดูแลมาแล้วมากกว่า 500 แบรนด์ ยอดขายรวมทะลุ 800 ล้านบาท",
  keywords: [
    "รับยิงแอด GMV Max", "TikTok Shop", "ยิงแอด TikTok",
    "การตลาดออนไลน์", "NP Create", "เพิ่มยอดขาย TikTok Shop",
  ],
  authors: [{ name: "NP Create", url: BASE_URL }],
  creator: "NP Create",
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: BASE_URL,
    siteName: "NP Create",
    title: "NP Create — รับยิงแอด GMV Max & TikTok Shop",
    description: "ปั้นยอดขาย TikTok Shop ของคุณให้โต 10 เท่าด้วย GMV Max",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NP Create" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NP Create — รับยิงแอด GMV Max & TikTok Shop",
    description: "ปั้นยอดขาย TikTok Shop ของคุณให้โต 10 เท่าด้วย GMV Max",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
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
