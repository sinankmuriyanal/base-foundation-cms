import { renderTemplate } from "@/lib/legacy/template";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

export const metadata = {
  title: "About Us | Base Foundation",
  description: "Base Foundation's mission, vision and team.",
};

export default function AboutPage() {
  return (
    <SiteShell active="about">
      <LegacyMain html={renderTemplate("about")} />
    </SiteShell>
  );
}
