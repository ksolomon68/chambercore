"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CURRENT_ORG_COOKIE } from "@/lib/auth/session";
import { cookies } from "next/headers";
import type { PlanTier } from "@/lib/types/database.types";

export type FormState = { error?: string } | undefined;

const SignupSchema = z.object({
  chamberName: z.string().min(2, "Chamber name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  planTier: z.enum(["starter", "professional"]).default("starter"),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const PLAN_MEMBER_LIMITS: Record<PlanTier, number | null> = {
  starter: 200,
  professional: 500,
  enterprise: null,
};

export async function signup(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = SignupSchema.safeParse({
    chamberName: formData.get("chamberName"),
    email: formData.get("email"),
    password: formData.get("password"),
    planTier: formData.get("planTier") || "starter",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { chamberName, email, password, planTier } = parsed.data;

  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    return {
      error:
        "Check your email to confirm your account, then sign in to finish setting up your chamber.",
    };
  }

  // Org creation uses the service-role client: at this point the user may not
  // yet have a confirmed session (email confirmation pending), so RLS
  // (which requires auth.uid()) would otherwise block the insert.
  const admin = createAdminClient();

  const baseSlug = slugify(chamberName) || "chamber";
  let slug = baseSlug;
  for (let attempt = 1; attempt <= 20; attempt++) {
    const { data: existing } = await admin
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: chamberName,
      slug,
      plan_tier: planTier,
      member_limit: PLAN_MEMBER_LIMITS[planTier],
    })
    .select()
    .single();

  if (orgError || !org) {
    return { error: "Could not create your chamber. Please try again." };
  }

  const { error: memberError } = await admin.from("org_members").insert({
    org_id: org.id,
    user_id: userId,
    role: "owner",
  });

  if (memberError) {
    return { error: "Could not set up your account. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORG_COOKIE, org.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  if (planTier === "starter" || planTier === "professional") {
    redirect(`/api/stripe/checkout?orgId=${org.id}&tier=${planTier}`);
  }

  redirect("/dashboard");
}

const LoginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function login(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const ResetRequestSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export async function requestPasswordReset(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = ResetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  // Always report success to avoid leaking which emails have accounts.
  return { error: undefined };
}
