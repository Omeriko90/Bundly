import { supabase } from '../lib/supabase';
import { ActivityEvent } from '../types/database';

export type ActivityFeedEntry = {
  id: string;
  eventType: ActivityEvent;
  bundleId: string;
  createdAt: string;
  displayName: string;
  avatarColor: string;
  text: string;
};

function formatActivity(entry: {
  event_type: ActivityEvent;
  metadata: Record<string, unknown> | null;
  profile: { display_name: string; avatar_color: string } | null;
}): string {
  const name = entry.profile?.display_name ?? 'Someone';
  const itemText = (entry.metadata?.item_text as string | undefined) ?? 'an item';
  const bundleName = (entry.metadata?.bundle_name as string | undefined) ?? 'a bundle';

  switch (entry.event_type) {
    case 'item_added':
      return `${name} added "${itemText}" in ${bundleName}`;
    case 'item_checked':
      return `${name} checked off "${itemText}" in ${bundleName}`;
    case 'item_unchecked':
      return `${name} unchecked "${itemText}" in ${bundleName}`;
    case 'item_deleted':
      return `${name} deleted "${itemText}" from ${bundleName}`;
    case 'member_joined':
      return `${name} joined ${bundleName}`;
    case 'member_left':
      return `${name} left ${bundleName}`;
    default:
      return `${name} did something in ${bundleName}`;
  }
}

export async function fetchActivityFeed(userId: string): Promise<ActivityFeedEntry[]> {
  const db = supabase as any;

  const { data: memberships } = await db
    .from('bundle_members')
    .select('bundle_id')
    .eq('user_id', userId);

  const bundleIds = (memberships as { bundle_id: string }[] | null)?.map((m) => m.bundle_id) ?? [];
  if (bundleIds.length === 0) return [];

  const { data, error } = await db
    .from('activity_feed')
    .select('id, event_type, metadata, created_at, bundle_id, profile:profiles(display_name, avatar_color)')
    .in('bundle_id', bundleIds)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  if (!data) return [];

  return (data as any[]).map((row: any) => ({
    id: row.id,
    eventType: row.event_type as ActivityEvent,
    bundleId: row.bundle_id,
    createdAt: row.created_at,
    displayName: row.profile?.display_name ?? 'Someone',
    avatarColor: row.profile?.avatar_color ?? '#888',
    text: formatActivity(row),
  }));
}

export async function logActivity(
  bundleId: string,
  userId: string,
  eventType: ActivityEvent,
  itemId: string | null,
  metadata: Record<string, unknown>,
): Promise<void> {
  const db = supabase as any;
  await db.from('activity_feed').insert({ bundle_id: bundleId, user_id: userId, event_type: eventType, item_id: itemId, metadata });
}
