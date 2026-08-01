-- Member dues & payments ledger (manual tracking — no online payment
-- processing; staff record invoices and mark them paid). Distinct from
-- `subscriptions`, which is the chamber's own SaaS billing to ChamberCore.

create table dues_tier_pricing (
  org_id       uuid not null references organizations(id) on delete cascade,
  tier         text not null check (tier in ('bronze', 'silver', 'gold')),
  annual_price numeric(10,2),
  updated_at   timestamptz not null default now(),
  primary key (org_id, tier)
);

create trigger set_dues_tier_pricing_updated_at
  before update on dues_tier_pricing
  for each row execute function extensions.moddatetime(updated_at);

create table dues_invoices (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organizations(id) on delete cascade,
  member_id      uuid not null references members(id) on delete cascade,
  description    text not null,
  amount         numeric(10,2) not null check (amount >= 0),
  due_date       date not null,
  status         text not null default 'pending'
                   check (status in ('pending', 'paid', 'void')),
  payment_method text check (payment_method in ('cash', 'check', 'card', 'ach', 'other')),
  paid_at        timestamptz,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index dues_invoices_org_id_idx on dues_invoices(org_id);
create index dues_invoices_member_id_idx on dues_invoices(member_id);

create trigger set_dues_invoices_updated_at
  before update on dues_invoices
  for each row execute function extensions.moddatetime(updated_at);

alter table dues_tier_pricing enable row level security;
alter table dues_invoices enable row level security;

create policy "org staff can read tier pricing"
  on dues_tier_pricing for select
  using (is_org_member(org_id));

create policy "org admin/owner can manage tier pricing"
  on dues_tier_pricing for insert with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin'));

create policy "org admin/owner can update tier pricing"
  on dues_tier_pricing for update using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin'));

create policy "org admin/owner can delete tier pricing"
  on dues_tier_pricing for delete using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin'));

create policy "members can read their org's tier pricing"
  on dues_tier_pricing for select
  using (org_id in (select org_id from members where user_id = auth.uid()));

create policy "org staff can manage dues invoices"
  on dues_invoices for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "members can read their own invoices"
  on dues_invoices for select
  using (member_id in (select id from members where user_id = auth.uid()));
