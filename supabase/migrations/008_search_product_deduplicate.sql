-- Deduplicate search results by name so the same product doesn't appear
-- multiple times (e.g. cucumber sold by different chains with different barcodes).
-- Uses DISTINCT ON with a subquery to first deduplicate, then re-rank.

CREATE OR REPLACE FUNCTION search_product_by_name(
  query        TEXT,
  result_limit INT DEFAULT 1
)
RETURNS TABLE (barcode TEXT, name TEXT, similarity FLOAT)
LANGUAGE sql
STABLE
AS $$
  SELECT barcode, name, similarity
  FROM (
    SELECT DISTINCT ON (lower(trim(name)))
      barcode,
      name,
      similarity(name, query) AS similarity
    FROM il_products
    WHERE name % query
       OR name ILIKE '%' || query || '%'
    ORDER BY
      lower(trim(name)),
      similarity(name, query) DESC
  ) deduped
  ORDER BY
    (name ILIKE query || '%') DESC,
    similarity                DESC,
    length(name)              ASC
  LIMIT result_limit;
$$;

GRANT EXECUTE ON FUNCTION search_product_by_name(TEXT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION search_product_by_name(TEXT, INT) TO authenticated;
