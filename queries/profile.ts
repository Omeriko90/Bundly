import { supabase } from '../lib/supabase';

export type ProfileData = {
  email: string | undefined;
  display_name: string;
  avatar_color: string;
  bundleCount: number;
  itemCount: number;
  completedCount: number;
};

export async function fetchProfile(userId: string): Promise<ProfileData> {
  const db = supabase as any;
  const { data: { session } } = await supabase.auth.getSession();

  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('display_name, avatar_color')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  const { data: memberships } = await db
    .from('bundle_members')
    .select('bundle_id')
    .eq('user_id', userId);

  const bundleIds = (memberships as { bundle_id: string }[] | null)?.map((m) => m.bundle_id) ?? [];
  let itemCount = 0;
  let completedCount = 0;

  if (bundleIds.length > 0) {
    const [{ count: total }, { count: done }] = await Promise.all([
      db.from('bundle_items').select('*', { count: 'exact', head: true }).in('bundle_id', bundleIds),
      db.from('bundle_items').select('*', { count: 'exact', head: true }).in('bundle_id', bundleIds).eq('checked', true),
    ]);
    itemCount = (total as number | null) ?? 0;
    completedCount = (done as number | null) ?? 0;
  }

  const p = profile as { display_name: string; avatar_color: string } | null;
  return {
    email: session?.user.email,
    display_name: p?.display_name ?? '',
    avatar_color: p?.avatar_color ?? '#888',
    bundleCount: bundleIds.length,
    itemCount,
    completedCount,
  };
}
