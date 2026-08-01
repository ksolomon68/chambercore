-- Board Overview, Voting & Polls, Committees (rest of the Governance section).
-- Voting is board-restricted (see board_members) while roster/committees/vote
-- results stay readable by all portal members for transparency, same spirit
-- as the public directory.

create table board_members (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  member_id     uuid references members(id) on delete set null,
  name          text not null,
  title         text,
  is_executive  boolean not null default false,
  created_at    timestamptz not null default now()
);

create index board_members_org_id_idx on board_members(org_id);
create index board_members_member_id_idx on board_members(member_id);

create table committees (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid not null references organizations(id) on delete cascade,
  name                    text not null,
  description             text,
  committee_type          text not null default 'committee' check (committee_type in ('executive', 'finance', 'committee')),
  chair_board_member_id   uuid references board_members(id) on delete set null,
  next_meeting_at         timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index committees_org_id_idx on committees(org_id);

create trigger set_committees_updated_at
  before update on committees
  for each row execute function extensions.moddatetime(updated_at);

create table committee_memberships (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organizations(id) on delete cascade,
  committee_id     uuid not null references committees(id) on delete cascade,
  board_member_id  uuid not null references board_members(id) on delete cascade,
  unique (committee_id, board_member_id)
);

create index committee_memberships_committee_id_idx on committee_memberships(committee_id);

create table votes (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations(id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'open' check (status in ('open', 'closed')),
  closes_at    timestamptz,
  created_at   timestamptz not null default now()
);

create index votes_org_id_idx on votes(org_id);

create table vote_options (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid not null references organizations(id) on delete cascade,
  vote_id   uuid not null references votes(id) on delete cascade,
  label     text not null,
  position  integer not null default 0
);

create index vote_options_vote_id_idx on vote_options(vote_id);

create table vote_casts (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references organizations(id) on delete cascade,
  vote_id           uuid not null references votes(id) on delete cascade,
  option_id         uuid not null references vote_options(id) on delete cascade,
  board_member_id   uuid not null references board_members(id) on delete cascade,
  created_at        timestamptz not null default now(),
  unique (vote_id, board_member_id)
);

create index vote_casts_vote_id_idx on vote_casts(vote_id);

alter table board_members enable row level security;
alter table committees enable row level security;
alter table committee_memberships enable row level security;
alter table votes enable row level security;
alter table vote_options enable row level security;
alter table vote_casts enable row level security;

create policy "org staff can manage board members"
  on board_members for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read board roster"
  on board_members for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "org staff can manage committees"
  on committees for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read committees"
  on committees for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "org staff can manage committee memberships"
  on committee_memberships for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read committee memberships"
  on committee_memberships for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "org staff can manage votes"
  on votes for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read votes"
  on votes for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "org staff can manage vote options"
  on vote_options for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read vote options"
  on vote_options for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "org staff can manage vote casts"
  on vote_casts for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read vote casts"
  on vote_casts for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "board members can cast their own vote"
  on vote_casts for insert
  with check (
    org_id in (select org_id from members where user_id = (select auth.uid()))
    and board_member_id in (
      select bm.id from board_members bm
      join members m on m.id = bm.member_id
      where m.user_id = (select auth.uid()) and bm.org_id = vote_casts.org_id
    )
  );
