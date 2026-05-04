-- Add content_type field to profiles for Affiliate content format preference
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS content_type text
  CHECK (content_type IN ('clip', 'live', 'both'));
