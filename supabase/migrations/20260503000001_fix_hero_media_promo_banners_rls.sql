-- Fix: Affiliate/Seller (authenticated non-admin) ไม่เห็น hero_media และ promo_banners
--
-- สาเหตุ: migration 001 เปลี่ยน "Auth all" → "admin_write_*" (is_admin() only)
-- แต่ anon read policy ครอบแค่ anon role ไม่ครอบ authenticated role
-- ผลคือ Affiliate/Seller login แล้วดู homepage ไม่เห็น hero gallery และ promo banners
--
-- แก้: เพิ่ม SELECT policy สำหรับ authenticated ทุก role

DROP POLICY IF EXISTS "authenticated_read_hero_media"  ON public.hero_media;
CREATE POLICY "authenticated_read_hero_media"
  ON public.hero_media FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "authenticated_read_promo_banners" ON public.promo_banners;
CREATE POLICY "authenticated_read_promo_banners"
  ON public.promo_banners FOR SELECT TO authenticated
  USING (is_active = true);
