import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type ProductSearchResult = {
  barcode: string;
  name: string;
  similarity: number;
};

export function useProductSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const isActive = query.length >= 2;

  useEffect(() => {
    if (query.length < 2) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: async () => {
      const db = supabase as any;
      const { data: rows, error } = await db.rpc('search_product_by_name', {
        query: debouncedQuery,
        result_limit: 5,
      });
      if (error) throw error;
      return (rows ?? []) as ProductSearchResult[];
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  // isLoading is true while debouncing (query typed but not yet fired) or fetching
  const isLoading = isActive && (isFetching || debouncedQuery !== query);

  return {
    results: isActive ? (data ?? []) : [],
    isLoading,
    isActive,
  };
}
