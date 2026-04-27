import { supabase } from './supabase';

export type SyncEvent =
  | { type: 'bundle_items_changed'; bundleId: string; userId: string }
  | { type: 'bundles_changed'; userId: string }
  | { type: 'activity_changed'; userId: string };

// Singleton channel — subscribed once at module level
export const syncChannel = supabase.channel('app-sync');
syncChannel.subscribe();

export function broadcast(event: SyncEvent) {
  syncChannel.send({ type: 'broadcast', event: event.type, payload: event });
}
