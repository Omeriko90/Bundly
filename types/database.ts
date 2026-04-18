// Auto-generated TypeScript types for the Bundly Supabase schema.
// Keep in sync with supabase/migrations/001_initial_schema.sql

export type BundleType = 'wishlist' | 'packing_list' | 'grocery' | 'checklist';
export type MemberRole = 'owner' | 'editor' | 'viewer';
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type ActivityEvent =
  | 'item_checked'
  | 'item_unchecked'
  | 'item_added'
  | 'item_deleted'
  | 'member_joined'
  | 'member_left';

// ────────────────────────────────────────────────────────────
// Table row types (matches database columns 1-to-1)
// ────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  avatar_color: string;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  type: BundleType;
  is_public: boolean;
  owner_id: string;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface BundleMember {
  id: string;
  bundle_id: string;
  user_id: string;
  role: MemberRole;
  is_pinned: boolean;
  joined_at: string;
}

export interface BundleItem {
  id: string;
  bundle_id: string;
  text: string;
  notes: string | null;
  checked: boolean;
  checked_by: string | null;
  checked_at: string | null;
  position: number;
  added_by: string;
  created_at: string;
  updated_at: string;
}

export interface BundleInvitation {
  id: string;
  bundle_id: string;
  invited_by: string;
  email: string;
  role: Exclude<MemberRole, 'owner'>;
  status: InviteStatus;
  accepted_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  bundle_id: string;
  user_id: string;
  event_type: ActivityEvent;
  item_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  item_checked: boolean;
  item_unchecked: boolean;
  item_added: boolean;
  item_deleted: boolean;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────
// Supabase Database type (for createClient generic)
// ────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> &
          Partial<Pick<Profile, 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      bundles: {
        Row: Bundle;
        Insert: Omit<Bundle, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Bundle, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<Bundle, 'id'>>;
      };
      bundle_members: {
        Row: BundleMember;
        Insert: Omit<BundleMember, 'id' | 'joined_at'> &
          Partial<Pick<BundleMember, 'id' | 'joined_at'>>;
        Update: Partial<Omit<BundleMember, 'id' | 'bundle_id' | 'user_id'>>;
      };
      bundle_items: {
        Row: BundleItem;
        Insert: Omit<BundleItem, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<BundleItem, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<BundleItem, 'id'>>;
      };
      bundle_invitations: {
        Row: BundleInvitation;
        Insert: Omit<BundleInvitation, 'id' | 'created_at'> &
          Partial<Pick<BundleInvitation, 'id' | 'created_at'>>;
        Update: Partial<Omit<BundleInvitation, 'id'>>;
      };
      activity_feed: {
        Row: ActivityFeedItem;
        Insert: Omit<ActivityFeedItem, 'id' | 'created_at'> &
          Partial<Pick<ActivityFeedItem, 'id' | 'created_at'>>;
        Update: never;
      };
      notification_preferences: {
        Row: NotificationPreferences;
        Insert: Pick<NotificationPreferences, 'user_id'> &
          Partial<Omit<NotificationPreferences, 'user_id'>>;
        Update: Partial<Omit<NotificationPreferences, 'user_id'>>;
      };
    };
    Enums: {
      bundle_type: BundleType;
      member_role: MemberRole;
      invite_status: InviteStatus;
      activity_event: ActivityEvent;
    };
  };
}

// ────────────────────────────────────────────────────────────
// Joined / enriched view types (for UI layer)
// ────────────────────────────────────────────────────────────

/** Bundle row with the current user's membership info attached */
export interface BundleWithMembership extends Bundle {
  membership: BundleMember;
}

/** Bundle item with profile of who added/checked it */
export interface BundleItemWithProfiles extends BundleItem {
  added_by_profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'avatar_color'>;
  checked_by_profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'avatar_color'> | null;
}

/** Activity feed item with actor profile */
export interface ActivityFeedItemWithProfile extends ActivityFeedItem {
  profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'avatar_color'>;
}
