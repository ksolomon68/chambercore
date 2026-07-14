-- Platform users' membership in a chamber's back office (owner/admin/staff).
-- Distinct from `members`, which is the chamber's own paying business members.
create table org_members (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('owner', 'admin', 'staff')),
  created_at  timestamptz not null default now(),
  unique (org_id, user_id)
);

create index org_members_org_id_idx on org_members(org_id);
create index org_members_user_id_idx on org_members(user_id);

-- SECURITY DEFINER helpers used throughout RLS policies (0006) to avoid
-- recursive policy evaluation on org_members itself.
create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from org_members
    where org_id = target_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.org_role(target_org_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from org_members
  where org_id = target_org_id and user_id = auth.uid()
  limit 1;
$$;
