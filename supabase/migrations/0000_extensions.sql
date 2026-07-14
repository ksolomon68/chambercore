-- Required extensions for UUID generation and updated_at triggers.
create extension if not exists pgcrypto;
create extension if not exists moddatetime schema extensions;
