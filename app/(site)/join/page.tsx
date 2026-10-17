import { FORMSPREE } from "@/lib/site";
import { renderTemplate } from "@/lib/legacy/template";
import { formAttrs } from "@/lib/legacy/forms";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

export const metadata = {
  title: "Join with us | Base Foundation",
  description: "Volunteer or intern with Base Foundation in rural West Bengal.",
};

export default function JoinPage() {
  return (
    <SiteShell active="join">
      <LegacyMain html={renderTemplate("join", formAttrs(FORMSPREE.join, "Application from basefoundation.in"))} />
    </SiteShell>
  );
}
