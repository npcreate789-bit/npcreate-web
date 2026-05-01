import { PromoBannerForm } from "../_components/PromoBannerForm"

export default function NewPromoBannerPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">เพิ่มแบนเนอร์ใหม่</h1>
        <p className="text-slate-400 text-sm mt-0.5">สร้างแบนเนอร์โปรโมชันสำหรับหน้าแรก</p>
      </div>
      <PromoBannerForm />
    </div>
  )
}
