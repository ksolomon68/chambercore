-- Legislative Advocacy Action Center. No transactional email system exists in
-- this app, so "contact your officials" is a mailto: link plus a
-- self-reported action log, same manual-tracking spirit as dues invoices.

create table advocacy_issues (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references organizations(id) on delete cascade,
  title              text not null,
  description        text,
  status             text not null default 'monitoring' check (status in ('urgent', 'watch', 'monitoring', 'resolved')),
  position           text,
  cta_headline       text,
  cta_email_subject  text,
  cta_email_body     text,
  goal_count         integer,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index advocacy_issues_org_id_idx on advocacy_issues(org_id);

create trigger set_advocacy_issues_updated_at
  before update on advocacy_issues
  for each row execute function extensions.moddatetime(updated_at);

create table advocacy_action_log (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations(id) on delete cascade,
  issue_id     uuid not null references advocacy_issues(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (issue_id, member_id)
);

create index advocacy_action_log_issue_id_idx on advocacy_action_log(issue_id);

create table officials (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  title       text,
  level       text not null default 'local' check (level in ('federal', 'state', 'local')),
  email       text,
  phone       text,
  created_at  timestamptz not null default now()
);

create index officials_org_id_idx on officials(org_id);

alter table advocacy_issues enable row level security;
alter table advocacy_action_log enable row level security;
alter table officials enable row level security;

create policy "org staff can manage advocacy issues"
  on advocacy_issues for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read advocacy issues"
  on advocacy_issues for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "org staff can manage advocacy action log"
  on advocacy_action_log for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read advocacy action log"
  on advocacy_action_log for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "members can log their own action"
  on advocacy_action_log for insert
  with check (
    org_id in (select org_id from members where user_id = (select auth.uid()))
    and member_id in (select id from members where user_id = (select auth.uid()))
  );

create policy "org staff can manage officials"
  on officials for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read officials"
  on officials for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));
