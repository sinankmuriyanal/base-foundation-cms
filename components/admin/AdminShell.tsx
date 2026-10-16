"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, Image as ImageIcon, LayoutDashboard, LogOut, Menu, PenSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/blogs", label: "Blog posts", icon: BookOpen },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ email, children }: { email: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close the mobile drawer on navigation
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <span className="w-8 h-8 rounded-md bg-accent flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
            <path d="M12 3L4 8v13h5v-7h6v7h5V8L12 3z" fill="#124d2b" />
          </svg>
        </span>
        <div className="leading-tight">
          <p className="font-display text-white text-[15px]">Base Foundation</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Content studio</p>
        </div>
      </div>

      <div className="px-3 pt-5">
        <Link
          href="/admin/blogs/new"
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent text-ink py-2.5 text-sm font-medium hover:bg-white transition-colors"
        >
          <PenSquare size={15} /> New post
        </Link>
      </div>

      <nav aria-label="Admin" className="mt-6 px-3 flex-1">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-white/35">Manage</p>
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active ? "bg-white/10 text-white" : "text-white/65 hover:text-white hover:bg-white/5"
                  )}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-accent" aria-hidden />}
                  <Icon size={17} className={active ? "text-accent" : ""} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-3 mt-8 mb-2 text-[10px] uppercase tracking-[0.18em] text-white/35">Website</p>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ExternalLink size={17} /> View live site
        </a>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center text-sm font-medium shrink-0">
            {(email?.[0] ?? "A").toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/45">Signed in as</p>
            <p className="text-sm text-white truncate" title={email ?? undefined}>{email ?? "Admin"}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out"
            title="Log out"
            className="p-2 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f4ee]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-brand-dark">{sidebar}</aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-brand-dark text-white">
        <span className="font-display">Base Foundation</span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="p-2 -mr-2">
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-brand-dark shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-3 p-1.5 text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
