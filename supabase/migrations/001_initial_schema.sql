-- ============================================================
-- Bundly — Initial Schema
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Extensions
-- ────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- 1. Enums
-- ────────────────────────────────────────────────────────────
create type bundle_type as enum ('wishlist', 'packing_list', 'grocery', 'checklist');
create type member_role as enum ('owner', 'editor', 'viewer');
create type invite_status as enum ('pending', 'accepted', 'declined', 'expired');
create type activity_event as enum (
  'item_checked',
  'item_unchecked',
  'item_added',
  'item_deleted',
  'member_joined',
  'member_left'
);

-- ────────────────────────────────────────────────────────────
-- 2. Tables
-- ────────────────────────────────────────────────────────────

-- 2.1 profiles
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text        not null,
  avatar_url    text,
  avatar_color  text        not null default '#6366F1',
  push_token    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2.2 bundles
create table bundles (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null check (char_length(name) <= 50),
  description  text        check (char_length(description) <= 200),
  color        text        not null,
  icon         text        not null,
  type         bundle_type not null,
  is_public    boolean     not null default false,
  owner_id     uuid        not null references profiles(id) on delete restrict,
  share_token  text        unique,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 2.3 bundle_members
create table bundle_members (
  id         uuid primary key default gen_random_uuid(),
  bundle_id  uuid        not null references bundles(id) on delete cascade,
  user_id    uuid        not null references profiles(id) on delete cascade,
  role       member_role not null,
  is_pinned  boolean     not null default false,
  joined_at  timestamptz not null default now(),
  unique (bundle_id, user_id)
);

-- 2.4 bundle_items
create table bundle_items (
  id          uuid primary key default gen_random_uuid(),
  bundle_id   uuid        not null references bundles(id) on delete cascade,
  text        text        not null,
  notes       text,
  checked     boolean     not null default false,
  checked_by  uuid        references profiles(id) on delete set null,
  checked_at  timestamptz,
  position    float8      not null default 0,
  added_by    uuid        not null references profiles(id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2.5 bundle_invitations
create table bundle_invitations (
  id           uuid primary key default gen_random_uuid(),
  bundle_id    uuid          not null references bundles(id) on delete cascade,
  invited_by   uuid          not null references profiles(id) on delete restrict,
  email        text          not null,
  role         member_role   not null check (role in ('editor', 'viewer')),
  status       invite_status not null default 'pending',
  accepted_by  uuid          references profiles(id) on delete set null,
  accepted_at  timestamptz,
  expires_at   timestamptz   not null default (now() + interval '7 days'),
  created_at   timestamptz   not null default now()
);

-- Prevent duplicate pending invites for the same (bundle, email)
create unique index bundle_invitations_pending_unique
  on bundle_invitations (bundle_id, email)
  where (status = 'pending');

-- 2.6 activity_feed
create table activity_feed (
  id          uuid           primary key default gen_random_uuid(),
  bundle_id   uuid           not null references bundles(id) on delete cascade,
  user_id     uuid           not null references profiles(id) on delete restrict,
  event_type  activity_event not null,
  item_id     uuid           references bundle_items(id) on delete set null,
  metadata    jsonb,
  created_at  timestamptz    not null default now()
);

-- 2.7 notification_preferences
create table notification_preferences (
  user_id        uuid primary key references profiles(id) on delete cascade,
  item_checked   boolean     not null default true,
  item_unchecked boolean     not null default true,
  item_added     boolean     not null default true,
  item_deleted   boolean     not null default true,
  updated_at     timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- 3. Triggers
-- ────────────────────────────────────────────────────────────

-- 3.1 set_updated_at — generic trigger function
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

create trigger trg_bundles_updated_at
  before update on bundles
  for each row execute procedure set_updated_at();

create trigger trg_bundle_items_updated_at
  before update on bundle_items
  for each row execute procedure set_updated_at();

create trigger trg_notification_preferences_updated_at
  before update on notification_preferences
  for each row execute procedure set_updated_at();

-- 3.2 handle_new_user — runs when auth.users gets a new row
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_display_name text;
  v_invite       record;
begin
  -- Derive a display name from email or metadata
  v_display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Create profile
  insert into profiles (id, display_name, avatar_color)
  values (
    new.id,
    v_display_name,
    '#' || substr(md5(new.email), 1, 6)
  );

  -- Create default notification preferences
  insert into notification_preferences (user_id)
  values (new.id);

  -- Auto-accept any pending invitations matching the new user's email
  for v_invite in
    select * from bundle_invitations
    where email = new.email
      and status = 'pending'
      and expires_at > now()
  loop
    -- Add as member
    insert into bundle_members (bundle_id, user_id, role)
    values (v_invite.bundle_id, new.id, v_invite.role)
    on conflict (bundle_id, user_id) do nothing;

    -- Mark invitation accepted
    update bundle_invitations
    set status      = 'accepted',
        accepted_by = new.id,
        accepted_at = now()
    where id = v_invite.id;
  end loop;

  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 3.3 auto_join_owner — when a bundle is created, add the owner as member
create or replace function auto_join_owner()
returns trigger language plpgsql security definer as $$
begin
  insert into bundle_members (bundle_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger trg_auto_join_owner
  after insert on bundles
  for each row execute procedure auto_join_owner();

-- ────────────────────────────────────────────────────────────
-- 4. Row-Level Security (RLS)
-- ────────────────────────────────────────────────────────────

-- Helper: is the current user a member of a given bundle?
create or replace function is_bundle_member(p_bundle_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from bundle_members
    where bundle_id = p_bundle_id
      and user_id   = auth.uid()
  );
$$;

-- Helper: is the current user the owner of a given bundle?
create or replace function is_bundle_owner(p_bundle_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from bundle_members
    where bundle_id = p_bundle_id
      and user_id   = auth.uid()
      and role      = 'owner'
  );
$$;

-- Helper: is the current user an owner or editor of a given bundle?
create or replace function is_bundle_editor(p_bundle_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from bundle_members
    where bundle_id = p_bundle_id
      and user_id   = auth.uid()
      and role in ('owner', 'editor')
  );
$$;

-- 4.1 profiles
alter table profiles enable row level security;

create policy "profiles: authenticated users can read any profile"
  on profiles for select
  to authenticated
  using (true);

create policy "profiles: users can update own row"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 4.2 bundles
alter table bundles enable row level security;

create policy "bundles: members can read"
  on bundles for select
  to authenticated
  using (is_bundle_member(id) or is_public);

create policy "bundles: any auth user can create"
  on bundles for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "bundles: owner can update"
  on bundles for update
  to authenticated
  using (is_bundle_owner(id))
  with check (is_bundle_owner(id));

create policy "bundles: owner can delete"
  on bundles for delete
  to authenticated
  using (is_bundle_owner(id));

-- 4.3 bundle_members
alter table bundle_members enable row level security;

create policy "bundle_members: members can read"
  on bundle_members for select
  to authenticated
  using (is_bundle_member(bundle_id));

create policy "bundle_members: owner can insert"
  on bundle_members for insert
  to authenticated
  with check (is_bundle_owner(bundle_id));

create policy "bundle_members: owner can update roles"
  on bundle_members for update
  to authenticated
  using (is_bundle_owner(bundle_id))
  with check (is_bundle_owner(bundle_id));

create policy "bundle_members: owner or self can delete"
  on bundle_members for delete
  to authenticated
  using (is_bundle_owner(bundle_id) or user_id = auth.uid());

-- 4.4 bundle_items
alter table bundle_items enable row level security;

create policy "bundle_items: members can read"
  on bundle_items for select
  to authenticated
  using (is_bundle_member(bundle_id));

create policy "bundle_items: owner or editor can insert"
  on bundle_items for insert
  to authenticated
  with check (is_bundle_editor(bundle_id));

create policy "bundle_items: owner or editor can update"
  on bundle_items for update
  to authenticated
  using (is_bundle_editor(bundle_id))
  with check (is_bundle_editor(bundle_id));

create policy "bundle_items: owner or editor can delete"
  on bundle_items for delete
  to authenticated
  using (is_bundle_editor(bundle_id));

-- 4.5 bundle_invitations
alter table bundle_invitations enable row level security;

create policy "bundle_invitations: members can read"
  on bundle_invitations for select
  to authenticated
  using (is_bundle_member(bundle_id));

create policy "bundle_invitations: owner can insert"
  on bundle_invitations for insert
  to authenticated
  with check (is_bundle_owner(bundle_id));

create policy "bundle_invitations: owner can update"
  on bundle_invitations for update
  to authenticated
  using (is_bundle_owner(bundle_id))
  with check (is_bundle_owner(bundle_id));

create policy "bundle_invitations: owner can delete"
  on bundle_invitations for delete
  to authenticated
  using (is_bundle_owner(bundle_id));

-- 4.6 activity_feed
alter table activity_feed enable row level security;

create policy "activity_feed: members can read"
  on activity_feed for select
  to authenticated
  using (is_bundle_member(bundle_id));

create policy "activity_feed: authenticated users can insert"
  on activity_feed for insert
  to authenticated
  with check (user_id = auth.uid() and is_bundle_editor(bundle_id));

-- 4.7 notification_preferences
alter table notification_preferences enable row level security;

create policy "notification_preferences: users can read own row"
  on notification_preferences for select
  to authenticated
  using (user_id = auth.uid());

create policy "notification_preferences: users can update own row"
  on notification_preferences for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- 5. Indexes (performance)
-- ────────────────────────────────────────────────────────────
create index idx_bundle_members_user    on bundle_members (user_id);
create index idx_bundle_members_bundle  on bundle_members (bundle_id);
create index idx_bundle_items_bundle    on bundle_items   (bundle_id, position);
create index idx_activity_feed_bundle   on activity_feed  (bundle_id, created_at desc);
create index idx_bundle_invitations_email on bundle_invitations (email) where status = 'pending';
create index idx_bundles_owner          on bundles        (owner_id);

-- ────────────────────────────────────────────────────────────
-- 6. Storage — avatars bucket
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Authenticated users can upload/update their own avatar
create policy "avatars: users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can read avatars (public bucket)
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');
