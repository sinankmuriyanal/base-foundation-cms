import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { checkAdminSession, SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth";
import { readJson } from "@/lib/admin-api";

const RECENT_SIGN_IN_SECONDS = 5 * 60;

// POST /api/auth — exchange a fresh Firebase ID token for a session cookie (admins only)
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const idToken = typeof body?.idToken === "string" ? body.idToken : "";
  if (!idToken) return NextResponse.json({ error: "idToken required" }, { status: 400 });

  const auth = getAdminAuth();
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (decoded.admin !== true) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (Date.now() / 1000 - decoded.auth_time > RECENT_SIGN_IN_SECONDS)
    return NextResponse.json({ error: "Sign in again" }, { status: 401 });

  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE_MS / 1000,
    path: "/",
  });
  return res;
}

// DELETE /api/auth — logout: revoke all sessions for the user and clear the cookie
export async function DELETE(req: NextRequest) {
  const session = await checkAdminSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session.ok) await getAdminAuth().revokeRefreshTokens(session.uid);

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
