import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { DONATION, SITE, telHref } from "@/lib/site";
import { PROGRAMMES } from "@/lib/programmes";

export const metadata = {
  title: "Donate | Base Foundation",
  description: "Support Base Foundation's education and community programmes in rural West Bengal.",
};

export default function DonatePage() {
  const { upiId, bank } = DONATION;
  const hasDetails = !!(upiId || bank);

  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-wide grid lg:grid-cols-2 gap-14 lg:gap-24">
        <div>
          <PageHeader
            eyebrow="Donate"
            title="Support us to change the world"
            intro="Every contribution goes into classrooms, teacher training, exam support and community programmes for rural families in Birbhum and beyond."
          />
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">Your support funds</p>
          <ul className="flex flex-wrap gap-2">
            {PROGRAMMES.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/programmes/${p.slug}`}
                  className="inline-block px-4 py-1.5 rounded-full bg-white border border-brand/15 text-sm text-brand hover:bg-brand hover:text-white transition-colors"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rise self-start bg-brand text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden" style={{ "--d": "240ms" } as React.CSSProperties}>
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border-[28px] border-accent/20" aria-hidden />
          {hasDetails ? (
            <div className="relative space-y-8">
              {upiId && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">UPI</p>
                  <p className="font-display text-3xl break-all">{upiId}</p>
                </div>
              )}
              {bank && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
                  <dt className="text-white/60">Account name</dt><dd>{bank.accountName}</dd>
                  <dt className="text-white/60">Account no.</dt><dd className="font-mono">{bank.accountNumber}</dd>
                  <dt className="text-white/60">IFSC</dt><dd className="font-mono">{bank.ifsc}</dd>
                  <dt className="text-white/60">Bank</dt><dd>{bank.bankName}{bank.branch ? `, ${bank.branch}` : ""}</dd>
                </dl>
              )}
              <p className="text-sm text-white/70">After donating, email us so we can thank you and share a receipt.</p>
            </div>
          ) : (
            <div className="relative">
              <p className="font-display text-3xl leading-snug mb-4">Get in touch to give</p>
              <p className="text-white/70 leading-relaxed mb-8">
                Contact us and our team will share donation details and answer any questions about how your support is used.
              </p>
            </div>
          )}
          <div className="relative mt-8 pt-8 border-t border-white/15 space-y-3 text-sm">
            <a href={`mailto:${SITE.email}?subject=Donation`} className="flex items-center gap-3 hover:text-accent transition-colors">
              <Mail size={16} className="text-accent" /> {SITE.email}
            </a>
            {SITE.phones.map((phone) => (
              <a key={phone} href={telHref(phone)} className="flex items-center gap-3 hover:text-accent transition-colors">
                <Phone size={16} className="text-accent" /> {phone}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
