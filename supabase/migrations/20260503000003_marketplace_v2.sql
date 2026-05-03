-- ─── Marketplace v2: Schema Update ────────────────────────────────────────────
-- Idempotent: works whether 20260503000002 ran or not
-- Changes:
--   profiles       → role_confirmed, tiktok_channel_url, address_*
--   products       → caption_suggestions, forbidden_words, promotion_text
--   products RLS   → admin-only mutations
--   affiliate_pulls → sample_status, seller_note; DROP pull_code, total_clicks
--   DROP            → link_clicks table + increment_pull_clicks function

-- ─── 1. profiles: new fields ──────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role_confirmed      boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tiktok_channel_url  text,
  ADD COLUMN IF NOT EXISTS address_name        text,
  ADD COLUMN IF NOT EXISTS address_phone       text,
  ADD COLUMN IF NOT EXISTS address_line1       text,
  ADD COLUMN IF NOT EXISTS address_subdistrict text,
  ADD COLUMN IF NOT EXISTS address_district    text,
  ADD COLUMN IF NOT EXISTS address_province    text,
  ADD COLUMN IF NOT EXISTS address_postcode    text;

-- ─── 2. Create marketplace tables IF NOT EXISTS ────────────────────────────────
-- (handles fresh install where 20260503000002 was never run)

CREATE TABLE IF NOT EXISTS stores (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  description     text,
  logo_url        text,
  category        text        NOT NULL DEFAULT 'อื่นๆ',
  tiktok_shop_url text,
  is_active       boolean     NOT NULL DEFAULT true,
  is_verified     boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(seller_id)
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_stores_updated_at') THEN
    CREATE TRIGGER set_stores_updated_at
      BEFORE UPDATE ON stores
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- ─── owns_store: safe to recreate ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_seller()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
$$;

CREATE OR REPLACE FUNCTION is_affiliate()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'affiliate')
$$;

CREATE OR REPLACE FUNCTION owns_store(p_store_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM stores WHERE id = p_store_id AND seller_id = auth.uid())
$$;

-- stores RLS (drop and recreate for idempotency)
DROP POLICY IF EXISTS "stores_anon_read"    ON stores;
DROP POLICY IF EXISTS "stores_auth_read"    ON stores;
DROP POLICY IF EXISTS "stores_seller_insert" ON stores;
DROP POLICY IF EXISTS "stores_seller_update" ON stores;
DROP POLICY IF EXISTS "stores_seller_delete" ON stores;
DROP POLICY IF EXISTS "stores_admin_all"    ON stores;

CREATE POLICY "stores_anon_read" ON stores
  FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "stores_auth_read" ON stores
  FOR SELECT TO authenticated USING (is_active = true OR seller_id = auth.uid() OR is_admin());
CREATE POLICY "stores_seller_insert" ON stores
  FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid() AND is_seller());
CREATE POLICY "stores_seller_update" ON stores
  FOR UPDATE TO authenticated USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());
CREATE POLICY "stores_seller_delete" ON stores
  FOR DELETE TO authenticated USING (seller_id = auth.uid());
CREATE POLICY "stores_admin_all" ON stores
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ─── 3. products: create + new fields ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                 uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           uuid          NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name               text          NOT NULL,
  description        text,
  price              numeric(10,2) NOT NULL CHECK (price >= 0),
  original_price     numeric(10,2) CHECK (original_price >= 0),
  commission_rate    numeric(5,2)  NOT NULL DEFAULT 5.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  image_url          text,
  tiktok_product_url text,
  tags               text[]        NOT NULL DEFAULT '{}',
  stock_status       text          NOT NULL DEFAULT 'in_stock'
                     CHECK (stock_status IN ('in_stock','low_stock','out_of_stock')),
  is_active          boolean       NOT NULL DEFAULT true,
  monthly_sales_est  integer       NOT NULL DEFAULT 0,
  caption_suggestions text,
  forbidden_words    text,
  promotion_text     text,
  created_at         timestamptz   NOT NULL DEFAULT now(),
  updated_at         timestamptz   NOT NULL DEFAULT now()
);

-- Add new fields for existing installs
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS caption_suggestions text,
  ADD COLUMN IF NOT EXISTS forbidden_words     text,
  ADD COLUMN IF NOT EXISTS promotion_text      text;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'products_store_id_idx') THEN
    CREATE INDEX products_store_id_idx ON products(store_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'products_is_active_idx') THEN
    CREATE INDEX products_is_active_idx ON products(is_active) WHERE is_active = true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_products_updated_at') THEN
    CREATE TRIGGER set_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- owns_product_store: defined after products + stores exist
CREATE OR REPLACE FUNCTION owns_product_store(p_product_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM products p
    JOIN stores s ON p.store_id = s.id
    WHERE p.id = p_product_id AND s.seller_id = auth.uid()
  )
$$;

-- products RLS: admin-only mutations (drop old seller policies)
DROP POLICY IF EXISTS "products_anon_read"      ON products;
DROP POLICY IF EXISTS "products_auth_read"      ON products;
DROP POLICY IF EXISTS "products_seller_insert"  ON products;
DROP POLICY IF EXISTS "products_seller_update"  ON products;
DROP POLICY IF EXISTS "products_seller_delete"  ON products;
DROP POLICY IF EXISTS "products_admin_all"      ON products;
DROP POLICY IF EXISTS "products_admin_insert"   ON products;
DROP POLICY IF EXISTS "products_admin_update"   ON products;
DROP POLICY IF EXISTS "products_admin_delete"   ON products;

