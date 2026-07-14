-- Row-Level Security: every tenant-scoped table is isolated per organization.
-- Uses the is_org_member()/org_role() SECURITY DEFINER helpers from 0002.

alter table organizations enable row level security;
alter table org_members enable row level security;
alter table members enable row level security;
alter table directory_listings enable row level security;
alter table subscriptions enable row level security;
alter table org_invites enable row level security;

-- ── organizations ──────────────────────────────────────────────────────────
create policy "org members can read their organization"
  on organizations for select
  using (is_org_member(id));

create policy "owner/admin can update their organization"
  on organizations for update
  using (is_org_member(id) and org_role(id) in ('owner', 'admin'));

-- Organization creation happens via the service-role client during the
-- signup flow (app/actions/auth.ts), which bypasses RLS — no authenticated
-- insert policy is defined here.

-- ── org_members ────────────────────────────────────────────────────────────
create policy "org members can read their org's team roster"
  on org_members for select
  using (is_org_member(org_id));

create policy "owner/admin can manage team roster"
  on org_members for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin'));

-- ── members ────────────────────────────────────────────────────────────────
create policy "org members can read their org's members"
  on members for select
  using (is_org_member(org_id));

create policy "staff/admin/owner can insert members"
  on members for insert
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "staff/admin/owner can update members"
  on members for update
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "owner/admin can delete members"
  on members for delete
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin'));

-- ── directory_listings ─────────────────────────────────────────────────────
create policy "org staff can manage directory listings"
  on directory_listings for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

-- Public/unauthenticated read access, restricted to listings explicitly
-- marked public — powers app/(public)/directory/[orgSlug]. Internal fields
-- (contact info, dues status, notes) live in `members`, which has no
-- anon-accessible policy, so they are never exposed here.
create policy "anyone can read public directory listings"
  on directory_listings for select
  to anon, authenticated
  using (is_public = true);

-- ── subscriptions ──────────────────────────────────────────────────────────
create policy "org members can read their subscription"
  on subscriptions for select
  using (is_org_member(org_id));

-- No insert/update/delete policy for authenticated/anon roles: subscriptions
-- are only ever written by the Stripe webhook handler via the service-role
-- client, which bypasses RLS entirely.

-- ── org_invites ────────────────────────────────────────────────────────────
create policy "owner/admin can manage invites"
  on org_invites for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin'));

-- Invite acceptance (app/api/invites/[token]/accept) is handled by the
-- service-role client since the invitee isn't an org member yet.
