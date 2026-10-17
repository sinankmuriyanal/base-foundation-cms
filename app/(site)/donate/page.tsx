import { DONATION } from "@/lib/site";
import { PROGRAMMES } from "@/lib/programmes";
import { escapeHtml, renderTemplate } from "@/lib/legacy/template";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

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

export default function DonatePage() {
  const { bank, upiId } = DONATION;
  const details = [
    bank &&
      iconItem(
        "donation",
        "Bank Transfer",
        [
          bank.accountName && `A/C Name: <a class="icon-item__link">${escapeHtml(bank.accountName)}</a>`,
          `A/C No: <a class="icon-item__link">${escapeHtml(bank.accountNumber)}</a>`,
          `IFSC Code: <a class="icon-item__link">${escapeHtml(bank.ifsc)}</a>`,
          `${escapeHtml(bank.bankName)}${bank.branch ? `, ${escapeHtml(bank.branch)} branch` : ""}`,
        ]
          .filter(Boolean)
          .join("<br>")
      ),
    upiId && iconItem("smartphone", "UPI", `<a class="icon-item__link">${escapeHtml(upiId)}</a>`),
  ]
    .filter(Boolean)
    .join("");

  const programmes = PROGRAMMES.map((p) => `<a href="/programmes/${p.slug}">${escapeHtml(p.title)}</a>`).join(" · ");

  return (
    <SiteShell active="none">
      <LegacyMain html={renderTemplate("donate", { details, programmes })} />
    </SiteShell>
  );
}
