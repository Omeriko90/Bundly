import { supabase } from '../lib/supabase';

export type BundleListItem = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  isOwner: boolean;
  isPinned: boolean;
  items: number;
  checkedItems: number;
  members: { initial: string; color: string }[];
};

export async function fetchBundles(userId: string): Promise<BundleListItem[]> {
  const db = supabase as any;
  const { data, error } = await db
    .from('bundle_members')
    .select(`
      role,
      is_pinned,
      bundle:bundles(
        id, name, description, color, icon, owner_id,
        bundle_items(id, checked),
        bundle_members(user_id, profile:profiles(display_name, avatar_color))
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  if (!data) return [];

  return data.map((row: any) => {
    const b = row.bundle;
    const items: any[] = b.bundle_items ?? [];
    const members: any[] = b.bundle_members ?? [];
    return {
      id: b.id,
      name: b.name,
      description: b.description,
      color: b.color,
      icon: b.icon,
      isOwner: b.owner_id === userId,
      isPinned: row.is_pinned,
      items: items.length,
      checkedItems: items.filter((i: any) => i.checked).length,
      members: members.map((m: any) => ({
        initial: (m.profile?.display_name ?? '?')[0].toUpperCase(),
        color: m.profile?.avatar_color ?? '#888',
      })),
    };
  });
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function createBundle(params: {
  name: string;
  description: string;
  color: string;
  icon: string;
  is_public: boolean;
  ownerId: string;
}): Promise<{ id: string; name: string }> {
  const db = supabase as any;
  const id = generateUUID();
  const { error } = await db
    .from('bundles')
    .insert({
      id,
      name: params.name,
      description: params.description,
      color: params.color,
      icon: params.icon,
      is_public: params.is_public,
      owner_id: params.ownerId,
      type: 'checklist',
      share_token: null,
    });
  if (error) throw error;
  return { id, name: params.name };
}
