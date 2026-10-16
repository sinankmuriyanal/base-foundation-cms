import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { PROGRAMMES, getProgramme } from "@/lib/programmes";
import { getPublishedBlogs } from "@/lib/blogs";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;
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

  const index = PROGRAMMES.indexOf(programme);
  const next = PROGRAMMES[(index + 1) % PROGRAMMES.length];
  const posts = programme.blogCategory
    ? (await getPublishedBlogs()).filter((b) => b.category === programme.blogCategory).slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-wide">
        <Link href="/programmes" className="rise inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand transition-colors mb-10">
          <ArrowLeft size={16} /> All programmes
        </Link>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-12 lg:gap-20">
          <div>
            <div className="rise flex items-baseline gap-5 mb-6" style={{ "--d": "60ms" } as React.CSSProperties}>
              <span className="font-display text-7xl md:text-8xl leading-none text-accent/80 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-brand">{programme.area}</span>
            </div>
            <h1 className="rise font-display text-4xl md:text-6xl text-ink leading-[1.05] mb-8" style={{ "--d": "120ms" } as React.CSSProperties}>
              {programme.title}
            </h1>
            <p className="rise text-xl text-slate-700 leading-relaxed mb-6 max-w-2xl" style={{ "--d": "180ms" } as React.CSSProperties}>
              {programme.summary}
            </p>
            {programme.body && <p className="text-slate-600 leading-relaxed max-w-2xl">{programme.body}</p>}

            {programme.highlights.length > 0 && (
              <section className="mt-16">
                <h2 className="font-display text-2xl text-ink mb-8">Programme highlights</h2>
                <div className="grid md:grid-cols-3 gap-px bg-ink/10 border border-ink/10 rounded-2xl overflow-hidden">
                  {programme.highlights.map((h, i) => (
                    <div key={h.title} className="bg-white p-7">
                      <span className="block font-display text-sm text-accent mb-4">{String.fromCharCode(97 + i)}.</span>
                      <h3 className="font-display text-xl text-ink mb-3 leading-snug">{h.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{h.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:pt-24 space-y-4">
            <div className="bg-brand text-white rounded-2xl p-7">
              <Heart size={20} className="text-accent mb-4" />
              <p className="font-display text-xl leading-snug mb-2">Support this work</p>
              <p className="text-sm text-white/70 leading-relaxed mb-5">
                Your contribution keeps programmes like this running in rural Bengal.
              </p>
              <Link href="/donate" className="inline-flex items-center gap-2 bg-accent text-ink px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white transition-colors">
                Donate <ArrowRight size={15} />
              </Link>
            </div>
            <Link href="/join" className="block bg-white rounded-2xl border border-slate-100 p-7 hover:border-brand/30 transition group">
              <p className="font-display text-xl text-ink mb-1 group-hover:text-brand transition-colors">Volunteer with us</p>
              <p className="text-sm text-slate-500">Teachers, students and professionals are welcome.</p>
            </Link>
          </aside>
        </div>

        {posts.length > 0 && (
          <section className="mt-24">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-display text-3xl text-ink">From the field</h2>
              <Link
                href={`/blog?category=${encodeURIComponent(programme.blogCategory!)}`}
                className="inline-flex items-center gap-2 text-sm text-brand font-medium hover:gap-3 transition-all"
              >
                All {programme.blogCategory} posts <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <div className="aspect-[4/3] bg-brand-50 rounded-2xl overflow-hidden mb-4">
                    {post.featuredImage && (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        width={600}
                        height={450}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <h3 className="font-display text-lg leading-snug text-ink group-hover:text-brand transition-colors mb-1">{post.title}</h3>
                  {post.publishedAt && <p className="text-xs text-slate-400">{formatDate(post.publishedAt)}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link
          href={`/programmes/${next.slug}`}
          className="mt-24 flex items-center justify-between gap-6 border-t border-ink/15 pt-8 group"
        >
          <span>
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">Next programme</span>
            <span className="font-display text-2xl md:text-3xl text-ink group-hover:text-brand transition-colors">{next.title}</span>
          </span>
          <ArrowRight size={24} className="text-slate-300 group-hover:text-brand group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
