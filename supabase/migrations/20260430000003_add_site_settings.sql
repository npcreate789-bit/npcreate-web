CREATE TABLE IF NOT EXISTS public.site_settings (
  key         TEXT        PRIMARY KEY,
  value       JSONB       NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_site_settings"
  ON public.site_settings FOR SELECT TO anon USING (true);

CREATE POLICY "auth_manage_site_settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Seed default row (no-op if already exists)
INSERT INTO public.site_settings (key, value)
VALUES ('homepage', '{}')
ON CONFLICT (key) DO NOTHING;
