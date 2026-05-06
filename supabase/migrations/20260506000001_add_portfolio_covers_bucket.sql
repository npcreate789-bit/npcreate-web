-- Storage bucket for portfolio cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-covers',
  'portfolio-covers',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_portfolio_covers"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'portfolio-covers');

CREATE POLICY "auth_upload_portfolio_covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-covers');

CREATE POLICY "auth_update_portfolio_covers"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio-covers');

CREATE POLICY "auth_delete_portfolio_covers"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-covers');
