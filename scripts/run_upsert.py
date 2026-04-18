"""Upsert parsed CSV files into Supabase (run after run_parser.py)."""
import glob
import json
import os
import pathlib

import pandas as pd
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

BATCH_SIZE = 1000
OUTPUT_FOLDER = "outputs"

_SCRIPT_DIR = pathlib.Path(__file__).parent
CITY_CODES: dict[str, str] = json.loads(
    (_SCRIPT_DIR / "il_city_codes.json").read_text(encoding="utf-8")
)


def resolve_city(code) -> str | None:
    """Convert CBS code OR return already-Hebrew city name as-is."""
    if code is None or (isinstance(code, float) and pd.isna(code)):
        return None
    code_str = str(code).strip()
    if not code_str or code_str.lower() in ("nan", "none", "0.0", "0"):
        return None
    # If it looks numeric, map via CBS codes
    try:
        return CITY_CODES.get(str(int(float(code_str))), code_str)
    except (ValueError, TypeError):
        # Already a Hebrew (or other) city name — return as-is
        return code_str


def batch_upsert(table: str, rows: list[dict]) -> None:
    for i in range(0, len(rows), BATCH_SIZE):
        chunk = rows[i : i + BATCH_SIZE]
        supabase.table(table).upsert(chunk).execute()
    print(f"    ✓ {len(rows):,} rows → {table}")


# ── Prices ─────────────────────────────────────────────────────────────────

price_files = sorted(glob.glob(f"{OUTPUT_FOLDER}/price_file_*.csv"))
print(f"Step 1: Upserting prices from {len(price_files)} file(s)…")

seen_chains: dict[str, dict] = {}

for price_file in price_files:
    chain_slug = price_file.replace(f"{OUTPUT_FOLDER}/price_file_", "").replace(".csv", "")
    print(f"  {chain_slug}…", end=" ", flush=True)

    df = pd.read_csv(price_file, low_memory=False)
    df = df.dropna(subset=["itemcode", "itemprice"])
    df["itemcode"] = df["itemcode"].astype(str).str.strip().str.replace(r"\.0$", "", regex=True)
    df["itemprice"] = pd.to_numeric(df["itemprice"], errors="coerce")
    df = df.dropna(subset=["itemprice"])

    if "chainid" not in df.columns or df["chainid"].dropna().empty:
        print("⚠ no chain ID, skipped")
        continue

    chain_id = str(int(float(df["chainid"].dropna().iloc[0])))

    # Chain name: use chainname column if available
    chain_name = None
    if "chainname" in df.columns:
        chain_name = df["chainname"].dropna().iloc[0] if not df["chainname"].dropna().empty else None
    if not chain_name:
        chain_name = chain_slug.replace("_", " ").title()

    seen_chains[chain_id] = {"chain_id": chain_id, "chain_name": str(chain_name)}

    # Upsert chain first (required before prices due to FK constraint)
    supabase.table("il_chains").upsert({"chain_id": chain_id, "chain_name": str(chain_name)}).execute()

    # Products
    products = (
        df[["itemcode", "itemname"]]
        .drop_duplicates("itemcode")
        .rename(columns={"itemcode": "barcode", "itemname": "name"})
        .dropna(subset=["name"])
        .to_dict("records")
    )
    batch_upsert("il_products", products)

    # Prices — only for barcodes that exist in il_products (avoids FK violation)
    valid_barcodes = {p["barcode"] for p in products}
    unit_col = "unitofmeasure" if "unitofmeasure" in df.columns else None
    price_rows_dedup: dict = {}
    for _, row in df.iterrows():
        barcode = str(row["itemcode"])
        if barcode not in valid_barcodes:
            continue
        key = (barcode, chain_id)
        price_rows_dedup[key] = {
            "barcode":  barcode,
            "chain_id": chain_id,
            "price":    float(row["itemprice"]),
            "unit":     str(row[unit_col]) if unit_col and pd.notna(row.get(unit_col)) else None,
        }
    if price_rows_dedup:
        batch_upsert("il_chain_prices", list(price_rows_dedup.values()))

# Chains
if seen_chains:
    batch_upsert("il_chains", list(seen_chains.values()))

# ── Stores ──────────────────────────────────────────────────────────────────

store_files = sorted(glob.glob(f"{OUTPUT_FOLDER}/store_file_*.csv"))
print(f"\nStep 2: Upserting stores from {len(store_files)} file(s)…")

for store_file in store_files:
    chain_slug = store_file.replace(f"{OUTPUT_FOLDER}/store_file_", "").replace(".csv", "")
    print(f"  {chain_slug}…", end=" ", flush=True)

    df = pd.read_csv(store_file, low_memory=False)
    if "storeid" not in df.columns or "chainid" not in df.columns:
        print("⚠ missing columns, skipped")
        continue

    df["chainid"] = df["chainid"].ffill()
    df["city"] = df["city"].ffill()
    df["chain_id"] = df["chainid"].apply(
        lambda x: str(int(float(x))) if pd.notna(x) else None
    )
    df["city_name"] = df["city"].apply(resolve_city)
    df = df.dropna(subset=["storeid", "chain_id"])

    # Ensure the chain exists in il_chains (might not be in price files)
    for cid in df["chain_id"].unique():
        chain_name = chain_slug.replace("_", " ").title()
        if "chainname" in df.columns:
            cn = df[df["chain_id"] == cid]["chainname"].dropna()
            if not cn.empty:
                chain_name = str(cn.iloc[0])
        supabase.table("il_chains").upsert(
            {"chain_id": cid, "chain_name": chain_name},
            ignore_duplicates=True,
        ).execute()

    stores = []
    for _, row in df.iterrows():
        stores.append({
            "store_id":   f"{row['chain_id']}_{int(float(row['storeid']))}",
            "chain_id":   row["chain_id"],
            "city":       row.get("city_name") or (str(row["city"]) if pd.notna(row.get("city")) else "לא ידוע"),
            "address":    str(row["address"]) if pd.notna(row.get("address")) else None,
            "store_name": str(row["storename"]) if pd.notna(row.get("storename")) else None,
        })

    # Deduplicate by store_id (keep last — most data-complete row)
    stores_dedup = {s["store_id"]: s for s in stores}
    if stores_dedup:
        batch_upsert("il_stores", list(stores_dedup.values()))
    else:
        print("0 rows")

print("\n✅ Upsert complete.")

# ── Summary ─────────────────────────────────────────────────────────────────
for table in ["il_chains", "il_products", "il_chain_prices", "il_stores"]:
    r = supabase.table(table).select("*", count="exact").execute()
    print(f"  {table}: {r.count:,} rows")
