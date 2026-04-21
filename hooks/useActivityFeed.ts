import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { activityFeedKeys } from '../queries/keys';

export type { ActivityFeedEntry } from '../queries/activityFeed';

export function useActivityFeed() {
  const userId = useAuth();

  return useQuery({
    ...activityFeedKeys.byUser(userId!),
    enabled: !!userId,
  });
}
