export interface StoreItemPrice {
  itemName: string;
  matchedProductName: string | null;
  price: number | null;
  unit: string | null;
}

export interface StoreResult {
  chainId: string;
  chainName: string;
  nearestStoreAddress: string;
  totalEstimatedCost: number;
  itemsFound: number;
  itemsTotal: number;
  itemPrices: StoreItemPrice[];
}

export interface PriceFinderResponse {
  results: StoreResult[];
  searchedAt: string;
  locationLabel: string;
  warning: string | null;
}
