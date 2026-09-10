import { NextResponse, type NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

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

export async function proxy(request: NextRequest) {
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (!isProtected) {
    return NextResponse.next({ request });
  }

  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = sessionCookie ? verifyJwt(sessionCookie) : null;

  if (!user || !user.sub) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
