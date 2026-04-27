import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { syncChannel } from '../lib/syncChannel';
import { bundleKeys, bundleDetailKeys, activityFeedKeys } from '../queries/keys';
import { useAuth } from './useAuth';

export function useRealtimeSync() {
  const qc = useQueryClient();
  const userId = useAuth();

  useEffect(() => {
    syncChannel
      .on('broadcast', { event: 'bundle_items_changed' }, ({ payload }) => {
        if (payload?.userId === userId) return;
        const bundleId = payload?.bundleId as string | undefined;
        if (bundleId) {
          qc.invalidateQueries({ queryKey: bundleDetailKeys.items(bundleId).queryKey });
        }
        qc.invalidateQueries({ queryKey: bundleKeys._def });
      })
      .on('broadcast', { event: 'bundles_changed' }, ({ payload }) => {
        if (payload?.userId === userId) return;
        qc.invalidateQueries({ queryKey: bundleKeys._def });
      })
      .on('broadcast', { event: 'activity_changed' }, ({ payload }) => {
        if (payload?.userId === userId) return;
        qc.invalidateQueries({ queryKey: activityFeedKeys._def });
      });
  }, [qc, userId]);
}
