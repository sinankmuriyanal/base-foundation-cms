import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getAdminSession())) redirect("/admin/login");
  return <>{children}</>;
}
