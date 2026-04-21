import { createQueryKeys } from '@lukemorales/query-key-factory';
import { fetchBundles } from './bundles';
import { fetchBundle } from './bundle';
import { fetchBundleItems } from './bundleItems';
import { fetchPinnedBundles } from './pinnedBundles';
import { fetchActivityFeed } from './activityFeed';
import { fetchProfile } from './profile';
import { fetchMembers } from './members';

export const bundleKeys = createQueryKeys('bundles', {
  list: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => fetchBundles(userId),
  }),
});

export const bundleDetailKeys = createQueryKeys('bundle', {
  detail: (id: string) => ({
    queryKey: [id],
    queryFn: () => fetchBundle(id),
  }),
  items: (id: string) => ({
    queryKey: [id],
    queryFn: () => fetchBundleItems(id),
  }),
  members: (id: string) => ({
    queryKey: [id],
    queryFn: () => fetchMembers(id),
  }),
});

export const pinnedBundlesKeys = createQueryKeys('pinned-bundles', {
  byUser: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => fetchPinnedBundles(userId),
  }),
});

export const activityFeedKeys = createQueryKeys('activity-feed', {
  byUser: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => fetchActivityFeed(userId),
  }),
});

export const profileKeys = createQueryKeys('profile', {
  byUser: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => fetchProfile(userId),
  }),
});
