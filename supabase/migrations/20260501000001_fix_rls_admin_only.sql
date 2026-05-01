-- Fix overly-broad RLS policies: replace "any authenticated user" with admin-only for write operations.
-- Depends on is_admin() function created in 20260430000007_add_profiles.sql
-- Idempotent: DROP IF EXISTS both old and new policy names before creating.

-- ─── portfolios ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "authenticated_full_access_portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "admin_write_portfolios"               ON public.portfolios;
CREATE POLICY "admin_write_portfolios"
  ON public.portfolios FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "authenticated_full_access_portfolio_media" ON public.portfolio_media;
DROP POLICY IF EXISTS "admin_write_portfolio_media"               ON public.portfolio_media;
CREATE POLICY "admin_write_portfolio_media"
  ON public.portfolio_media FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── services ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "authenticated_full_access_services" ON public.services;
DROP POLICY IF EXISTS "admin_write_services"               ON public.services;
CREATE POLICY "admin_write_services"
  ON public.services FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── testimonials ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "authenticated_full_access_testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "admin_write_testimonials"               ON public.testimonials;
CREATE POLICY "admin_write_testimonials"
  ON public.testimonials FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── client_logos ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "authenticated_full_access_client_logos" ON public.client_logos;
DROP POLICY IF EXISTS "admin_write_client_logos"               ON public.client_logos;
CREATE POLICY "admin_write_client_logos"
  ON public.client_logos FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── leads ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "authenticated_full_access_leads" ON public.leads;
DROP POLICY IF EXISTS "admin_read_leads"                ON public.leads;
DROP POLICY IF EXISTS "admin_delete_leads"              ON public.leads;
CREATE POLICY "admin_read_leads"
  ON public.leads FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "admin_delete_leads"
  ON public.leads FOR DELETE TO authenticated
  USING (is_admin());

-- ─── site_settings ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_manage_site_settings"  ON public.site_settings;
DROP POLICY IF EXISTS "admin_write_site_settings"  ON public.site_settings;
CREATE POLICY "admin_write_site_settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── hero_media ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_manage_hero_media"  ON public.hero_media;
DROP POLICY IF EXISTS "admin_write_hero_media"  ON public.hero_media;
CREATE POLICY "admin_write_hero_media"
  ON public.hero_media FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── promo_banners ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Auth all promo_banners"       ON public.promo_banners;
DROP POLICY IF EXISTS "admin_write_promo_banners"    ON public.promo_banners;
CREATE POLICY "admin_write_promo_banners"
  ON public.promo_banners FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── storage buckets: restrict write to admin ─────────────────────────────────
DROP POLICY IF EXISTS "auth_upload_hero_media_storage"    ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_hero_media_storage"    ON storage.objects;
DROP POLICY IF EXISTS "admin_upload_hero_media_storage"   ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_hero_media_storage"   ON storage.objects;
DROP POLICY IF EXISTS "Auth upload promo-banners"         ON storage.objects;
DROP POLICY IF EXISTS "Auth delete promo-banners"         ON storage.objects;
DROP POLICY IF EXISTS "Auth update promo-banners"         ON storage.objects;
DROP POLICY IF EXISTS "admin_upload_promo_banners_storage" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_promo_banners_storage" ON storage.objects;
DROP POLICY IF EXISTS "admin_update_promo_banners_storage" ON storage.objects;

CREATE POLICY "admin_upload_hero_media_storage"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hero-media' AND is_admin());

CREATE POLICY "admin_delete_hero_media_storage"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'hero-media' AND is_admin());

CREATE POLICY "admin_upload_promo_banners_storage"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'promo-banners' AND is_admin());

CREATE POLICY "admin_delete_promo_banners_storage"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'promo-banners' AND is_admin());

CREATE POLICY "admin_update_promo_banners_storage"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'promo-banners' AND is_admin())
  WITH CHECK (bucket_id = 'promo-banners' AND is_admin());
