import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { pinnedBundlesKeys } from '../queries/keys';

export type { PinnedBundle } from '../queries/pinnedBundles';

export function usePinnedBundles() {
  const userId = useAuth();

  return useQuery({
    ...pinnedBundlesKeys.byUser(userId ?? ''),
    enabled: !!userId,
  });
}
