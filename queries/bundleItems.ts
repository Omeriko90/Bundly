import { supabase } from '../lib/supabase';

export type BundleDetailItem = {
  id: string;
  text: string;
  checked: boolean;
  position: number;
  addedBy: string;
};

export async function fetchBundleItems(bundleId: string): Promise<BundleDetailItem[]> {
  const db = supabase as any;
  const { data, error } = await db
    .from('bundle_items')
    .select('id, text, checked, position, added_by_profile:profiles!added_by(display_name)')
    .eq('bundle_id', bundleId)
    .order('position');
  if (error) throw error;
  if (!data) return [];
  return (data as any[]).map((item: any) => ({
    id: item.id,
    text: item.text,
    checked: item.checked,
    position: item.position,
    addedBy: item.added_by_profile?.display_name ?? 'Unknown',
  }));
}

export async function updateItemChecked(
  itemId: string,
  checked: boolean,
  checkedBy: string | null,
): Promise<void> {
  const db = supabase as any;
  const { error } = await db
    .from('bundle_items')
    .update({
      checked,
      checked_by: checkedBy,
      checked_at: checked ? new Date().toISOString() : null,
    })
    .eq('id', itemId);
  if (error) throw error;
}

export async function insertBundleItem(
  bundleId: string,
  text: string,
  position: number,
  addedBy: string,
): Promise<{ id: string }> {
  const db = supabase as any;
  const { data, error } = await db
    .from('bundle_items')
    .insert({ bundle_id: bundleId, text, checked: false, position, added_by: addedBy })
    .select('id')
    .single();
  if (error) throw error;
  return data as { id: string };
}

export async function removeBundleItem(itemId: string): Promise<void> {
  const db = supabase as any;
  const { error } = await db.from('bundle_items').delete().eq('id', itemId);
  if (error) throw error;
}
