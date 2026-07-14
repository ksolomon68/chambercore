-- Billing state, synced from Stripe webhooks (see app/api/stripe/webhook).
create table subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  org_id                   uuid not null unique references organizations(id) on delete cascade,
  stripe_subscription_id   text unique,
  stripe_price_id          text,
  plan_tier                text not null
                             check (plan_tier in ('starter', 'professional', 'enterprise')),
  status                   text not null,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create trigger set_subscriptions_updated_at
  before update on subscriptions
  for each row execute function extensions.moddatetime(updated_at);

-- Postgres-level backstop for member-count limits, independent of the
-- application layer. `organizations.member_limit` is kept in sync by the
-- Stripe webhook handler whenever plan tier changes.
create or replace function public.enforce_member_limit()
returns trigger
language plpgsql
as $$
declare
  v_limit integer;
  v_count integer;
begin
  select member_limit into v_limit from organizations where id = new.org_id;

  if v_limit is not null then
    select count(*) into v_count
    from members
    where org_id = new.org_id and status <> 'archived';

    if v_count >= v_limit then
      raise exception 'Member limit reached for this plan (limit: %)', v_limit
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_enforce_member_limit
  before insert on members
  for each row execute function public.enforce_member_limit();
