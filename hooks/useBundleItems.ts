import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  updateItemChecked,
  insertBundleItem,
  removeBundleItem,
  type BundleDetailItem,
} from '../queries/bundleItems';
import { logActivity } from '../queries/activityFeed';
import { bundleDetailKeys } from '../queries/keys';
import { broadcast } from '../lib/syncChannel';
import type { BundleDetail } from '../queries/bundle';

export type { BundleDetailItem } from '../queries/bundleItems';

export function useBundleItems(bundleId: string) {
  const qc = useQueryClient();
  const userId = useAuth();

  const itemsQuery = useQuery({
    ...bundleDetailKeys.items(bundleId),
    enabled: !!bundleId,
  });

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
      await qc.cancelQueries({ queryKey: bundleDetailKeys.items(bundleId).queryKey });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bundleDetailKeys.items(bundleId).queryKey });
      if (userId) {
        broadcast({ type: 'bundle_items_changed', bundleId, userId });
        broadcast({ type: 'activity_changed', userId });
      }
    },
  });

  const addItem = useMutation({
    mutationFn: async ({ text, barcode }: { text: string; barcode?: string | null }) => {
      const items = qc.getQueryData<BundleDetailItem[]>(bundleDetailKeys.items(bundleId).queryKey) ?? [];
      const nextPosition = items.reduce((m, i) => Math.max(m, i.position), 0) + 1;
      if (!userId) throw new Error('Not authenticated');
      const inserted = await insertBundleItem(bundleId, text, nextPosition, userId, barcode);
      if (userId) {
        const bundle = qc.getQueryData<BundleDetail>(bundleDetailKeys.detail(bundleId).queryKey);
        await logActivity(bundleId, userId, 'item_added', inserted.id, {
          item_text: text,
          bundle_name: bundle?.name ?? '',
        });
      }
      return inserted;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bundleDetailKeys.items(bundleId).queryKey });
      if (userId) {
        broadcast({ type: 'bundle_items_changed', bundleId, userId });
        broadcast({ type: 'activity_changed', userId });
      }
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bundleDetailKeys.items(bundleId).queryKey });
      if (userId) {
        broadcast({ type: 'bundle_items_changed', bundleId, userId });
        broadcast({ type: 'activity_changed', userId });
      }
    },
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
