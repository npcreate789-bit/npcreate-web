-- Add roas_before and growth_pct_before columns to portfolios
ALTER TABLE public.portfolios
  ADD COLUMN IF NOT EXISTS roas_before numeric,
  ADD COLUMN IF NOT EXISTS growth_pct_before numeric;
