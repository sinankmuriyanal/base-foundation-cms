import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-dark text-white/80 mt-24">
      <div className="container-wide py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-display text-white text-xl mb-3">Base Foundation</h3>
            <p className="text-sm leading-relaxed text-white/60 max-w-xs">
              Empowering marginalized students through education across rural West Bengal.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-accent mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {["/blog", "/gallery", "/about", "/contact"].map((href) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors capitalize">
                    {href.replace("/", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-accent mb-4">Connect</h4>
            <p className="text-sm text-white/60">contact@basefoundation.org</p>
            <p className="text-sm text-white/60 mt-1">West Bengal, India</p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 text-xs text-white/40">
          © {year} Base Foundation. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