CREATE POLICY "products_anon_read" ON products
  FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "products_auth_read" ON products
  FOR SELECT TO authenticated
  USING (is_active = true OR owns_store(store_id) OR is_admin());
-- Admin-only mutations
CREATE POLICY "products_admin_insert" ON products
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "products_admin_update" ON products
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "products_admin_delete" ON products
  FOR DELETE TO authenticated USING (is_admin());

-- ─── 4. campaigns: create if not exists ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id                      uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id                uuid          NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title                   text          NOT NULL,
  description             text,
  special_commission_rate numeric(5,2)  CHECK (special_commission_rate >= 0 AND special_commission_rate <= 100),
  starts_at               timestamptz   NOT NULL,
  ends_at                 timestamptz   NOT NULL,
  product_ids             uuid[]        NOT NULL DEFAULT '{}',
  script                  text,
  banner_url              text,
  is_active               boolean       NOT NULL DEFAULT true,
  created_at              timestamptz   NOT NULL DEFAULT now(),
  updated_at              timestamptz   NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'campaigns_store_id_idx') THEN
    CREATE INDEX campaigns_store_id_idx ON campaigns(store_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'campaigns_active_dates_idx') THEN
    CREATE INDEX campaigns_active_dates_idx ON campaigns(is_active, starts_at, ends_at);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_campaigns_updated_at') THEN
    CREATE TRIGGER set_campaigns_updated_at
      BEFORE UPDATE ON campaigns
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaigns_anon_read"      ON campaigns;
DROP POLICY IF EXISTS "campaigns_auth_read"      ON campaigns;
DROP POLICY IF EXISTS "campaigns_seller_insert"  ON campaigns;
DROP POLICY IF EXISTS "campaigns_seller_update"  ON campaigns;
DROP POLICY IF EXISTS "campaigns_seller_delete"  ON campaigns;
DROP POLICY IF EXISTS "campaigns_admin_all"      ON campaigns;

CREATE POLICY "campaigns_anon_read" ON campaigns
  FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "campaigns_auth_read" ON campaigns
  FOR SELECT TO authenticated USING (is_active = true OR owns_store(store_id) OR is_admin());
CREATE POLICY "campaigns_seller_insert" ON campaigns
  FOR INSERT TO authenticated WITH CHECK (owns_store(store_id) AND is_seller());
CREATE POLICY "campaigns_seller_update" ON campaigns
  FOR UPDATE TO authenticated USING (owns_store(store_id)) WITH CHECK (owns_store(store_id));
CREATE POLICY "campaigns_seller_delete" ON campaigns
  FOR DELETE TO authenticated USING (owns_store(store_id));
CREATE POLICY "campaigns_admin_all" ON campaigns
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ─── 5. affiliate_pulls: create + restructure ─────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_pulls (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id  uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id    uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sample_status text        NOT NULL DEFAULT 'pending'
                CHECK (sample_status IN ('pending','approved','sent','rejected')),
  seller_note   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(affiliate_id, product_id)
);

-- For existing installs: add new cols, remove old ones
ALTER TABLE affiliate_pulls
  ADD COLUMN IF NOT EXISTS sample_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS seller_note   text;

-- Add CHECK constraint if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'affiliate_pulls_sample_status_check'
  ) THEN
    ALTER TABLE affiliate_pulls
      ADD CONSTRAINT affiliate_pulls_sample_status_check
      CHECK (sample_status IN ('pending','approved','sent','rejected'));
  END IF;
END $$;

-- Drop old columns if they exist (from v1)
ALTER TABLE affiliate_pulls DROP COLUMN IF EXISTS pull_code;
ALTER TABLE affiliate_pulls DROP COLUMN IF EXISTS total_clicks;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'pulls_affiliate_id_idx') THEN
    CREATE INDEX pulls_affiliate_id_idx ON affiliate_pulls(affiliate_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'pulls_product_id_idx') THEN
    CREATE INDEX pulls_product_id_idx ON affiliate_pulls(product_id);
  END IF;
END $$;

ALTER TABLE affiliate_pulls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pulls_affiliate_read"   ON affiliate_pulls;
DROP POLICY IF EXISTS "pulls_affiliate_insert" ON affiliate_pulls;
DROP POLICY IF EXISTS "pulls_admin_all"        ON affiliate_pulls;
DROP POLICY IF EXISTS "pulls_seller_update"    ON affiliate_pulls;

CREATE POLICY "pulls_affiliate_read" ON affiliate_pulls
  FOR SELECT TO authenticated
  USING (affiliate_id = auth.uid() OR owns_product_store(product_id) OR is_admin());
CREATE POLICY "pulls_affiliate_insert" ON affiliate_pulls
  FOR INSERT TO authenticated
  WITH CHECK (affiliate_id = auth.uid() AND is_affiliate());
-- Seller updates sample_status only
CREATE POLICY "pulls_seller_update" ON affiliate_pulls
  FOR UPDATE TO authenticated
  USING (owns_product_store(product_id))
  WITH CHECK (owns_product_store(product_id));
CREATE POLICY "pulls_admin_all" ON affiliate_pulls
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ─── 6. Cleanup v1 artifacts ──────────────────────────────────────────────────
DROP TABLE IF EXISTS link_clicks CASCADE;
DROP FUNCTION IF EXISTS increment_pull_clicks(text, text);
