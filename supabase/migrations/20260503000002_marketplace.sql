-- ─── Marketplace: Seller / Affiliate System ────────────────────────────────────
-- Tables: stores, products, campaigns, affiliate_pulls, link_clicks
-- Depends on: is_admin() from 20260430000007, handle_updated_at() from 20260429000001

-- ─── Role helpers (no table deps) ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_seller()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
$$;

CREATE OR REPLACE FUNCTION is_affiliate()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'affiliate')
$$;

-- ─── stores ────────────────────────────────────────────────────────────────────
CREATE TABLE stores (
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

CREATE TRIGGER set_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- owns_store: defined AFTER stores table exists
CREATE OR REPLACE FUNCTION owns_store(p_store_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM stores WHERE id = p_store_id AND seller_id = auth.uid())
$$;

CREATE POLICY "stores_anon_read" ON stores
  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "stores_auth_read" ON stores
  FOR SELECT TO authenticated USING (is_active = true OR seller_id = auth.uid() OR is_admin());

CREATE POLICY "stores_seller_insert" ON stores
  FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid() AND is_seller());

CREATE POLICY "stores_seller_update" ON stores
  FOR UPDATE TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "stores_seller_delete" ON stores
  FOR DELETE TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "stores_admin_all" ON stores
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── products ──────────────────────────────────────────────────────────────────
CREATE TABLE products (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           uuid        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name               text        NOT NULL,
  description        text,
  price              numeric(10,2) NOT NULL CHECK (price >= 0),
  original_price     numeric(10,2) CHECK (original_price >= 0),
  commission_rate    numeric(5,2) NOT NULL DEFAULT 5.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  image_url          text,
  tiktok_product_url text,
  tags               text[]      NOT NULL DEFAULT '{}',
  stock_status       text        NOT NULL DEFAULT 'in_stock'
                     CHECK (stock_status IN ('in_stock','low_stock','out_of_stock')),
  is_active          boolean     NOT NULL DEFAULT true,
  monthly_sales_est  integer     NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_store_id_idx ON products(store_id);
CREATE INDEX products_is_active_idx ON products(is_active) WHERE is_active = true;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- owns_product_store: defined AFTER both stores and products tables exist
CREATE OR REPLACE FUNCTION owns_product_store(p_product_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM products p
    JOIN stores s ON p.store_id = s.id
    WHERE p.id = p_product_id AND s.seller_id = auth.uid()
  )
$$;

CREATE POLICY "products_anon_read" ON products
  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "products_auth_read" ON products
  FOR SELECT TO authenticated USING (is_active = true OR owns_store(store_id) OR is_admin());

CREATE POLICY "products_seller_insert" ON products
  FOR INSERT TO authenticated
  WITH CHECK (owns_store(store_id) AND is_seller());

CREATE POLICY "products_seller_update" ON products
  FOR UPDATE TO authenticated
  USING (owns_store(store_id))
  WITH CHECK (owns_store(store_id));

CREATE POLICY "products_seller_delete" ON products
  FOR DELETE TO authenticated
  USING (owns_store(store_id));

CREATE POLICY "products_admin_all" ON products
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── campaigns ─────────────────────────────────────────────────────────────────
CREATE TABLE campaigns (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id                uuid        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title                   text        NOT NULL,
  description             text,
  special_commission_rate numeric(5,2) CHECK (special_commission_rate >= 0 AND special_commission_rate <= 100),
  starts_at               timestamptz NOT NULL,
  ends_at                 timestamptz NOT NULL,
  product_ids             uuid[]      NOT NULL DEFAULT '{}',
  script                  text,
  banner_url              text,
  is_active               boolean     NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX campaigns_store_id_idx ON campaigns(store_id);
CREATE INDEX campaigns_active_dates_idx ON campaigns(is_active, starts_at, ends_at);

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_anon_read" ON campaigns
  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "campaigns_auth_read" ON campaigns
  FOR SELECT TO authenticated USING (is_active = true OR owns_store(store_id) OR is_admin());

CREATE POLICY "campaigns_seller_insert" ON campaigns
  FOR INSERT TO authenticated
  WITH CHECK (owns_store(store_id) AND is_seller());

CREATE POLICY "campaigns_seller_update" ON campaigns
  FOR UPDATE TO authenticated
  USING (owns_store(store_id))
  WITH CHECK (owns_store(store_id));

CREATE POLICY "campaigns_seller_delete" ON campaigns
  FOR DELETE TO authenticated
  USING (owns_store(store_id));

CREATE POLICY "campaigns_admin_all" ON campaigns
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── affiliate_pulls ──────────────────────────────────────────────────────────
CREATE TABLE affiliate_pulls (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id  uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id    uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  pull_code     text        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  total_clicks  integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(affiliate_id, product_id)
);

CREATE INDEX pulls_affiliate_id_idx ON affiliate_pulls(affiliate_id);
CREATE INDEX pulls_product_id_idx   ON affiliate_pulls(product_id);

ALTER TABLE affiliate_pulls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pulls_affiliate_read" ON affiliate_pulls
  FOR SELECT TO authenticated
  USING (affiliate_id = auth.uid() OR owns_product_store(product_id) OR is_admin());

CREATE POLICY "pulls_affiliate_insert" ON affiliate_pulls
  FOR INSERT TO authenticated
  WITH CHECK (affiliate_id = auth.uid());

CREATE POLICY "pulls_admin_all" ON affiliate_pulls
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── link_clicks ──────────────────────────────────────────────────────────────
CREATE TABLE link_clicks (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pull_id    uuid        NOT NULL REFERENCES affiliate_pulls(id) ON DELETE CASCADE,
  user_agent text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clicks_pull_id_idx ON link_clicks(pull_id);

ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clicks_admin_read" ON link_clicks
  FOR SELECT TO authenticated USING (is_admin());

-- ─── SECURITY DEFINER RPC: increment_pull_clicks ──────────────────────────────
-- Called from /go/[code] route — runs as DB owner so anon can trigger safely
CREATE OR REPLACE FUNCTION increment_pull_clicks(p_pull_code text, p_user_agent text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_pull_id uuid;
BEGIN
  UPDATE affiliate_pulls
  SET total_clicks = total_clicks + 1
  WHERE pull_code = p_pull_code
  RETURNING id INTO v_pull_id;

  IF v_pull_id IS NOT NULL THEN
    INSERT INTO link_clicks (pull_id, user_agent)
    VALUES (v_pull_id, p_user_agent);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_pull_clicks TO anon;
GRANT EXECUTE ON FUNCTION increment_pull_clicks TO authenticated;
