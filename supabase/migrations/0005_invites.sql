-- Pending invitations for staff/admin/member roles within a chamber's back office.
create table org_invites (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations(id) on delete cascade,
  email        text not null,
  role         text not null check (role in ('admin', 'staff', 'member')),
  token        text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by   uuid references auth.users(id),
  accepted_at  timestamptz,
  expires_at   timestamptz not null default now() + interval '14 days',
  created_at   timestamptz not null default now()
);

create index org_invites_org_id_idx on org_invites(org_id);
create index org_invites_token_idx on org_invites(token);
