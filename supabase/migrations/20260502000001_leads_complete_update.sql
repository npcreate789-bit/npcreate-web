-- รวม migrations 002, 003, 005 + เพิ่ม admin UPDATE policy
-- ทุก statement เป็น idempotent (รันซ้ำได้ไม่เกิด error)

-- ─── Make LINE fields nullable (migration 002) ────────────────────────────────
ALTER TABLE public.leads ALTER COLUMN line_user_id DROP NOT NULL;
ALTER TABLE public.leads ALTER COLUMN display_name DROP NOT NULL;
ALTER TABLE public.leads ALTER COLUMN picture_url  DROP NOT NULL;

-- ─── Add line_id — LINE ID ที่กรอกเอง (migration 003) ────────────────────────
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS line_id text;

-- ─── Add member_id FK (migration 005) ────────────────────────────────────────
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS member_id uuid
    REFERENCES profiles(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS leads_member_id_idx ON public.leads(member_id);

-- ─── RLS: member อ่าน lead ของตัวเองได้ ──────────────────────────────────────
DROP POLICY IF EXISTS "members_read_own_leads" ON public.leads;
CREATE POLICY "members_read_own_leads" ON public.leads
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

-- ─── RLS: admin UPDATE leads ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_update_leads" ON public.leads;
CREATE POLICY "admin_update_leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
