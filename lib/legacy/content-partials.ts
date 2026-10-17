import type { HeroSlide, Program, Project, SiteSettings, TeamMember } from "@/lib/content/types";
import { cld, escapeHtml as e } from "./template";

// Markup for admin-managed content, copied from the original template so it renders identically.

/** Cloudinary images get a size cap; original-site paths are served as-is. */
export function img(url: string, width: number): string {
  return e(url.startsWith("https://res.cloudinary.com/") ? cld(url, width) : url);
}

export function paragraphs(text: string, attrs = ""): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p${attrs}>${e(p).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export function telHref(phone: string): string {
  return `tel:+${phone.replace(/\D/g, "")}`;
}

export function phoneLinks(site: SiteSettings, linkClass: string, separator = ""): string {
  return [site.phone1, site.phone2]
    .filter(Boolean)
    .map((p) => `<a${linkClass ? ` class="${linkClass}"` : ""} href="${telHref(p)}">${e(p)}</a>`)
    .join(separator);
}

const SOCIALS = [
  ["instagram", "fa-instagram"],
  ["twitter", "fa-twitter"],
  ["facebook", "fa-facebook"],
  ["youtube", "fa-youtube-play"],
] as const;

/** Only configured networks are shown (the old site's icons all pointed to "#"). */
export function socialItems(site: SiteSettings, itemClass: string, linkClass: string): string {
  return SOCIALS.filter(([key]) => site[key])
    .map(
      ([key, icon]) =>
        `<li class="${itemClass}"><a class="${linkClass}" href="${e(site[key])}" target="_blank" rel="noopener" aria-label="${key}"><i class="fa ${icon}" aria-hidden="true"></i></a></li>`
    )
    .join("");
}

export function heroSlides(slides: HeroSlide[]): string {
  return slides
    .map((s) => {
      const center = s.layout === "center";
      const title = s.titleLine2
        ? `<span>${e(s.titleLine1)} </span>${s.titleBreak ? "<br />" : ""}<span>${e(s.titleLine2)}</span>`
        : `<span>${e(s.titleLine1)}</span>`;
      const button = s.buttonLabel
        ? `<div class="promo-slider__wrapper-3"><a class="button promo-slider__button button--primary" href="${e(s.buttonLink || "#about")}">${e(s.buttonLabel)}</a></div>`
        : "";
      return `
      <div class="promo-slider__item ${center ? "promo-slider__item--style-3" : "promo-slider__item--style-2"}" style="background-color: rgba(0, 0, 0, ${center ? "0.4" : "0.3"});">
        <picture>
          <source srcset="${img(s.image, 1920)}" media="(min-width: 992px)" />
          <img class="img--bg" src="${img(s.image, 1000)}" alt="" />
        </picture>
        <div class="container">
          <div class="row">
            <div class="${center ? "col-lg-10 offset-lg-1 col-xl-8 offset-xl-2" : "col-lg-8 col-xl-7"}">
              <div class="align-container">
                <div class="align-container__item">
                  <div class="promo-slider__wrapper-1"><h2 class="promo-slider__title">${title}</h2></div>
                  ${s.subtitle ? `<div class="promo-slider__wrapper-2"><p class="promo-slider__subtitle" style="font-size: 18px">${e(s.subtitle)}</p></div>` : ""}
                  ${button}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

export function projectSlides(projects: Project[]): string {
  return projects
    .map(
      (p, i) => `
            <div class="stories-slider__item">
              <div class="stories-item">
                <div class="row align-items-center">
                  <div class="col-lg-6 col-xl-5">
                    <div class="img-box">
                      <div class="img-box__img"><img class="img--bg" src="${img(p.image, 900)}" alt="${e(p.title)}" /></div>
                    </div>
                  </div>
                  <div class="col-lg-6 col-xl-6 offset-xl-1">
                    <div class="heading heading--primary">
                      <span class="heading__pre-title">${String(i + 1).padStart(2, "0")}</span>
                      <h2 class="heading__title"><span>${e(p.title)}</span> <span></span></h2>
                    </div>
                    <p>${e(p.summary)}</p>
                    <a class="button stories-item__button button--blue" href="/programmes/${encodeURIComponent(p.slug)}">More details</a>
                  </div>
                </div>
              </div>
            </div>`
    )
    .join("");
}

const SLIDER_NAV = `
                          <div class="slider__nav items-slider__nav">
                            <div class="slider__arrows">
                              <div class="slider__prev"><i class="fa fa-chevron-left" aria-hidden="true"></i></div>
                              <div class="slider__next"><i class="fa fa-chevron-right" aria-hidden="true"></i></div>
                            </div>
                          </div>`;

export function programSlides(programs: Program[]): string {
  return programs
    .map((p) => {
      const title = p.link ? `<a href="${e(p.link)}">${e(p.title)}</a>` : e(p.title);
      return `
              <div class="items-slider__item">
                <div class="causes-item causes-item--style-3 causes-item--slider no-padding">
                  <div class="causes-item__body">
                    <div class="row align-items-center">
                      <div class="col-xl-8">
                        <div class="causes-item__img">
                          <img class="img--bg" src="${img(p.image, 1200)}" alt="${e(p.title)}" />${SLIDER_NAV}
                        </div>
                      </div>
                      <div class="col-xl-4">
                        <div class="causes-item__wrapper">
                          ${p.label ? `<div class="causes-item__action"><div class="causes-item__badge">${e(p.label)}</div></div>` : ""}
                          <div class="causes-item__top">
                            <h6 class="causes-item__title">${title}</h6>
                            <p>${e(p.text)}</p>
                          </div>
                          <div class="causes-item__lower"></div>
                          <a class="causes-item__button button button--primary" href="/donate">+ Donate</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;
    })
    .join("");
}

export function teamItems(team: TeamMember[]): string {
  return team
    .map(
      (m) => `
				<div class="col-sm-6 col-lg-4 col-xl-3">
					<div class="team-item team-item--rounded">
						<div class="team-item__img-holder">
							<div class="team-item__img"><img class="img--bg" src="${img(m.photo, 500)}" alt="${e(m.name)}"/></div>
						</div>
						<div class="team-item__description">
							<div class="team-item__name">${e(m.name)}</div>
							<div class="team-item__position">${e(m.role)}</div>
						</div>
					</div>
				</div>`
    )
    .join("");
}

/** Bank lines in the original contact page style. */
export function bankLines(site: SiteSettings): string {
  const lines = [
    site.bankAccountName && `A/C Name :- <a class="icon-item__link">${e(site.bankAccountName)}</a>`,
    site.bankAccountNumber && `A/C No :- <a class="icon-item__link">${e(site.bankAccountNumber)}</a>`,
    site.bankIfsc && `IFSC Code - <a class="icon-item__link">${e(site.bankIfsc)}</a>`,
    site.bankBranch && `Branch Name - <a class="icon-item__link">${e(site.bankBranch)}</a>`,
    site.upiId && `UPI - <a class="icon-item__link">${e(site.upiId)}</a>`,
  ].filter(Boolean);
  return lines.length ? `<p>${lines.join("<br>")}</p>` : `<p>Contact us for donation details.</p>`;
}
