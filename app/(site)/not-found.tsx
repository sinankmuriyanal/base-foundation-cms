import { promoBanner } from "@/lib/legacy/partials";
import SiteShell from "@/components/legacy/SiteShell";

export default function NotFound() {
  const html = `${promoBanner("Page not found", "/legacy/img/faq.jpg")}
  <section class="section">
    <div class="container">
      <div class="row">
        <div class="col-12 text-center">
          <div class="heading heading--primary heading--center"><span class="heading__pre-title">404</span>
            <h2 class="heading__title"><span>This page</span> <span>doesn't exist</span></h2>
          </div>
          <p>It may have moved when the site was updated.</p>
          <a class="button button--blue" href="/">Back to home</a>
        </div>
      </div>
    </div>
  </section>`;

  return (
    <SiteShell active="none">
      <main className="main" dangerouslySetInnerHTML={{ __html: html }} />
    </SiteShell>
  );
}
