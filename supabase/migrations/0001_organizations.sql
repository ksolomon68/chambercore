-- Chambers of commerce (tenants).
create table organizations (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text not null unique,
  logo_url            text,
  primary_color       text not null default '#C8942A',
  plan_tier           text not null default 'starter'
                        check (plan_tier in ('starter', 'professional', 'enterprise')),
  member_limit        integer not null default 200,
  stripe_customer_id  text unique,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger set_organizations_updated_at
  before update on organizations
  for each row execute function extensions.moddatetime(updated_at);
