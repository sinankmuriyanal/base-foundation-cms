import { getSingleton, listCollection } from "@/lib/content/store";
import { escapeHtml, renderTemplate } from "@/lib/legacy/template";
import { paragraphs, phoneLinks } from "@/lib/legacy/content-partials";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

// Renders per request from the tagged data cache (lib/cache.ts), so admin edits appear immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Donate | Base Foundation",
  description: "Support Base Foundation's education and community programmes in rural West Bengal.",
};

function iconItem(icon: string, title: string, body: string) {
  return `
				<div class="col-sm-6 col-lg-3">
					<div class="icon-item">
						<div class="icon-item__img">
							<svg class="icon icon-item__icon"><use xlink:href="#${icon}"></use></svg>
						</div>
						<div class="icon-item__text">
							<h6>${escapeHtml(title)}</h6>
							<p>${body}</p>
						</div>
					</div>
				</div>`;
}

export default async function DonatePage() {
  const [site, pages, projects] = await Promise.all([getSingleton("site"), getSingleton("pages"), listCollection("projects")]);

  const bank = [
    site.bankAccountName && `A/C Name: <a class="icon-item__link">${escapeHtml(site.bankAccountName)}</a>`,
    site.bankAccountNumber && `A/C No: <a class="icon-item__link">${escapeHtml(site.bankAccountNumber)}</a>`,
    site.bankIfsc && `IFSC Code: <a class="icon-item__link">${escapeHtml(site.bankIfsc)}</a>`,
    [site.bankName, site.bankBranch && `${site.bankBranch} branch`].filter(Boolean).map((v) => escapeHtml(String(v))).join(", "),
  ].filter(Boolean);

  const details = [
    bank.length > 1 && iconItem("donation", "Bank Transfer", bank.join("<br>")),
    site.upiId && iconItem("smartphone", "UPI", `<a class="icon-item__link">${escapeHtml(site.upiId)}</a>`),
  ]
    .filter(Boolean)
    .join("");

  return (
    <SiteShell active="none">
      <LegacyMain
        html={renderTemplate("donate", {
          intro: paragraphs(pages.donateIntro),
          details,
          email: site.email,
          phones_contact: phoneLinks(site, "icon-item__link", " "),
          programmes: projects.map((p) => `<a href="/programmes/${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a>`).join(" · "),
        })}
      />
    </SiteShell>
  );
}
