import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/dues/InvoiceForm";

export default async function NewInvoicePage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, business_name")
    .eq("org_id", org!.id)
    .neq("status", "archived")
    .order("business_name", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Create Invoice
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Bill a member for dues, and mark it paid once you&apos;ve received
        payment.
      </p>
      <InvoiceForm members={members ?? []} />
    </div>
  );
}
