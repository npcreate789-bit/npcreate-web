-- Fix: seller cannot read affiliate profiles in store/pulls page
--
-- Root cause: profiles_select only allows reading own profile or admin.
-- When getStorePulls() JOINs affiliate_pulls → profiles via PostgREST,
-- Supabase applies RLS to profiles — seller can't read affiliate's row
-- → affiliate field is returned as null on every pull row.
--
-- Fix: add a scoped function that lets a seller read profiles of affiliates
-- who have pulled at least one of that seller's products.

CREATE OR REPLACE FUNCTION can_view_affiliate_profile(p_profile_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
      FROM affiliate_pulls ap
      JOIN products  pr ON ap.product_id = pr.id
      JOIN stores    s  ON pr.store_id   = s.id
     WHERE ap.affiliate_id = p_profile_id
       AND s.seller_id     = auth.uid()
  )
$$;

-- Recreate profiles_select with the additional seller→affiliate access
DROP POLICY IF EXISTS "profiles_select" ON profiles;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR is_admin()
    OR can_view_affiliate_profile(id)
  );
