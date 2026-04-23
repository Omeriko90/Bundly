import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { bundleKeys } from '../queries/keys';

export type { BundleListItem } from '../queries/bundles';

export function useBundles() {
  const userId = useAuth();

  return useQuery({
    ...bundleKeys.list(userId ?? ''),
    enabled: !!userId,
  });
}
