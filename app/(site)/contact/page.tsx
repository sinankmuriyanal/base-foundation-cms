import { FORMSPREE } from "@/lib/site";
import { renderTemplate } from "@/lib/legacy/template";
import { formAttrs } from "@/lib/legacy/forms";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

export const metadata = {
  title: "Contact Us | Base Foundation",
  description: "Get in touch with Base Foundation, Bhimpur, Paikar, Birbhum, West Bengal.",
};

export default function ContactPage() {
  return (
    <SiteShell active="contact">
      <LegacyMain html={renderTemplate("contact", formAttrs(FORMSPREE.contact, "Message from basefoundation.in"))} />
    </SiteShell>
  );
}
