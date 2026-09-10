"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import crypto from "crypto";
import { cookies } from "next/headers";
import { query, queryOne, execute, transaction } from "@/lib/db/mysql";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signJwt } from "@/lib/auth/jwt";
import { CURRENT_ORG_COOKIE, AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import type { PlanTier } from "@/lib/types/database.types";

export type FormState = { error?: string } | undefined;

const SignupSchema = z.object({
  chamberName: z.string().min(2, "Chamber name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
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

  // Check if user already exists
  const existingUser = await queryOne<{ id: string }>(
    "SELECT id FROM users WHERE email = ?",
    [email.toLowerCase()]
  );

  if (existingUser) {
    return { error: "An account with this email address already exists." };
  }

  const userId = crypto.randomUUID();
  const orgId = crypto.randomUUID();
  const orgMemberId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  const baseSlug = slugify(chamberName) || "chamber";
  let slug = baseSlug;
  for (let attempt = 1; attempt <= 20; attempt++) {
    const existingOrg = await queryOne<{ id: string }>(
      "SELECT id FROM organizations WHERE slug = ?",
      [slug]
    );
    if (!existingOrg) break;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  try {
    await transaction(async (conn) => {
      // 1. Create User
      await conn.execute(
        "INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [userId, email.toLowerCase(), passwordHash, "owner"]
      );

      // 2. Create Organization
      await conn.execute(
        "INSERT INTO organizations (id, name, slug, plan_tier, member_limit) VALUES (?, ?, ?, ?, ?)",
        [orgId, chamberName, slug, planTier, PLAN_MEMBER_LIMITS[planTier]]
      );

      // 3. Create Org Member Owner
      await conn.execute(
        "INSERT INTO org_members (id, org_id, user_id, role) VALUES (?, ?, ?, ?)",
        [orgMemberId, orgId, userId, "owner"]
      );
    });
  } catch (error) {
    console.error("Signup transaction failed:", error);
    return { error: "Could not create your chamber. Please try again." };
  }

  // Issue Session JWT
  const token = signJwt({
    sub: userId,
    email: email.toLowerCase(),
    role: "owner",
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  cookieStore.set(CURRENT_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/dashboard");
}

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
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

  const { email, password } = parsed.data;

  const user = await queryOne<{
    id: string;
    email: string;
    password_hash: string;
    role: string;
  }>("SELECT id, email, password_hash, role FROM users WHERE email = ?", [
    email.toLowerCase(),
  ]);

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    return { error: "Invalid email or password." };
  }

  // Issue Session JWT
  const token = signJwt({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  // Check Staff Membership
  const staffMembership = await queryOne<{ org_id: string }>(
    "SELECT org_id FROM org_members WHERE user_id = ? LIMIT 1",
    [user.id]
  );

  if (staffMembership) {
    cookieStore.set(CURRENT_ORG_COOKIE, staffMembership.org_id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    redirect("/dashboard");
  }

  // Check Member Portal
  const memberRecord = await queryOne<{ id: string }>(
    "SELECT id FROM members WHERE user_id = ? LIMIT 1",
    [user.id]
  );

  if (memberRecord) {
    redirect("/portal");
  }

  return {
    error: "No active organization or member record associated with this account.",
  };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(CURRENT_ORG_COOKIE);
  redirect("/login");
}

const ResetRequestSchema = z.object({
  email: z.string().email("Enter a valid email address."),
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

  // In standard email reset: we can generate a reset token and log or email it via Resend
  return { error: undefined };
}
