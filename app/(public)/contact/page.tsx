import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import FormspreeForm, { Field, inputClass } from "@/components/FormspreeForm";
import { FORMSPREE, SITE, telHref } from "@/lib/site";

export const metadata = {
  title: "Contact | Base Foundation",
  description: "Get in touch with Base Foundation, Bhimpur, Paikar, Birbhum, West Bengal.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-wide">
        <PageHeader
          eyebrow="Get in touch"
          title="Contact us"
          intro="Want to collaborate, volunteer, or learn more about our programmes? Reach out."
        />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] gap-14 lg:gap-24">
          <div className="bg-white/70 rounded-3xl border border-slate-100 p-6 sm:p-10">
            <FormspreeForm
              endpoint={FORMSPREE.contact}
              submitLabel="Send message"
              successMessage="Your message is on its way. We'll reply by email."
            >
              <input type="hidden" name="_subject" value="New message from basefoundation.in" />
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Name">
                  <input name="name" required autoComplete="name" className={inputClass} placeholder="Your name" />
                </Field>
                <Field label="Email">
                  <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@example.com" />
                </Field>
              </div>
              <Field label="Message">
                <textarea name="message" required rows={6} className={`${inputClass} resize-none`} placeholder="Tell us how you'd like to connect..." />
              </Field>
            </FormspreeForm>
          </div>

          <div className="space-y-10">
            <div>
              <h2 className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent mb-3">
                <Mail size={14} /> Email
              </h2>
              <a href={`mailto:${SITE.email}`} className="font-display text-xl text-ink hover:text-brand transition-colors break-all">
                {SITE.email}
              </a>
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent mb-3">
                <Phone size={14} /> Phone
              </h2>
              <ul className="space-y-1">
                {SITE.phones.map((phone) => (
                  <li key={phone}>
                    <a href={telHref(phone)} className="font-display text-xl text-ink hover:text-brand transition-colors">
                      {phone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent mb-3">
                <MapPin size={14} /> Office
              </h2>
              <address className="not-italic font-display text-xl text-ink leading-snug">
                {SITE.address.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </address>
            </div>
            <div className="bg-brand-50 rounded-2xl p-6 border border-brand/10">
              <h2 className="font-display text-xl text-ink mb-2">Volunteer with us</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Teachers, students and skilled volunteers are always welcome.
              </p>
              <Link href="/join" className="text-sm text-brand font-medium hover:underline">
                Apply to join &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
