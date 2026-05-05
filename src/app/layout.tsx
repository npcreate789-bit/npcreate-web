import type { Metadata, Viewport } from "next"
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Thai } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"
import "./globals.css"
import { OrganizationJsonLd } from "@/components/JsonLd"
import { getSiteInfo } from "@/lib/data/site-info"

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
  const info = await getSiteInfo()
  const keywords = info.seo_keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: info.seo_title,
      template: `%s | ${info.site_name}`,
    },
    description: info.seo_description,
    keywords,
    authors: [{ name: info.site_name, url: BASE_URL }],
    creator: info.site_name,
    alternates: { canonical: BASE_URL },
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: BASE_URL,
      siteName: info.site_name,
      title: info.seo_title,
      description: info.seo_description,
      images: [{ url: "/og-image.png?v=2", width: 1200, height: 1200, alt: info.site_name }],
    },
    twitter: {
      card: "summary_large_image",
      title: info.seo_title,
      description: info.seo_description,
      images: ["/og-image.png?v=2"],
    },
    robots: { index: true, follow: true },
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning className="bg-[#0A0808]">
      <head>
        <meta property="fb:app_id" content="1768055977512245" />
      </head>
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
