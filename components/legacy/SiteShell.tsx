import { getSingleton } from "@/lib/content/store";
import { renderTemplate } from "@/lib/legacy/template";
import { phoneLinks, socialItems } from "@/lib/legacy/content-partials";

export type NavKey = "home" | "blog" | "gallery" | "about" | "contact" | "join" | "none";

const NAV_KEYS: NavKey[] = ["home", "blog", "gallery", "about", "contact", "join"];

/** Original site header + footer around a page body, filled from the admin Site details. */
export default async function SiteShell({ active, children }: { active: NavKey; children: React.ReactNode }) {
  const site = await getSingleton("site");
  const navVars = Object.fromEntries(
    NAV_KEYS.map((key) => [`active_${key}`, key === active ? "main-menu__item--active" : ""])
  );

  const header = renderTemplate("header", {
    ...navVars,
    email: site.email,
    phones_aside: phoneLinks(site, "aside-inner__link"),
    socials_aside: socialItems(site, "aside-socials__item", "aside-socials__link"),
  });
  const footer = renderTemplate("footer", {
    year: new Date().getFullYear(),
    email: site.email,
    address: site.address,
    phones_footer: phoneLinks(site, "", "<br />\n            "),
    socials_footer: socialItems(site, "footer-socials__item", "footer-socials__link"),
  });

  return (
    <>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: header }} />
      {children}
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: footer }} />
    </>
  );
}
