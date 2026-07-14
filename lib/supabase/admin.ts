import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

// Service-role client — bypasses RLS entirely. Server-only: never import this
// from a Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
// Legitimate uses: Stripe webhook writes, invite-acceptance (invitee isn't an
// org member yet), and org creation during signup.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
