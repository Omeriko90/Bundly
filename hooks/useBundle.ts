import { useQuery } from '@tanstack/react-query';
import { bundleDetailKeys } from '../queries/keys';

export type { BundleDetail } from '../queries/bundle';

export function useBundle(bundleId: string) {
  return useQuery({
    ...bundleDetailKeys.detail(bundleId),
    enabled: !!bundleId,
  });
}
