import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession, SESSION_COOKIE } from "./auth";

/** Returns an error response when the request has no valid admin session, otherwise null. */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const result = await checkAdminSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (result.ok) return null;
  return NextResponse.json(
    { error: result.status === 403 ? "Forbidden" : "Unauthorized" },
    { status: result.status }
  );
}

export async function readJson(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}
