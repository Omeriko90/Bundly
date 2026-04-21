import { useQuery } from '@tanstack/react-query';
import { bundleDetailKeys } from '../queries/keys';

export type { BundleMemberEntry } from '../queries/members';

export function useMembers(bundleId: string) {
  return useQuery({
    ...bundleDetailKeys.members(bundleId),
    enabled: !!bundleId,
  });
}
