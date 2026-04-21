import { supabase } from '../lib/supabase';
import { MemberRole } from '../types/database';

export type BundleMemberEntry = {
  userId: string;
  role: MemberRole;
  displayName: string;
  avatarColor: string;
};

export async function fetchMembers(bundleId: string): Promise<BundleMemberEntry[]> {
  const db = supabase as any;
  const { data, error } = await db
    .from('bundle_members')
    .select('role, user_id, profile:profiles(display_name, avatar_color)')
    .eq('bundle_id', bundleId);

  if (error) throw error;
  if (!data) return [];

  return (data as any[]).map((row: any) => ({
    userId: row.user_id,
    role: row.role as MemberRole,
    displayName: row.profile?.display_name ?? 'Unknown',
    avatarColor: row.profile?.avatar_color ?? '#888',
  }));
}

export async function createInvitation(params: {
  bundleId: string;
  email: string;
  invitedBy: string;
}): Promise<void> {
  const db = supabase as any;
  const { error } = await db.from('bundle_invitations').insert({
    bundle_id: params.bundleId,
    email: params.email,
    role: 'editor',
    invited_by: params.invitedBy,
    status: 'pending',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  if (error) throw error;
}
