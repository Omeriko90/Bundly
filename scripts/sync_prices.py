"""
Sync Israeli supermarket prices into Supabase.

Data source: il-supermarket-scraper + il-supermarket-parser
(Python packages consuming government-mandated XML price feeds)

Run daily via GitHub Actions (.github/workflows/sync-supermarket-prices.yml).

Verified column names (from local test run 2026-04-18):
  Price CSV:  found_folder, file_name, chainid, storeid, itemcode, itemname,
              itemprice, unitofmeasure, priceupdatetime, ...
  Store CSV:  found_folder, file_name, chainid, chainname, storeid,
              storename, address, city (numeric CBS code), zipcode, ...
"""

import glob
import json
import multiprocessing
import os
import pathlib

import pandas as pd
from supabase import create_client

# On Linux (GitHub Actions) fork is the default and required by the parser.
# On macOS, setting fork globally crashes the async scrapers (Shufersal, Victory)
# due to ObjC runtime conflicts. macOS users should run run_parser.py separately.
import sys as _sys
if _sys.platform != "darwin":
    if multiprocessing.get_start_method(allow_none=True) is None:
        multiprocessing.set_start_method("fork")

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

DUMP_FOLDER = "dumps"
OUTPUT_FOLDER = "outputs"
BATCH_SIZE = 5000


# Israeli CBS municipality code → Hebrew city name
# Used to decode the numeric city field in store XML files
_SCRIPT_DIR = pathlib.Path(__file__).parent
CITY_CODES: dict[str, str] = json.loads(
    (_SCRIPT_DIR / "il_city_codes.json").read_text(encoding="utf-8")
)


def resolve_city(code) -> str | None:
    """Convert a CBS city code (int or float string) to a Hebrew city name."""
    if code is None or (isinstance(code, float) and pd.isna(code)):
        return None
    return CITY_CODES.get(str(int(float(code))), None)


def _batch_upsert(table: str, rows: list[dict]) -> None:
    """Upsert rows in chunks to avoid Supabase request size limits."""
    for i in range(0, len(rows), BATCH_SIZE):
        chunk = rows[i : i + BATCH_SIZE]
        supabase.table(table).upsert(chunk).execute()
    print(f"  ✓ Upserted {len(rows)} rows into {table}")


# ---------------------------------------------------------------------------
# Step 1: Scrape XML feeds
# ---------------------------------------------------------------------------

print("Step 1: Scraping price + store XML feeds…")
try:
    from il_supermarket_scarper import ScarpingTask

    # Pass file types as strings (not enums) — required by this library version
    task = ScarpingTask(
        files_types=["PRICE_FILE", "STORE_FILE"],
    )
    thread = task.start()
    print("  Waiting for scraper thread to finish…")
    thread.join()
    print("  Scraping complete.")
except Exception as exc:
    print(f"  ⚠ Scraping failed: {exc}")
    raise

# ---------------------------------------------------------------------------
# Step 2: Parse XML → structured CSVs
# ---------------------------------------------------------------------------

print("Step 2: Parsing XML feeds…")
try:
    from il_supermarket_parsers import ConvertingTask

    ConvertingTask(
        data_folder=DUMP_FOLDER,
        output_folder=OUTPUT_FOLDER,
        files_types=["PRICE_FILE", "STORE_FILE"],
    ).start()
    print("  Parsing complete.")
except Exception as exc:
    print(f"  ⚠ Parsing failed: {exc}")
    raise

# ---------------------------------------------------------------------------
# Step 3: Upsert chain + price data
# ---------------------------------------------------------------------------

print("Step 3: Upserting prices…")

price_files = glob.glob(f"{OUTPUT_FOLDER}/price_file_*.csv")
print(f"  Found {len(price_files)} price file(s)")

seen_chains: dict[str, str] = {}  # chain_id (str) → chain_name

