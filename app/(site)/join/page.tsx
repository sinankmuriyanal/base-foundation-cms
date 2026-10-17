import { FORMSPREE } from "@/lib/site";
import { getSingleton } from "@/lib/content/store";
import { renderTemplate } from "@/lib/legacy/template";
import { formAttrs } from "@/lib/legacy/forms";
import { paragraphs } from "@/lib/legacy/content-partials";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

// Renders per request from the tagged data cache (lib/cache.ts), so admin edits appear immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Join with us | Base Foundation",
  description: "Volunteer or intern with Base Foundation in rural West Bengal.",
};

export default async function JoinPage() {
  const [site, pages] = await Promise.all([getSingleton("site"), getSingleton("pages")]);
  return (
    <SiteShell active="join">
      <LegacyMain
        html={renderTemplate("join", {
          ...formAttrs(FORMSPREE.join, site.email, "Application from basefoundation.in"),
          intro: paragraphs(pages.joinIntro),
        })}
      />
    </SiteShell>
  );
}
