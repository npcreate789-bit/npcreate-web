"use client"

import { useRef, useState } from "react"
import { Camera, Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { updateAvatarUrl, removeAvatarUrl } from "../actions"

interface AvatarUploadProps {
  userId: string
  avatarUrl: string | null
  initials: string
}

export function AvatarUpload({ userId, avatarUrl, initials }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError("ไฟล์ต้องมีขนาดไม่เกิน 2MB")
      return
    }
    setError(null)
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
      // Bust cache by appending timestamp
      const urlWithBust = `${publicUrl}?t=${Date.now()}`

      await updateAvatarUrl(urlWithBust)
      setPreview(urlWithBust)
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ")
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function handleDelete() {
    if (!preview) return
    setDeleting(true)
    setError(null)
    try {
      const supabase = createClient()
      // Try to remove all common extensions
      const paths = ["jpg", "jpeg", "png", "webp", "gif"].map((ext) => `${userId}/avatar.${ext}`)
      await supabase.storage.from("avatars").remove(paths)
      await removeAvatarUrl()
      setPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบรูปไม่สำเร็จ")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar circle */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full bg-[#DC2626]/10 border-2 border-[#DC2626]/20 flex items-center justify-center overflow-hidden">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#DC2626] font-bold text-3xl">{initials}</span>
          )}
        </div>

        {/* Overlay on hover */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="เปลี่ยนรูปโปรไฟล์"
        >
          {uploading
            ? <Loader2 size={20} className="text-white animate-spin" />
            : <Camera size={20} className="text-white" />
          }
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || deleting}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          {uploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูป"}
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading || deleting}
            className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            {deleting ? "กำลังลบ..." : "ลบรูป"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
