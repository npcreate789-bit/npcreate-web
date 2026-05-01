ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
