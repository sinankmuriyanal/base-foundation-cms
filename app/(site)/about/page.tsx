import { getSingleton, listCollection } from "@/lib/content/store";
import { renderTemplate } from "@/lib/legacy/template";
import { paragraphs, teamItems } from "@/lib/legacy/content-partials";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

// Renders per request from the tagged data cache (lib/cache.ts), so admin edits appear immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us | Base Foundation",
  description: "Base Foundation's mission, vision and team.",
};

export default async function AboutPage() {
  const [pages, team] = await Promise.all([getSingleton("pages"), listCollection("team")]);
  return (
    <SiteShell active="about">
      <LegacyMain
        html={renderTemplate("about", {
          mission: paragraphs(pages.mission),
          vision: paragraphs(pages.vision),
          team: teamItems(team),
        })}
      />
    </SiteShell>
  );
}
