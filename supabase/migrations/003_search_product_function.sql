-- pg_trgm similarity search function for Hebrew product matching.
-- Called by the find-cheapest-store Edge Function.
-- Uses similarity score so "חלב תנובה" ranks above "קראנץ חלבה" when searching "חלב".

CREATE OR REPLACE FUNCTION search_product_by_name(
  query        TEXT,
  result_limit INT DEFAULT 1
)
RETURNS TABLE (barcode TEXT, name TEXT, similarity FLOAT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    barcode,
    name,
    similarity(name, query) AS similarity
  FROM il_products
  WHERE name % query          -- pg_trgm threshold (default 0.3)
     OR name ILIKE '%' || query || '%'
  ORDER BY
    -- Prefer exact word start match, then trgm similarity
    (name ILIKE query || '%')       DESC,
    similarity(name, query)         DESC,
    length(name)                    ASC
  LIMIT result_limit;
$$;

-- Allow the Edge Function (service_role) to call this function
GRANT EXECUTE ON FUNCTION search_product_by_name(TEXT, INT) TO service_role;
