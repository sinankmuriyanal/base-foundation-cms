import Link from "next/link";
import { NAV_LINKS, SITE, telHref } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-dark text-white/80 mt-24">
      <div className="container-wide py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] gap-10">
          <div>
            <h3 className="font-display text-white text-xl mb-3">{SITE.name}</h3>
            <p className="text-sm leading-relaxed text-white/60 max-w-xs">{SITE.tagline}.</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-accent mb-4">Menu</h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.filter((l) => l.href !== "/").map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-sm text-white/60 space-y-1">
            <h4 className="text-xs uppercase tracking-widest text-accent mb-4">Contact</h4>
            <a href={`mailto:${SITE.email}`} className="block hover:text-white transition-colors break-all">{SITE.email}</a>
            {SITE.phones.map((phone) => (
              <a key={phone} href={telHref(phone)} className="block hover:text-white transition-colors">{phone}</a>
            ))}
            <address className="not-italic pt-2">
              {SITE.address.map((line) => <span key={line} className="block">{line}</span>)}
            </address>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-accent mb-4">Support</h4>
            <Link href="/donate" className="inline-block bg-accent text-ink px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white transition-colors">
              Donate
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 text-xs text-white/40">
          © {year} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
