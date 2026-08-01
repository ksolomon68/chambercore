-- Foundation for the member self-service portal: lets a business member
-- (a row in `members`) log in as themselves, distinct from chamber staff
-- (`org_members`).

-- One auth user can be linked to at most one business-member record.
create unique index members_user_id_idx on members(user_id) where user_id is not null;

-- Member-portal invites are tied to a specific existing member row, so
-- acceptance knows which `members` record to link the new auth user to.
alter table org_invites add column member_id uuid references members(id) on delete cascade;

-- A business member can read (but not write) their own record. Writes go
-- through server actions using the service-role client with an explicit
-- ownership check, so tier/status/etc. stay staff-controlled without needing
-- column-level RLS.
create policy "members can read their own record"
  on members for select
  using (user_id = auth.uid());

-- A business member can read their own directory listing regardless of
-- is_public, so they can see/edit it from the portal even before staff makes
-- it public.
create policy "members can read their own directory listing"
  on directory_listings for select
  using (member_id in (select id from members where user_id = auth.uid()));
