-- เพิ่ม member_id เพื่อเชื่อม leads กับ profiles (ถ้า lead ส่งมาในฐานะสมาชิก)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS member_id uuid
    REFERENCES profiles(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS leads_member_id_idx ON leads(member_id);

-- อนุญาตให้ authenticated user อ่าน lead ของตัวเองได้
DROP POLICY IF EXISTS "members_read_own_leads" ON leads;
CREATE POLICY "members_read_own_leads" ON leads
  FOR SELECT
  TO authenticated
  USING (member_id = auth.uid());
