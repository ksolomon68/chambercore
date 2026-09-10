import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/members",
  "/directory",
  "/settings",
  "/portal",
  "/dues",
  "/events",
  "/marketplace",
  "/documents",
  "/meetings",
  "/board",
  "/voting",
  "/committees",
  "/analytics",
  "/advocacy",
];

// Refreshes the Supabase session on every request and redirects unauthenticated
// users away from (app) routes. This is a UX convenience, not the security
// boundary — RLS (supabase/migrations/0006_rls_policies.sql) is the real
// tenant-isolation guarantee, and every Server Action/route handler re-checks
// auth itself since Proxy coverage can silently drop on refactors.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (!isProtected) {
    return response;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    console.error("Proxy auth error:", error);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
