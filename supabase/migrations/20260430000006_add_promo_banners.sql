-- Promo banners table
CREATE TABLE promo_banners (
  id            uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  heading       text         NOT NULL DEFAULT '',
  banner_url    text,
  detail        text,
  price_text    text,
  contact_text  text         NOT NULL DEFAULT 'ติดต่อเรา',
  contact_url   text         NOT NULL DEFAULT '/api/auth/line',
  display_order int          NOT NULL DEFAULT 0,
  is_active     boolean      NOT NULL DEFAULT true,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  updated_at    timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read promo_banners"
  ON promo_banners FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Auth all promo_banners"
  ON promo_banners FOR ALL TO authenticated USING (true);

CREATE TRIGGER set_promo_banners_updated_at
  BEFORE UPDATE ON promo_banners
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Storage bucket for banner images (horizontal)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('promo-banners', 'promo-banners', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read promo-banners storage"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'promo-banners');

CREATE POLICY "Auth upload promo-banners"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'promo-banners');

CREATE POLICY "Auth delete promo-banners"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'promo-banners');

CREATE POLICY "Auth update promo-banners"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'promo-banners');
