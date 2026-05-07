"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, ImageIcon, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  onChange: (url: string) => void
  error?: string
}

export function ImageUploader({ value, onChange, error: fieldError }: Props) {
  const [isDragging,    setIsDragging]    = useState(false)
  const [isUploading,   setIsUploading]   = useState(false)
  const [uploadError,   setUploadError]   = useState<string | null>(null)
  const [localPreview,  setLocalPreview]  = useState<string | null>(null)
  const [justDone,      setJustDone]      = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const displaySrc = localPreview ?? value

  const upload = useCallback(async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("รองรับเฉพาะ JPG, PNG, WEBP")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("ขนาดไฟล์ต้องไม่เกิน 5MB")
      return
    }

    setUploadError(null)
    setJustDone(false)
    setIsUploading(true)

    const blobUrl = URL.createObjectURL(file)
    setLocalPreview(blobUrl)

    try {
      const fd = new FormData()
      fd.append("file", file)
      const res  = await fetch("/api/member/upload-image", { method: "POST", body: fd })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? "อัปโหลดไม่สำเร็จ")

      onChange(json.url)
      setJustDone(true)
      setTimeout(() => setJustDone(false), 2000)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ")
    } finally {
      URL.revokeObjectURL(blobUrl)
      setLocalPreview(null)
      setIsUploading(false)
    }
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }, [upload])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ""
  }, [upload])

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setUploadError(null)
    setJustDone(false)
  }, [onChange])

  const hasError = !!(fieldError || uploadError)

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="อัปโหลดรูปภาพสินค้า"
        className={cn(
          "relative aspect-square w-full max-w-[260px] rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden select-none",
          !isUploading && "cursor-pointer",
          isDragging   && "border-[#DC2626] bg-[#DC2626]/10 scale-[0.98]",
          !isDragging  && !displaySrc && !hasError && "border-white/10 bg-[#0A0808] hover:border-white/25 hover:bg-white/[0.025]",
          !isDragging  && !displaySrc &&  hasError && "border-red-500/40 bg-red-500/5",
          displaySrc   && !isDragging && "border-transparent",
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !isUploading && inputRef.current?.click()}
      >
        {displaySrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displaySrc}
              alt="preview"
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                isUploading && "opacity-40 blur-sm scale-105"
              )}
            />

            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="bg-black/60 rounded-2xl px-5 py-4 flex flex-col items-center gap-2">
                  <Loader2 className="text-white animate-spin" size={28} />
                  <p className="text-white text-xs font-semibold">กำลังอัปโหลด...</p>
                </div>
              </div>
            )}

            {justDone && !isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="flex flex-col items-center gap-1.5">
                  <CheckCircle2 className="text-emerald-400 drop-shadow-lg" size={38} />
                  <p className="text-emerald-300 text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">
                    อัปโหลดสำเร็จ
                  </p>
                </div>
              </div>
            )}

            {!isUploading && !justDone && (
              <div className="absolute inset-0 flex items-end justify-center pb-4 gap-2 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-t from-black/75 via-black/20 to-transparent">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Upload size={12} />
                  เปลี่ยนรูป
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-sm border border-red-500/30 text-red-300 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors"
                >
                  <X size={12} />
                  ลบรูป
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5">
            {isUploading ? (
              <>
                <Loader2 className="text-[#DC2626] animate-spin" size={36} />
                <p className="text-slate-300 text-sm font-semibold">กำลังอัปโหลด...</p>
              </>
            ) : (
              <>
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                  isDragging ? "bg-[#DC2626]/20" : "bg-white/5"
                )}>
                  {isDragging
                    ? <Upload size={26} className="text-[#DC2626]" />
                    : <ImageIcon size={26} className={hasError ? "text-red-400" : "text-slate-500"} />
                  }
                </div>
                <div className="text-center space-y-1">
                  <p className={cn("text-sm font-semibold", isDragging ? "text-[#DC2626]" : "text-slate-200")}>
                    {isDragging ? "วางรูปเพื่ออัปโหลด" : "วางรูปที่นี่ หรือคลิกเลือก"}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    JPG · PNG · WEBP · ≤5MB<br />อัตราส่วน 1:1 แนะนำ
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 rounded-[14px] ring-2 ring-[#DC2626] ring-offset-2 ring-offset-[#0A0808] pointer-events-none" />
        )}
      </div>

      {(uploadError ?? fieldError) && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs">
          <X size={12} className="shrink-0" />
          {uploadError ?? fieldError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
