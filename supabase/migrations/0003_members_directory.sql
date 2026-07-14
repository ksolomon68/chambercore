-- The chamber's own business members (its paying customers) — the data behind
-- the "Member Management" module.
create table members (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organizations(id) on delete cascade,
  user_id        uuid references auth.users(id) on delete set null,
  business_name  text not null,
  contact_name   text,
  email          text,
  phone          text,
  category       text,
  tier           text not null default 'bronze'
                   check (tier in ('bronze', 'silver', 'gold')),
  status         text not null default 'active'
                   check (status in ('active', 'pending', 'lapsed', 'archived')),
  member_since   date not null default current_date,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index members_org_id_idx on members(org_id);
create index members_org_id_status_idx on members(org_id, status);

create trigger set_members_updated_at
  before update on members
  for each row execute function extensions.moddatetime(updated_at);

-- Curated public-facing presentation layer over `members` — the data behind
-- the "Business Directory" module. Kept separate so staff control what's
-- public vs. internal-only without touching contact/dues data in `members`.
create table directory_listings (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organizations(id) on delete cascade,
  member_id      uuid not null references members(id) on delete cascade unique,
  is_public      boolean not null default true,
  description    text,
  website_url    text,
  address        text,
  logo_url       text,
  featured       boolean not null default false,
  updated_at     timestamptz not null default now()
);

create index directory_listings_org_id_idx on directory_listings(org_id);
create index directory_listings_public_idx on directory_listings(org_id, is_public);

create trigger set_directory_listings_updated_at
  before update on directory_listings
  for each row execute function extensions.moddatetime(updated_at);
