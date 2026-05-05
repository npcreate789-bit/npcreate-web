import { createClient } from "@/lib/supabase/server"
import { mergeHomepage } from "@/lib/data/homepage"
import { HeroSection } from "@/components/public/HeroSection"
import { PromoBannersSection } from "@/components/public/PromoBannersSection"
import { ServicesSection } from "@/components/public/ServicesSection"
import { WhyUsSection } from "@/components/public/WhyUsSection"
import { TestimonialsSection } from "@/components/public/TestimonialsSection"
import { CTASection } from "@/components/public/CTASection"
import type { Testimonial, HeroMedia, PromoBanner } from "@/types/database"

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: settingsData },
    { data: testimonialsData },
    { data: heroMediaData },
    { data: promoBannersData },
  ] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "homepage").maybeSingle(),
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("hero_media")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(5),
    supabase
      .from("promo_banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
  ])

  const hp           = mergeHomepage((settingsData?.value ?? {}) as Record<string, unknown>)
  const testimonials = (testimonialsData as Testimonial[])  ?? []
  const heroMedia    = (heroMediaData    as HeroMedia[])    ?? []
  const promoBanners = (promoBannersData as PromoBanner[])  ?? []

  return (
    <main>
      <HeroSection settings={hp} media={heroMedia} lineHref="/contact" />
      <PromoBannersSection banners={promoBanners} />
      {hp.stats.length > 0 && (
        <div className="bg-[#0A0808] py-10">
          <div className="max-w-lg mx-auto px-4 grid grid-cols-3 gap-6">
            {hp.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-2xl sm:text-3xl text-[#F59E0B]">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ServicesSection settings={hp.services_section} />
      <WhyUsSection settings={hp.why_us} lineHref="/contact" />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection settings={hp.cta_section} lineOaHref="/contact" />
    </main>
  )
}
