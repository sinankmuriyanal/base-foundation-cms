import type { Blog } from "@/lib/types";
import { cld, escapeHtml, textExcerpt } from "./template";

// Markup copied from the original template so CMS data renders exactly like the old site.

export function blogExcerpt(blog: Blog): string {
  return blog.excerpt || textExcerpt(blog.content);
}

export function blogCard(blog: Blog, colClass = "col-md-6 col-lg-4"): string {
  const href = `/blog/${encodeURIComponent(blog.slug)}`;
  const img = blog.featuredImage
    ? `<img class="img--bg" src="${escapeHtml(cld(blog.featuredImage, 900))}" alt="${escapeHtml(blog.title)}" loading="lazy" />`
    : "";
  return `
        <div class="${colClass}">
          <div class="blog-item blog-item--style-1">
            <div class="blog-item__img">
              ${img}
              <span class="blog-item__badge">${escapeHtml(blog.category)}</span>
            </div>
            <div class="blog-item__content">
              <h6 class="blog-item__title"><a href="${href}">${escapeHtml(blog.title)}</a></h6>
              <p>${escapeHtml(blogExcerpt(blog))}</p>
            </div>
          </div>
        </div>`;
}

/** The template styles headings as "<span>First</span> <span>rest…</span>". */
export function splitHeading(title: string): string {
  const [first, ...rest] = title.split(" ");
  return `<span>${escapeHtml(first)}</span> <span>${escapeHtml(rest.join(" "))}</span>`;
}

export function emptyNotice(text: string): string {
  return `<div class="col-12 text-center"><p>${escapeHtml(text)}</p></div>`;
}

/** Promo banner used at the top of every inner page of the old site. */
export function promoBanner(title: string, image: string): string {
  return `
  <section class="promo-primary">
    <picture>
      <source srcset="${image}" media="(min-width: 992px)" /><img class="img--bg" src="${image}" alt="" />
    </picture>
    <div class="promo-primary__description"><span></span></div>
    <div class="container">
      <div class="row">
        <div class="col-auto">
          <div class="align-container">
            <div class="align-container__item">
              <span class="promo-primary__pre-title"></span>
              <h1 class="promo-primary__title"><span>${escapeHtml(title)}</span></h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}
