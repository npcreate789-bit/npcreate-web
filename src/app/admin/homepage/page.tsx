import { createClient } from "@/lib/supabase/server"
import { mergeHomepage } from "@/lib/data/homepage"
import { HomepageForm } from "./_components/HomepageForm"
import { HomepageHeader } from "./_components/HomepageHeader"

export default async function HomepageSettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "homepage")
    .maybeSingle()

  const settings = mergeHomepage((data?.value ?? {}) as Record<string, unknown>)

  return (
    <div className="space-y-6">
      <HomepageHeader />
      <HomepageForm initial={settings} />
    </div>
  )
}
