import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface RequestBody {
  items: string[];
  lat: number;
  lon: number;
}

interface StoreItemPrice {
  itemName: string;
  matchedProductName: string | null;
  price: number | null;
  unit: string | null;
}

interface StoreResult {
  chainId: string;
  chainName: string;
  nearestStoreAddress: string;
  totalEstimatedCost: number;
  itemsFound: number;
  itemsTotal: number;
  itemPrices: StoreItemPrice[];
}

interface PriceFinderResponse {
  results: StoreResult[];
  searchedAt: string;
  locationLabel: string;
  warning: string | null;
}

/** Reverse geocode lat/lon → city name using Nominatim (free, no API key). */
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=he`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Bundly/1.0 (supermarket price finder)" },
    });
    const data = await res.json();
    // Prefer city > town > village > county
    return (
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.county ||
      null
    );
  } catch {
    return null;
  }
}

/** Normalize city name: strip hyphens, trim whitespace, normalize Hebrew encoding. */
function normalizeCity(city: string): string {
  // Strip hyphens/dashes (ASCII, Hebrew en-dash ‑, em-dash —, Unicode ‒–—)
  // and take only the primary city name before any "–" separator.
  // e.g. "תל־אביב–יפו" → "תל אביב"
  //      "באר-שבע"      → "באר שבע"
  const primary = city.split(/[–—]/)[0];           // split on en/em dash
  return primary.replace(/[-\u05BE\u2010-\u2015]/g, " ").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const { items, lat, lon } = body;
  if (!items?.length || lat == null || lon == null) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: items, lat, lon" }),
      { status: 400 }
    );
  }

  let warning: string | null = null;

  // ── Step 1: Resolve city from coordinates ────────────────────────────────
  const rawCity = await reverseGeocode(lat, lon);
  const city = rawCity ? normalizeCity(rawCity) : null;
  const locationLabel = city ?? `${lat.toFixed(3)}, ${lon.toFixed(3)}`;

  if (!city) {
    const response: PriceFinderResponse = {
      results: [],
      searchedAt: new Date().toISOString(),
      locationLabel,
      warning: "לא הצלחנו לזהות את העיר שלך. נסה שוב מאוחר יותר.",
    };
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // ── Step 2: Find chains with stores in this city ─────────────────────────
  const { data: storeRows, error: storeErr } = await supabase
    .from("il_stores")
    .select("chain_id, address, store_name")
    .ilike("city", `%${city}%`);

  if (storeErr) {
    console.error("Store query error:", storeErr);
    const response: PriceFinderResponse = {
      results: [],
      searchedAt: new Date().toISOString(),
      locationLabel,
      warning: "שגיאה בשאילתת חנויות. נסה שוב מאוחר יותר.",
    };
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  if (!storeRows || storeRows.length === 0) {
    const response: PriceFinderResponse = {
      results: [],
      searchedAt: new Date().toISOString(),
      locationLabel,
      warning: "לא נמצאו חנויות באזורך.",
    };
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Map chain_id → first store address found
  const chainStoreMap = new Map<string, { address: string; storeName: string }>();
  for (const row of storeRows) {
    if (!chainStoreMap.has(row.chain_id)) {
      chainStoreMap.set(row.chain_id, {
        address: row.address ?? "",
        storeName: row.store_name ?? "",
      });
    }
  }
  const nearbyChainIds = [...chainStoreMap.keys()];

  // ── Step 3: Fetch chain names ─────────────────────────────────────────────
  const { data: chainRows } = await supabase
    .from("il_chains")
    .select("chain_id, chain_name")
    .in("chain_id", nearbyChainIds);

  const chainNameMap = new Map<string, string>();
  for (const c of chainRows ?? []) {
    chainNameMap.set(c.chain_id, c.chain_name);
  }

  // ── Step 4: Match each item against il_products (pg_trgm) ─────────────────
  const itemMatchMap = new Map<
    string,
    { barcode: string; matchedName: string } | null
  >();

  for (const item of items) {
    const { data: productRows } = await supabase
      .rpc("search_product_by_name", { query: item, result_limit: 1 });

    if (productRows && productRows.length > 0) {
      itemMatchMap.set(item, {
        barcode: productRows[0].barcode,
        matchedName: productRows[0].name,
      });
    } else {
      // Fallback: simple ILIKE if pg_trgm function not yet created
      const { data: likeRows } = await supabase
        .from("il_products")
        .select("barcode, name")
        .ilike("name", `%${item}%`)
        .limit(1);

      itemMatchMap.set(
        item,
        likeRows && likeRows.length > 0
          ? { barcode: likeRows[0].barcode, matchedName: likeRows[0].name }
          : null
      );
    }
  }

  const matchedBarcodes = [...itemMatchMap.values()]
    .filter(Boolean)
    .map((m) => m!.barcode);

  // ── Step 5: Get prices for matched barcodes from nearby chains ────────────
  let priceRows: { barcode: string; chain_id: string; price: number; unit: string | null }[] = [];
  if (matchedBarcodes.length > 0) {
    const { data: prices } = await supabase
      .from("il_chain_prices")
      .select("barcode, chain_id, price, unit")
      .in("barcode", matchedBarcodes)
      .in("chain_id", nearbyChainIds);

    priceRows = prices ?? [];
  }

  // Build a map: barcode → chain_id → { price, unit }
  const priceMap = new Map<string, Map<string, { price: number; unit: string | null }>>();
  for (const row of priceRows) {
    if (!priceMap.has(row.barcode)) priceMap.set(row.barcode, new Map());
    priceMap.get(row.barcode)!.set(row.chain_id, { price: row.price, unit: row.unit });
  }

  // Check if DB is empty (not yet seeded)
  if (matchedBarcodes.length === 0 && items.length > 0) {
    warning = "הנתונים עדיין נטענים, נסה שוב מחר.";
  }

  // ── Step 6: Aggregate per chain ───────────────────────────────────────────
  const results: StoreResult[] = [];

  for (const chainId of nearbyChainIds) {
    const storeInfo = chainStoreMap.get(chainId)!;
    const chainName = chainNameMap.get(chainId) ?? chainId;

    let totalCost = 0;
    let itemsFound = 0;
    const itemPrices: StoreItemPrice[] = [];

    for (const item of items) {
      const match = itemMatchMap.get(item);
      if (!match) {
        itemPrices.push({ itemName: item, matchedProductName: null, price: null, unit: null });
        continue;
      }

      const chainPrices = priceMap.get(match.barcode);
      const priceInfo = chainPrices?.get(chainId);

      if (priceInfo) {
        totalCost += priceInfo.price;
        itemsFound++;
        itemPrices.push({
          itemName: item,
          matchedProductName: match.matchedName,
          price: priceInfo.price,
          unit: priceInfo.unit,
        });
      } else {
        itemPrices.push({
          itemName: item,
          matchedProductName: match.matchedName,
          price: null,
          unit: null,
        });
      }
    }

    results.push({
      chainId,
      chainName,
      nearestStoreAddress: storeInfo.address || storeInfo.storeName || "כתובת לא ידועה",
      totalEstimatedCost: Math.round(totalCost * 100) / 100,
      itemsFound,
      itemsTotal: items.length,
      itemPrices,
    });
  }

  // Sort cheapest first (chains with more items found ranked higher when tied)
  results.sort((a, b) => {
    if (a.itemsFound !== b.itemsFound) return b.itemsFound - a.itemsFound;
    return a.totalEstimatedCost - b.totalEstimatedCost;
  });

  const response: PriceFinderResponse = {
    results,
    searchedAt: new Date().toISOString(),
    locationLabel,
    warning,
  };

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
});
