import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = process.env.AUTH_COOKIE_NAME || "base_admin_session";

// Optimistic check only: the session itself is verified in app/admin/(protected)/layout.tsx and every API route.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  if (pathname === "/admin/login" || req.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
