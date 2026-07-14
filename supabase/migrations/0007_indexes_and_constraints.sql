-- Additional indexes supporting common lookups not already covered.
create index members_email_idx on members(org_id, email);
create index organizations_stripe_customer_id_idx on organizations(stripe_customer_id);
create index subscriptions_stripe_subscription_id_idx on subscriptions(stripe_subscription_id);
create unique index org_invites_org_email_pending_idx
  on org_invites(org_id, lower(email))
  where accepted_at is null;
