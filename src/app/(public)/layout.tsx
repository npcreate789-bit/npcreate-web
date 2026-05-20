import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { FloatingLineButton } from "@/components/public/FloatingLineButton"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0808]">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer lineHref="https://app.npcreate.co.th/contact" />
      <FloatingLineButton href="https://app.npcreate.co.th/contact" />
    </div>
  )
}
