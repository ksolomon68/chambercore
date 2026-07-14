-- Minimal public-safe view of organizations, used by the unauthenticated
-- public directory page (app/(public)/c/[orgSlug]). Granting anon SELECT
-- directly on `organizations` would leak stripe_customer_id/member_limit/etc
-- to any client using the anon key, since RLS is row- not column-level.
--
-- security_invoker is intentionally left at its default (false): the view
-- runs with the privileges of its owner (the migration role, which owns
-- `organizations` and therefore bypasses its RLS), rather than the querying
-- anon/authenticated role, so it can expose these safe columns for every
-- organization regardless of the caller's org_members row.
create view public_org_profile as
  select id, name, slug, logo_url, primary_color
  from organizations;

grant select on public_org_profile to anon, authenticated;
