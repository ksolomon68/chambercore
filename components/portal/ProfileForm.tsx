"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateMyProfile, updateMyListing, type FormState } from "@/app/actions/portal";

export function ProfileForm({
  contactName,
  email,
  phone,
  description,
  websiteUrl,
  address,
}: {
  contactName: string | null;
  email: string | null;
  phone: string | null;
  description: string;
  websiteUrl: string;
  address: string;
}) {
  const [profileState, profileAction, profilePending] = useActionState<
    FormState,
    FormData
  >(updateMyProfile, undefined);
  const [listingState, listingAction, listingPending] = useActionState<
    FormState,
    FormData
  >(updateMyListing, undefined);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-off-white">
          Contact Info
        </h2>
        <form action={profileAction} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">
              Contact Name
            </label>
            <input
              name="contactName"
              defaultValue={contactName ?? ""}
              className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={email ?? ""}
                className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">
                Phone
              </label>
              <input
                name="phone"
                defaultValue={phone ?? ""}
                className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
              />
            </div>
          </div>
          {profileState?.error && (
            <p className="text-sm text-red-400">{profileState.error}</p>
          )}
          {profileState?.success && (
            <p className="text-sm text-green">Saved.</p>
          )}
          <Button type="submit" disabled={profilePending} className="w-fit">
            {profilePending ? "Saving..." : "Save Contact Info"}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-off-white">
          Directory Listing
        </h2>
        <form action={listingAction} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={description}
              className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">
                Website
              </label>
              <input
                name="websiteUrl"
                defaultValue={websiteUrl}
                className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">
                Address
              </label>
              <input
                name="address"
                defaultValue={address}
                className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
              />
            </div>
          </div>
          {listingState?.error && (
            <p className="text-sm text-red-400">{listingState.error}</p>
          )}
          {listingState?.success && (
            <p className="text-sm text-green">Saved.</p>
          )}
          <Button type="submit" disabled={listingPending} className="w-fit">
            {listingPending ? "Saving..." : "Save Listing"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
