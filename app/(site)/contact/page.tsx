import { FORMSPREE } from "@/lib/site";
import { getSingleton } from "@/lib/content/store";
import { renderTemplate } from "@/lib/legacy/template";
import { formAttrs } from "@/lib/legacy/forms";
import { bankLines, phoneLinks } from "@/lib/legacy/content-partials";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

// Renders per request from the tagged data cache (lib/cache.ts), so admin edits appear immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Us | Base Foundation",
  description: "Get in touch with Base Foundation, Bhimpur, Paikar, Birbhum, West Bengal.",
};

export default async function ContactPage() {
  const site = await getSingleton("site");
  return (
    <SiteShell active="contact">
      <LegacyMain
        html={renderTemplate("contact", {
          ...formAttrs(FORMSPREE.contact, site.email, "Message from basefoundation.in"),
          address: site.address,
          email: site.email,
          phones_contact: phoneLinks(site, "icon-item__link", " "),
          bank_contact: bankLines(site),
          map_query: site.address,
        })}
      />
    </SiteShell>
  );
}
