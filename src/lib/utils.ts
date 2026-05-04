import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Strip unsafe protocols (javascript:, data:, etc.) — only allow https://, http://, or internal paths. */
export function safeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const t = url.trim()
  if (/^https?:\/\//i.test(t) || t.startsWith("/")) return t
  return undefined
}
