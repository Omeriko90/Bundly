-- Fix all remaining security definer functions missing set search_path = public.
-- Without this, unqualified table names fail when Supabase runs with empty search_path.

create or replace function auto_join_owner()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into bundle_members (bundle_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create or replace function is_bundle_member(p_bundle_id uuid)
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from bundle_members
    where bundle_id = p_bundle_id
      and user_id   = auth.uid()
  );
$$;

create or replace function is_bundle_owner(p_bundle_id uuid)
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from bundle_members
    where bundle_id = p_bundle_id
      and user_id   = auth.uid()
      and role      = 'owner'
  );
$$;

create or replace function is_bundle_editor(p_bundle_id uuid)
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from bundle_members
    where bundle_id = p_bundle_id
      and user_id   = auth.uid()
      and role in ('owner', 'editor')
  );
$$;
