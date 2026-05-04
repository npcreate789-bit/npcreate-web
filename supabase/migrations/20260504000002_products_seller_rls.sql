-- Restore seller mutations for products table
-- Migration 20260503000003 set products to admin-only which breaks the seller product management UI.
-- Sellers need INSERT/UPDATE/DELETE on their own store's products.

DROP POLICY IF EXISTS "products_seller_insert" ON products;
DROP POLICY IF EXISTS "products_seller_update" ON products;
DROP POLICY IF EXISTS "products_seller_delete" ON products;

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
