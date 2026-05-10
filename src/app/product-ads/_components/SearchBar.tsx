"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X, Heart } from "lucide-react"

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(defaultValue ?? "")
  const initialRender = useRef(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchParamsRef = useRef(searchParams)

  useEffect(() => {
    searchParamsRef.current = searchParams
  }, [searchParams])

  function applySearch(value: string) {
    const params = new URLSearchParams(searchParamsRef.current.toString())
    const trimmed = value.trim()
    if (trimmed) {
      params.set("q", trimmed)
    } else {
      params.delete("q")
    }
    params.delete("page")
    const qs = params.toString()
    router.replace(qs ? `/product-ads?${qs}` : "/product-ads", { scroll: false })
  }

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => applySearch(q), 400)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        if (timerRef.current) clearTimeout(timerRef.current)
        applySearch(q)
      }}
      className="relative"
    >
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      <input
        type="search"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="ค้นหาสินค้า..."
        aria-label="ค้นหาสินค้า"
        autoComplete="off"
        enterKeyHint="search"
        className="w-full bg-[#1C0D0D] border border-white/10 focus:border-[#DC2626]/40 focus:ring-2 focus:ring-[#DC2626]/10 rounded-xl pl-10 pr-10 py-2.5 text-white text-base placeholder:text-slate-600 outline-none transition-colors"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          aria-label="ล้างคำค้นหา"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </form>
  )
}

export function SortSelect({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set("sort", e.target.value)
    } else {
      params.delete("sort")
    }
    router.replace(`/product-ads?${params.toString()}`, { scroll: false })
  }

  return (
    <select
      defaultValue={defaultValue ?? "commission"}
      onChange={handleChange}
      className="bg-[#1C0D0D] border border-white/10 rounded-xl px-3 py-2.5 text-slate-300 text-base outline-none focus:border-white/20 transition-colors cursor-pointer"
    >
      <option value="commission">คอมสูงสุด</option>
      <option value="newest">ล่าสุด</option>
      <option value="popular">ยอดนิยม</option>
    </select>
  )
}

export function InterestSelect({
  defaultValue,
  options,
}: {
  defaultValue?: string
  options: { tag: string; pull_count: number }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set("interest", e.target.value)
    } else {
      params.delete("interest")
    }
    params.delete("page")
    router.replace(`/product-ads?${params.toString()}`, { scroll: false })
  }

  if (options.length === 0) return null

  return (
    <div className="relative">
      <Heart size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#DC2626] pointer-events-none" />
      <select
        value={defaultValue ?? ""}
        onChange={handleChange}
        className="bg-[#1C0D0D] border border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-slate-300 text-base outline-none focus:border-white/20 transition-colors cursor-pointer max-w-[160px]"
      >
        <option value="">ความสนใจ: ทั้งหมด</option>
        {options.map(o => (
          <option key={o.tag} value={o.tag}>
            {o.tag}{o.pull_count > 0 ? ` (${o.pull_count})` : ""}
          </option>
        ))}
      </select>
    </div>
  )
}