for price_file in price_files:
    print(f"  Processing {price_file}…")
    df = pd.read_csv(price_file, low_memory=False)

    # Drop rows without a barcode or price
    df = df.dropna(subset=["itemcode", "itemprice"])
    df["itemcode"] = df["itemcode"].astype(str).str.strip().str.replace(r"\.0$", "", regex=True)
    df["itemprice"] = pd.to_numeric(df["itemprice"], errors="coerce")
    df = df.dropna(subset=["itemprice"])

    # Resolve chain_id as string from the first non-null chainid
    if "chainid" not in df.columns:
        print(f"    ⚠ No chainid column, skipping {price_file}")
        continue

    chain_id_raw = df["chainid"].dropna().iloc[0] if not df["chainid"].dropna().empty else None
    if chain_id_raw is None:
        print(f"    ⚠ No chain ID found in {price_file}, skipping.")
        continue

    chain_id = str(int(float(chain_id_raw)))

    # Chain name: derive from filename (e.g. price_file_rami_levy.csv → rami_levy)
    chain_slug = price_file.replace(f"{OUTPUT_FOLDER}/price_file_", "").replace(".csv", "")

    if chain_id not in seen_chains:
        seen_chains[chain_id] = chain_slug

    # Upsert products — column name varies by chain
    name_col = next((c for c in ["itemname", "item_name", "productname", "product_name"] if c in df.columns), None)
    if name_col is None:
        print(f"    ⚠ No item name column found in {price_file}, skipping product upsert. Columns: {list(df.columns)}")
    else:
        products = (
            df[["itemcode", name_col]]
            .drop_duplicates(subset=["itemcode"])
            .rename(columns={"itemcode": "barcode", name_col: "name"})
            .dropna(subset=["name"])
            .to_dict("records")
        )
        if products:
            _batch_upsert("il_products", products)

    # Upsert chain prices
    prices_df = (
        df[["itemcode", "itemprice"] + (["unitofmeasure"] if "unitofmeasure" in df.columns else [])]
        .dropna(subset=["itemcode"])
        .assign(chain_id=chain_id)
    )
    prices_df = prices_df.rename(columns={"itemcode": "barcode", "itemprice": "price", "unitofmeasure": "unit"})
    chain_prices = prices_df.drop_duplicates(subset=["barcode", "chain_id"]).to_dict("records")
    if chain_prices:
        _batch_upsert("il_chain_prices", chain_prices)

# Upsert chain metadata
if seen_chains:
    chain_rows = [
        {"chain_id": cid, "chain_name": name}
        for cid, name in seen_chains.items()
    ]
    _batch_upsert("il_chains", chain_rows)

# ---------------------------------------------------------------------------
# Step 4: Upsert store locations
# ---------------------------------------------------------------------------

print("Step 4: Upserting store locations…")

store_files = glob.glob(f"{OUTPUT_FOLDER}/store_file_*.csv")
print(f"  Found {len(store_files)} store file(s)")

for store_file in store_files:
    print(f"  Processing {store_file}…")
    df = pd.read_csv(store_file, low_memory=False)

    if "storeid" not in df.columns or "chainid" not in df.columns:
        print(f"    ⚠ Missing key columns in {store_file}, skipping.")
        continue

    # Forward-fill chain/city fields (parser deduplicates consecutive identical values)
    df["chainid"] = df["chainid"].ffill()
    df["city"]    = df["city"].ffill()
    df["chain_id"] = df["chainid"].apply(
        lambda x: str(int(float(x))) if pd.notna(x) else None
    )

    # Resolve city name from CBS code
    df["city_name"] = df["city"].apply(resolve_city)

    df = df.dropna(subset=["storeid", "chain_id"])

    store_rows = []
    for _, row in df.iterrows():
        if pd.isna(row.get("chain_id")):
            continue
        # Build unique store_id: chain_id + store_id
        store_id = f"{row['chain_id']}_{int(float(row['storeid']))}"
        city = row.get("city_name") or str(int(float(row["city"]))) if pd.notna(row.get("city")) else None
        store_rows.append({
            "store_id":   store_id,
            "chain_id":   row["chain_id"],
            "city":       city or "לא ידוע",
            "address":    str(row["address"]) if pd.notna(row.get("address")) else None,
            "store_name": str(row["storename"]) if pd.notna(row.get("storename")) else None,
        })

    if store_rows:
        _batch_upsert("il_stores", store_rows)

print("✅ Sync complete.")
