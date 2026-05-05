export type ServicesPageSettings = {
  label: string
  heading1: string
  heading2: string
  heading2_color: string
  description: string
}

export const DEFAULT_SERVICES_PAGE: ServicesPageSettings = {
  label: "บริการของเรา",
  heading1: "ครบทุกขั้นตอน",
  heading2: "ดูแลถึง Result",
  heading2_color: "#DC2626",
  description:
    "ไม่ใช่แค่ยิงแอด — เราวางกลยุทธ์ ผลิต creative ติดตามผลลัพธ์ และปรับ campaign แบบ real-time เพื่อให้ทุกบาทที่ลงทุนได้ผลตอบแทนสูงสุด",
}

export function mergeServicesPage(raw: Record<string, unknown>): ServicesPageSettings {
  return { ...DEFAULT_SERVICES_PAGE, ...(raw as Partial<ServicesPageSettings>) }
}
