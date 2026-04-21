import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import {
  updateItemChecked,
  insertBundleItem,
  removeBundleItem,
  type BundleDetailItem,
} from '../queries/bundleItems';
import { logActivity } from '../queries/activityFeed';
import { bundleDetailKeys } from '../queries/keys';
import type { BundleDetail } from '../queries/bundle';

export type { BundleDetailItem } from '../queries/bundleItems';

export function useBundleItems(bundleId: string) {
  const qc = useQueryClient();
  const userId = useAuth();

  const itemsQuery = useQuery({
    ...bundleDetailKeys.items(bundleId),
    enabled: !!bundleId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!bundleId) return;
    const channel = supabase
      .channel(`bundle-items-${bundleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bundle_items', filter: `bundle_id=eq.${bundleId}` },
        () => qc.invalidateQueries(bundleDetailKeys.items(bundleId)),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [bundleId, qc]);

  const toggleItem = useMutation({
    mutationFn: async (itemId: string) => {
      const items = qc.getQueryData<BundleDetailItem[]>(bundleDetailKeys.items(bundleId).queryKey);
      const item = items?.find((i) => i.id === itemId);
      if (!item) throw new Error('Item not found');
      const newChecked = !item.checked;
      await updateItemChecked(itemId, newChecked, newChecked ? (userId ?? null) : null);
      if (userId) {
        const bundle = qc.getQueryData<BundleDetail>(bundleDetailKeys.detail(bundleId).queryKey);
        await logActivity(bundleId, userId, newChecked ? 'item_checked' : 'item_unchecked', itemId, {
          item_text: item.text,
          bundle_name: bundle?.name ?? '',
        });
      }
    },
    onMutate: async (itemId) => {
      await qc.cancelQueries(bundleDetailKeys.items(bundleId));
      const prev = qc.getQueryData<BundleDetailItem[]>(bundleDetailKeys.items(bundleId).queryKey);
      qc.setQueryData<BundleDetailItem[]>(
        bundleDetailKeys.items(bundleId).queryKey,
        (old) => old?.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)) ?? [],
      );
      return { prev };
    },
    onError: (_err, _itemId, context) => {
      if (context?.prev) {
        qc.setQueryData(bundleDetailKeys.items(bundleId).queryKey, context.prev);
      }
    },
    onSuccess: () => qc.invalidateQueries(bundleDetailKeys.items(bundleId)),
  });

  const addItem = useMutation({
    mutationFn: async (text: string) => {
      const items = qc.getQueryData<BundleDetailItem[]>(bundleDetailKeys.items(bundleId).queryKey) ?? [];
      const nextPosition = items.reduce((m, i) => Math.max(m, i.position), 0) + 1;
      const inserted = await insertBundleItem(bundleId, text, nextPosition, userId!);
      if (userId) {
        const bundle = qc.getQueryData<BundleDetail>(bundleDetailKeys.detail(bundleId).queryKey);
        await logActivity(bundleId, userId, 'item_added', inserted.id, {
          item_text: text,
          bundle_name: bundle?.name ?? '',
        });
      }
    },
    onSuccess: () => qc.invalidateQueries(bundleDetailKeys.items(bundleId)),
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const items = qc.getQueryData<BundleDetailItem[]>(bundleDetailKeys.items(bundleId).queryKey);
      const item = items?.find((i) => i.id === itemId);
      await removeBundleItem(itemId);
      if (userId && item) {
        const bundle = qc.getQueryData<BundleDetail>(bundleDetailKeys.detail(bundleId).queryKey);
        await logActivity(bundleId, userId, 'item_deleted', itemId, {
          item_text: item.text,
          bundle_name: bundle?.name ?? '',
        });
      }
    },
    onSuccess: () => qc.invalidateQueries(bundleDetailKeys.items(bundleId)),
  });

  return {
    items: itemsQuery.data ?? [],
    isLoading: itemsQuery.isLoading,
    error: itemsQuery.error,
    toggleItem,
    addItem,
    deleteItem,
  };
}
