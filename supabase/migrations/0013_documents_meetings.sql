-- Document Vault and Meetings & Agendas (Governance section).
-- Meetings/documents are visible to all of an org's portal members, not a
-- separate board-member tier — the app has no such role yet (see 0012 events
-- for the same simplification).

create table documents (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  title         text not null,
  category      text not null default 'other' check (category in ('governing', 'minutes', 'financial', 'policies', 'other')),
  file_path     text not null,
  file_name     text not null,
  file_size     integer,
  content_type  text,
  uploaded_by   uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create index documents_org_id_idx on documents(org_id);

create table meetings (
  id                   uuid primary key default gen_random_uuid(),
  org_id               uuid not null references organizations(id) on delete cascade,
  title                text not null,
  meeting_type         text,
  format               text not null default 'in_person' check (format in ('in_person', 'virtual', 'hybrid')),
  location             text,
  starts_at            timestamptz not null,
  duration_minutes     integer not null default 60,
  agenda               text,
  minutes_document_id  uuid references documents(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index meetings_org_id_idx on meetings(org_id);

create trigger set_meetings_updated_at
  before update on meetings
  for each row execute function extensions.moddatetime(updated_at);

create table meeting_rsvps (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  meeting_id    uuid not null references meetings(id) on delete cascade,
  member_id     uuid not null references members(id) on delete cascade,
  responded_at  timestamptz not null default now(),
  unique (meeting_id, member_id)
);

create index meeting_rsvps_meeting_id_idx on meeting_rsvps(meeting_id);

alter table documents enable row level security;
alter table meetings enable row level security;
alter table meeting_rsvps enable row level security;

create policy "org staff can manage documents"
  on documents for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read their org's documents"
  on documents for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "org staff can manage meetings"
  on meetings for all
  using (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'))
  with check (is_org_member(org_id) and org_role(org_id) in ('owner', 'admin', 'staff'));

create policy "org members can read their org's meetings"
  on meetings for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

create policy "org staff can read meeting rsvps"
  on meeting_rsvps for select
  using (is_org_member(org_id));

create policy "members can manage their own rsvp"
  on meeting_rsvps for all
  using (member_id in (select id from members where user_id = (select auth.uid())))
  with check (member_id in (select id from members where user_id = (select auth.uid())));

-- Storage: private bucket, objects stored at "<org_id>/<uuid>-<filename>" so
-- storage RLS can scope access by org via the first path segment.
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

create policy "org staff can manage their org's storage objects"
  on storage.objects for all
  using (
    bucket_id = 'documents'
    and is_org_member((storage.foldername(name))[1]::uuid)
    and org_role((storage.foldername(name))[1]::uuid) in ('owner', 'admin', 'staff')
  )
  with check (
    bucket_id = 'documents'
    and is_org_member((storage.foldername(name))[1]::uuid)
    and org_role((storage.foldername(name))[1]::uuid) in ('owner', 'admin', 'staff')
  );

create policy "org members can read their org's storage objects"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select org_id from members where user_id = (select auth.uid())
    )
  );
