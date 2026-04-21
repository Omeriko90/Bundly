import { supabase } from '../lib/supabase';

export type PinnedBundle = {
  id: string;
  name: string;
  color: string;
  items: number;
  members: number;
};

export async function fetchPinnedBundles(userId: string): Promise<PinnedBundle[]> {
  const db = supabase as any;
  const { data, error } = await db
    .from('bundle_members')
    .select(`
      is_pinned,
      bundle:bundles(
        id, name, color,
        bundle_items(id),
        bundle_members(user_id)
      )
    `)
    .eq('user_id', userId)
    .eq('is_pinned', true);

  if (error) throw error;
  if (!data) return [];

  return (data as any[]).map((row: any) => {
    const b = row.bundle;
    return {
      id: b.id,
      name: b.name,
      color: b.color,
      items: (b.bundle_items ?? []).length,
      members: (b.bundle_members ?? []).length,
    };
  });
}
