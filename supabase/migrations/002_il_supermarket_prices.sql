-- Israeli Supermarket Prices Schema
-- Enables the "Find Cheapest Store" feature

-- Supermarket chains
CREATE TABLE il_chains (
  chain_id   TEXT PRIMARY KEY,       -- e.g. 'rami_levy', 'shufersal'
  chain_name TEXT NOT NULL,          -- Hebrew name
  website_url TEXT
);

-- Store branches (city-level)
CREATE TABLE il_stores (
  store_id   TEXT PRIMARY KEY,
  chain_id   TEXT REFERENCES il_chains(chain_id),
  city       TEXT NOT NULL,
  address    TEXT,
  store_name TEXT
);

-- Product catalog
CREATE TABLE il_products (
  barcode       TEXT PRIMARY KEY,
  name          TEXT NOT NULL,       -- Hebrew product name
  category      TEXT,
  last_seen_at  TIMESTAMPTZ DEFAULT now()
);

-- Prices by chain (chain-wide pricing, not per-store)
CREATE TABLE il_chain_prices (
  barcode    TEXT REFERENCES il_products(barcode),
  chain_id   TEXT REFERENCES il_chains(chain_id),
  price      NUMERIC(10,2) NOT NULL,
  unit       TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (barcode, chain_id)
);

-- pg_trgm for Hebrew fuzzy matching (handles partial names like "חלב" → "חלב תנובה 3%")
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for fast search
CREATE INDEX ON il_products USING gin(name gin_trgm_ops);
CREATE INDEX ON il_stores (city);
CREATE INDEX ON il_chain_prices (chain_id);

-- RLS: price data is public read-only (no user data involved)
ALTER TABLE il_chains         ENABLE ROW LEVEL SECURITY;
ALTER TABLE il_stores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE il_products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE il_chain_prices   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON il_chains       FOR SELECT USING (true);
CREATE POLICY "public read" ON il_stores       FOR SELECT USING (true);
CREATE POLICY "public read" ON il_products     FOR SELECT USING (true);
CREATE POLICY "public read" ON il_chain_prices FOR SELECT USING (true);
