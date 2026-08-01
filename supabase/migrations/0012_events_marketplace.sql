-- Events & Registration and M2M Marketplace modules.

create table events (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations(id) on delete cascade,
  title        text not null,
  description  text,
  location     text,
  starts_at    timestamptz not null,
  price        numeric(10,2),
  capacity     integer,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index events_org_id_idx on events(org_id);

create trigger set_events_updated_at
  before update on events
  for each row execute function extensions.moddatetime(updated_at);

create table event_registrations (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organizations(id) on delete cascade,
  event_id       uuid not null references events(id) on delete cascade,
  member_id      uuid not null references members(id) on delete cascade,
  registered_at  timestamptz not null default now(),
  unique (event_id, member_id)
);

create index event_registrations_event_id_idx on event_registrations(event_id);
create index event_registrations_member_id_idx on event_registrations(member_id);

create table marketplace_listings (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organizations(id) on delete cascade,
  member_id        uuid not null references members(id) on delete cascade,
  kind             text not null check (kind in ('deal', 'job')),
  title            text not null,
  category         text,
  description      text,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'archived')),
  discount_label   text,
  promo_code       text,
  expires_at       date,
  employment_type  text check (employment_type in ('full_time', 'part_time', 'contract', 'internship')),
  location         text,
  pay_range        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index marketplace_listings_org_id_idx on marketplace_listings(org_id);
create index marketplace_listings_org_id_status_idx on marketplace_listings(org_id, status);

create trigger set_marketplace_listings_updated_at
  before update on marketplace_listings
  for each row execute function extensions.moddatetime(updated_at);

alter table events enable row level security;
alter table event_registrations enable row level security;
alter table marketplace_listings enable row level security;

create policy "org staff can manage events"
  on events for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read their org's events"
  on events for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "org staff can read event registrations"
  on event_registrations for select
  using (is_org_member(org_id));

create policy "members can manage their own registration"
  on event_registrations for all
  using (member_id in (select id from members where user_id = (select auth.uid())))
  with check (member_id in (select id from members where user_id = (select auth.uid())));

create policy "org staff can manage marketplace listings"
  on marketplace_listings for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "members can read approved listings in their org"
  on marketplace_listings for select
  using (status = 'approved' and org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "members can read their own submissions"
  on marketplace_listings for select
  using (member_id in (select id from members where user_id = (select auth.uid())));

create policy "members can submit listings"
  on marketplace_listings for insert
  with check (
    status = 'pending'
    and member_id in (
      select id from members
      where user_id = (select auth.uid()) and org_id = marketplace_listings.org_id
    )
  );
