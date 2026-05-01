-- เพิ่ม column line_id สำหรับเก็บ LINE ID ที่ผู้ติดต่อกรอกเอง (ค้นหาใน LINE app ได้)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS line_id text;
