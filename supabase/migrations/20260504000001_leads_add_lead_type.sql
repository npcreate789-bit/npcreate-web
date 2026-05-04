-- แยก lead_type ระหว่าง seller (ซื้อ service จาก NP Create) กับ affiliate (คอร์ส/วางแผน)
-- และเพิ่ม tiktok_url สำหรับ affiliate leads

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS lead_type text NOT NULL DEFAULT 'seller'
    CONSTRAINT leads_lead_type_check CHECK (lead_type IN ('seller', 'affiliate')),
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ALTER COLUMN brand DROP NOT NULL,
  ALTER COLUMN monthly_gmv DROP NOT NULL;

CREATE INDEX IF NOT EXISTS leads_lead_type_idx ON public.leads (lead_type);
