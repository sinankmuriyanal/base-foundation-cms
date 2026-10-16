import { cookies } from "next/headers";
import { getAdminAuth } from "./firebase-admin";

export const SESSION_COOKIE = process.env.AUTH_COOKIE_NAME || "base_admin_session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export type SessionCheck = { ok: true; uid: string } | { ok: false; status: 401 | 403 };

export async function checkAdminSession(sessionCookie: string | undefined): Promise<SessionCheck> {
  if (!sessionCookie) return { ok: false, status: 401 };

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    if (decoded.admin !== true) return { ok: false, status: 403 };
    return { ok: true, uid: decoded.uid };
  } catch {
    return { ok: false, status: 401 };
  }
}

export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const result = await checkAdminSession(cookieStore.get(SESSION_COOKIE)?.value);
  return result.ok ? result.uid : null;
}
