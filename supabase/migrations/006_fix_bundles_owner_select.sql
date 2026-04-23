-- Fix 403 on bundle creation caused by a race condition between the
-- auto_join_owner trigger (AFTER INSERT) and the RETURNING * SELECT check.
--
-- When supabase-js sends INSERT with prefer: return=representation, PostgREST
-- evaluates the SELECT RLS policy after the insert. The is_bundle_member()
-- helper is marked STABLE, so PostgreSQL may cache its result from before the
-- auto_join_owner trigger has inserted the bundle_members row, causing the
-- SELECT policy to return false and the whole request to 403.
--
-- Simplest targeted fix: allow the bundle owner to always select their own
-- bundle via owner_id = auth.uid(), which doesn't depend on bundle_members.

drop policy "bundles: members can read" on bundles;

create policy "bundles: members can read"
  on bundles for select
  to authenticated
  using (is_bundle_member(id) or is_public or owner_id = auth.uid());
