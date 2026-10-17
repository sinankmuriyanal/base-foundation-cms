import { renderTemplate } from "@/lib/legacy/template";

export type NavKey = "home" | "blog" | "gallery" | "about" | "contact" | "join" | "none";

const NAV_KEYS: NavKey[] = ["home", "blog", "gallery", "about", "contact", "join"];

/** Original site header + footer around a page body. */
export default function SiteShell({ active, children }: { active: NavKey; children: React.ReactNode }) {
  const navVars = Object.fromEntries(
    NAV_KEYS.map((key) => [`active_${key}`, key === active ? "main-menu__item--active" : ""])
  );
  return (
    <>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: renderTemplate("header", navVars) }} />
      {children}
      <div
        style={{ display: "contents" }}
        dangerouslySetInnerHTML={{ __html: renderTemplate("footer", { year: new Date().getFullYear() }) }}
      />
    </>
  );
}
