"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || open
          ? "bg-cream/95 backdrop-blur-sm border-b border-green/10 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="container-wide flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="w-8 h-8 rounded-sm bg-brand flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 3L4 8v13h5v-7h6v7h5V8L12 3z" fill="white" />
            </svg>
          </span>
          <div className="leading-none">
            <div className="font-display text-base font-semibold text-brand tracking-tight">
              Base Foundation
            </div>
            <div className="text-[10px] text-slate-500 tracking-widest uppercase">
              Empowering Education
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={cn(
                  "text-sm font-medium hover:text-brand transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-[1.5px] after:bg-accent after:transition-all hover:after:w-full",
                  isActive(pathname, link.href) ? "text-brand after:w-full" : "text-slate-700 after:w-0"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/donate"
              className="inline-flex bg-brand text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors"
            >
              Donate
            </Link>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-brand"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-cream border-t border-green/10 px-6 py-4">
          <ul className="space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block text-base font-medium py-1 border-b border-slate-100",
                    isActive(pathname, link.href) ? "text-brand" : "text-slate-700"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/donate"
                className="block text-center bg-brand text-white py-2.5 rounded-full text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                Donate
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
