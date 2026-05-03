import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "../_components/ProductForm"

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("is_active", true)
    .order("name")

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">เพิ่มสินค้าใหม่</h1>
        <p className="text-slate-400 text-sm mt-0.5">สินค้าที่เพิ่มจะแสดงใน Marketplace ทันที (ถ้า is_active)</p>
      </div>
      <ProductForm stores={stores ?? []} />
    </div>
  )
}
