-- Perf fix flagged by the Supabase linter (auth_rls_initplan): wrap auth.uid()
-- in a scalar subquery so Postgres evaluates it once per query instead of
-- once per row. Same policies introduced in 0009/0010, logic unchanged.

drop policy "members can read their own record" on members;
create policy "members can read their own record"
  on members for select
  using (user_id = (select auth.uid()));

drop policy "members can read their own directory listing" on directory_listings;
create policy "members can read their own directory listing"
  on directory_listings for select
  using (member_id in (select id from members where user_id = (select auth.uid())));

drop policy "members can read their org's tier pricing" on dues_tier_pricing;
create policy "members can read their org's tier pricing"
  on dues_tier_pricing for select
  using (org_id in (select org_id from members where user_id = (select auth.uid())));

drop policy "members can read their own invoices" on dues_invoices;
create policy "members can read their own invoices"
  on dues_invoices for select
  using (member_id in (select id from members where user_id = (select auth.uid())));
