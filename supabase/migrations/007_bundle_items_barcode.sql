-- Add barcode column to bundle_items for precise price lookups.
-- Nullable so existing free-text items are unaffected.
ALTER TABLE bundle_items ADD COLUMN barcode TEXT REFERENCES il_products(barcode);

-- Allow authenticated users to call the product search RPC from the client.
GRANT EXECUTE ON FUNCTION search_product_by_name(TEXT, INT) TO authenticated;
