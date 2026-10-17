import { listCollection } from "@/lib/content/store";
import { escapeHtml, renderTemplate } from "@/lib/legacy/template";
import { emptyNotice, splitHeading } from "@/lib/legacy/partials";
import { img } from "@/lib/legacy/content-partials";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

// Renders per request from the tagged data cache (lib/cache.ts), so admin edits appear immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Education & Programmes | Base Foundation",
  description: "School visits, Madhyamik Sahayak, Base Classrooms, teacher training and more across rural West Bengal.",
};

export default async function ProgrammesPage() {
  const projects = await listCollection("projects");

  // Alternating image/text rows, exactly like the old Education page
  const items = projects.length
    ? projects
        .map((p, i) => {
          const image = `
              <div class="${i % 2 ? "col-lg-6 col-xl-5 offset-xl-1" : "col-lg-6 col-xl-5"}">
                <div class="img-box">
                  <div class="img-box__img"><img class="img--bg" src="${img(p.listImage || p.image, 900)}" alt="${escapeHtml(p.title)}" loading="lazy"/></div>
                </div>
              </div>`;
          const text = `
              <div class="${i % 2 ? "col-lg-6 col-xl-6" : "col-lg-6 col-xl-6 offset-xl-1"}">
                <div class="heading heading--primary"><span class="heading__pre-title">${String(i + 1).padStart(2, "0")}</span>
                  <h2 class="heading__title">${splitHeading(p.title)}</h2>
                </div>
                <p>${escapeHtml(p.summary)}</p><a class="button stories-item__button button--blue" href="/programmes/${encodeURIComponent(p.slug)}">More details</a>
              </div>`;
          return `
        <div class="col-md-10 offset-md-1 col-lg-12 offset-lg-0">
          <div class="stories-item">
            <div class="row align-items-center${i % 2 ? " flex-column-reverse flex-lg-row" : ""}">${i % 2 ? text + image : image + text}
            </div>
          </div>
        </div>`;
        })
        .join("")
    : emptyNotice("Programmes coming soon.");

  return (
    <SiteShell active="none">
      <LegacyMain html={renderTemplate("programmes", { items })} />
    </SiteShell>
  );
}
