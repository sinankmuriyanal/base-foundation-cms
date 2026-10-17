import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROGRAMMES, getProgramme } from "@/lib/programmes";
import { SITE } from "@/lib/site";
import { escapeHtml, renderTemplate } from "@/lib/legacy/template";
import { splitHeading } from "@/lib/legacy/partials";
import SiteShell from "@/components/legacy/SiteShell";
import LegacyMain from "@/components/legacy/LegacyMain";

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROGRAMMES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const programme = getProgramme((await params).slug);
  if (!programme) return {};
  return { title: `${programme.title} | Base Foundation`, description: programme.summary };
}

export default async function ProgrammePage({ params }: Props) {
  const programme = getProgramme((await params).slug);
  if (!programme) notFound();

  const url = `${SITE.url}/programmes/${programme.slug}`;
  const body = [
    `<p>${escapeHtml(programme.summary)}</p>`,
    programme.body ? `<p>${escapeHtml(programme.body)}</p>` : "",
    programme.highlights.length ? `<h5 class="storie-details__title">Program Highlights</h5>` : "",
    ...programme.highlights.map(
      (h) => `<h6 class="storie-details__title">${escapeHtml(h.title)}</h6>\n\t\t\t\t\t<p>${escapeHtml(h.body)}</p>`
    ),
    programme.blogCategory
      ? `<p><a class="button button--blue" href="/blog?category=${encodeURIComponent(programme.blogCategory)}">Read field reports</a></p>`
      : "",
  ]
    .filter(Boolean)
    .join("\n\t\t\t\t\t");

  const tags = Array.from(new Set(["Education", programme.area, programme.title.replace(/[^A-Za-z0-9]+/g, "")]))
    .map((t) => `<a class="storie-details__tag" href="/programmes">#${escapeHtml(t)}</a>`)
    .join(" ");

  const html = renderTemplate("programme", {
    banner_title: splitHeading(programme.title),
    image: programme.image,
    title: programme.title,
    body,
    tags,
    share_facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    share_twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(programme.title)}`,
    share_whatsapp: `https://wa.me/?text=${encodeURIComponent(`${programme.title} ${url}`)}`,
  });

  return (
    <SiteShell active="none">
      <LegacyMain html={html} />
    </SiteShell>
  );
}
