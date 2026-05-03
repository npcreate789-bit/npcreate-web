import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "../../_components/ProductForm"
import type { Product } from "@/types/database"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: stores }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("stores").select("id, name").eq("is_active", true).order("name"),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">แก้ไขสินค้า</h1>
        <p className="text-slate-400 text-sm mt-0.5 truncate max-w-lg">{(product as Product).name}</p>
      </div>
      <ProductForm product={product as Product} stores={stores ?? []} />
    </div>
  )
}
