-- Fix handle_new_user failing with "relation profiles does not exist".
-- Supabase now runs security definer functions with an empty search_path,
-- so unqualified table names like "profiles" can't be resolved.
-- Adding SET search_path = public fixes this.

create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
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
    insert into bundle_members (bundle_id, user_id, role)
    values (v_invite.bundle_id, new.id, v_invite.role)
    on conflict (bundle_id, user_id) do nothing;

    update bundle_invitations
    set status      = 'accepted',
        accepted_by = new.id,
        accepted_at = now()
    where id = v_invite.id;
  end loop;

  return new;
end;
$$;
