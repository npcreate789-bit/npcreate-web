-- LINE user fields are no longer required — contact form no longer needs LINE Login
ALTER TABLE public.leads
  ALTER COLUMN line_user_id DROP NOT NULL,
  ALTER COLUMN display_name DROP NOT NULL,
  ALTER COLUMN picture_url  DROP NOT NULL;
