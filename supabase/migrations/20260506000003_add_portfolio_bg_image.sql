-- Add bg_image column: 9:16 portrait background image for popup modal
ALTER TABLE public.portfolios
  ADD COLUMN IF NOT EXISTS bg_image text;
