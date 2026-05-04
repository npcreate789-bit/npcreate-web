-- ═══════════════════════════════════════════════════════════════════════════════
-- ล้างข้อมูลสมาชิกทั้งหมด (ยกเว้น admin) + Reset NP sequence ขึ้นต้น 1 ใหม่
-- ═══════════════════════════════════════════════════════════════════════════════
-- วิธีใช้: Supabase Dashboard → SQL Editor → วางทั้งหมด → Run
-- ⚠️  ลบแล้วกู้คืนไม่ได้ — ตรวจสอบ admin email ก่อนรันเสมอ
--
-- Cascade chain ที่จะเกิดขึ้น:
--   auth.users
--     └── profiles              (ON DELETE CASCADE)
--           ├── stores          (ON DELETE CASCADE via seller_id)
--           │     ├── products  (ON DELETE CASCADE via store_id)
--           │     │     └── affiliate_pulls (ON DELETE CASCADE via product_id)
--           │     └── campaigns (ON DELETE CASCADE via store_id)
--           └── affiliate_pulls (ON DELETE CASCADE via affiliate_id)
--   leads.member_id → profiles  (RESTRICT — ต้อง NULL ก่อน)
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────
-- ตรวจสอบก่อนลบ (uncomment เพื่อดู preview ก่อนรัน)
-- ────────────────────────────────────────────────────────────────
-- SELECT
--   p.user_code,
--   p.full_name,
--   p.role,
--   u.email,
--   p.created_at
-- FROM public.profiles p
-- JOIN auth.users u ON u.id = p.id
-- WHERE p.role != 'admin'
-- ORDER BY p.created_at;

-- ────────────────────────────────────────────────────────────────
-- STEP 1: ตัด FK leads.member_id สำหรับสมาชิกที่จะลบ
--         (ไม่มี ON DELETE CASCADE → ต้อง NULL ก่อน)
-- ────────────────────────────────────────────────────────────────
UPDATE public.leads
   SET member_id = NULL
 WHERE member_id IN (
   SELECT id FROM public.profiles WHERE role != 'admin'
 );

-- ────────────────────────────────────────────────────────────────
-- STEP 2: ลบ auth.users ทุกคนที่ไม่ใช่ admin
--         (PostgreSQL CASCADE จัดการที่เหลือทั้งหมดให้อัตโนมัติ)
-- ────────────────────────────────────────────────────────────────
DELETE FROM auth.users
 WHERE id IN (
   SELECT id FROM public.profiles WHERE role != 'admin'
 );

-- ────────────────────────────────────────────────────────────────
-- STEP 3: Re-number user_code ของ admin ที่เหลือ
--         (เรียงตาม created_at เพื่อให้ admin คนแรกได้ NP00001)
-- ────────────────────────────────────────────────────────────────
WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) AS n
  FROM public.profiles
)
UPDATE public.profiles
   SET user_code = 'NP' || LPAD(numbered.n::text, 5, '0')
  FROM numbered
 WHERE profiles.id = numbered.id;

-- ────────────────────────────────────────────────────────────────
-- STEP 4: Reset sequence ให้ต่อจากเลขสูงสุดที่ assign ไปแล้ว
--         เช่น admin คนเดียว = NP00001 → next user จะได้ NP00002
--         ถ้าไม่มี admin เลย → next user จะได้ NP00001
-- ────────────────────────────────────────────────────────────────
SELECT setval(
  'public.profiles_code_seq',
  COALESCE(
    (
      SELECT MAX(CAST(SUBSTRING(user_code, 3) AS integer))
        FROM public.profiles
       WHERE user_code ~ '^NP[0-9]{5}$'
    ),
    0                        -- ถ้าไม่มีใครเหลือ → 0+1 = 1 (NP00001)
  ) + 1,
  false                      -- false = nextval() ครั้งต่อไปจะคืนค่านี้พอดี
);

-- ────────────────────────────────────────────────────────────────
-- STEP 5: ตรวจสอบผลลัพธ์
-- ────────────────────────────────────────────────────────────────
SELECT
  'สมาชิกที่เหลือ' AS info,
  p.user_code,
  p.full_name,
  p.role,
  u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at;

SELECT
  'NP sequence ถัดไป' AS info,
  'NP' || LPAD(last_value::text, 5, '0') AS next_code,
  is_called
FROM public.profiles_code_seq;

COMMIT;


-- ═══════════════════════════════════════════════════════════════════════════════
-- ต้องการลบสมาชิกรายเดียว? ใช้ block นี้แทน (รันแยก ไม่ต้องรัน block ด้านบน)
-- ═══════════════════════════════════════════════════════════════════════════════

-- BEGIN;
--
-- -- เปลี่ยน 'email@example.com' เป็น email ที่ต้องการลบ
-- DO $$
-- DECLARE
--   v_user_id uuid;
-- BEGIN
--   SELECT id INTO v_user_id
--     FROM auth.users
--    WHERE email = 'email@example.com';
--
--   IF v_user_id IS NULL THEN
--     RAISE EXCEPTION 'ไม่พบ user: email@example.com';
--   END IF;
--
--   -- ตัด FK leads ก่อน
--   UPDATE public.leads SET member_id = NULL WHERE member_id = v_user_id;
--
--   -- ลบ user (CASCADE จัดการที่เหลือ)
--   DELETE FROM auth.users WHERE id = v_user_id;
--
--   RAISE NOTICE 'ลบแล้ว: %', v_user_id;
-- END $$;
--
-- COMMIT;


-- ═══════════════════════════════════════════════════════════════════════════════
-- ⚠️  หมายเหตุ: สิ่งที่ SQL นี้ไม่ได้ลบ
--   • ไฟล์ใน Supabase Storage (avatars, product images, logos)
--     → ลบด้วยตนเองที่ Storage Dashboard หรือใช้ Supabase Storage API
--   • Log / Audit trail ใน Supabase Dashboard
-- ═══════════════════════════════════════════════════════════════════════════════
