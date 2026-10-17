import { PROGRAMMES } from "@/lib/programmes";
import { escapeHtml, renderTemplate } from "@/lib/legacy/template";
import { splitHeading } from "@/lib/legacy/partials";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

export const metadata = {
  title: "Education & Programmes | Base Foundation",
  description: "School visits, Madhyamik Sahayak, Base Classrooms, teacher training and more across rural West Bengal.",
};

export default function ProgrammesPage() {
  // Alternating image/text rows, exactly like the old Education page
  const items = PROGRAMMES.map((p, i) => {
    const img = `
              <div class="${i % 2 ? "col-lg-6 col-xl-5 offset-xl-1" : "col-lg-6 col-xl-5"}">
                <div class="img-box">
                  <div class="img-box__img"><img class="img--bg" src="${p.listImage}" alt="${escapeHtml(p.title)}" loading="lazy"/></div>
                </div>
              </div>`;
    const text = `
              <div class="${i % 2 ? "col-lg-6 col-xl-6" : "col-lg-6 col-xl-6 offset-xl-1"}">
                <div class="heading heading--primary"><span class="heading__pre-title">${String(i + 1).padStart(2, "0")}</span>
                  <h2 class="heading__title">${splitHeading(p.title)}</h2>
                </div>
                <p>${escapeHtml(p.summary)}</p><a class="button stories-item__button button--blue" href="/programmes/${p.slug}">More details</a>
              </div>`;
    return `
        <div class="col-md-10 offset-md-1 col-lg-12 offset-lg-0">
          <div class="stories-item">
            <div class="row align-items-center${i % 2 ? " flex-column-reverse flex-lg-row" : ""}">${i % 2 ? text + img : img + text}
            </div>
          </div>
        </div>`;
  }).join("");

  return (
    <SiteShell active="none">
      <LegacyMain html={renderTemplate("programmes", { items })} />
    </SiteShell>
  );
}
