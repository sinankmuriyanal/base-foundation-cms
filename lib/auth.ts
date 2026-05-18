import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "base_admin_session";

export async function getAdminSession(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}
