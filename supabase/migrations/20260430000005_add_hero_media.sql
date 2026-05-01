CREATE TABLE IF NOT EXISTS public.hero_media (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT        NOT NULL CHECK (type IN ('image','video')),
  media_url     TEXT        NOT NULL,
  caption       TEXT,
  display_order INT         NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER hero_media_updated_at
  BEFORE UPDATE ON public.hero_media
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.hero_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_hero_media"
  ON public.hero_media FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "auth_manage_hero_media"
  ON public.hero_media FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Supabase Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hero-media', 'hero-media', true, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_hero_media_storage"
  ON storage.objects FOR SELECT TO anon USING (bucket_id = 'hero-media');

CREATE POLICY "auth_upload_hero_media_storage"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hero-media');

CREATE POLICY "auth_delete_hero_media_storage"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hero-media');
