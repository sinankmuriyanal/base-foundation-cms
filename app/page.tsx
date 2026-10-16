import Link from "next/link";
import Image from "next/image";
import { getPublishedBlogs } from "@/lib/blogs";
import { formatDate } from "@/lib/utils";
import { ArrowRight, BookOpen, Layers, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PROGRAMMES } from "@/lib/programmes";

export const revalidate = 3600;

export default async function HomePage() {
  const blogs = await getPublishedBlogs();
  const latestBlogs = blogs.slice(0, 3);
  const stats = [
    { value: String(blogs.length || "—"), label: "Field reports published", icon: BookOpen },
    { value: String(PROGRAMMES.length), label: "Programmes running", icon: Layers },
    { value: "Birbhum", label: "Home district, West Bengal", icon: MapPin },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-cream pt-20">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30h60M30 0v60' stroke='%231a6b3c' stroke-width='1'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-20" />

          <div className="container-wide relative z-10">
            <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px w-12 bg-accent" />
                  <span className="text-xs uppercase tracking-[0.2em] text-brand font-medium">
                    Base Foundation · West Bengal
                  </span>
                </div>

                <h1 className="font-display text-5xl sm:text-6xl lg:text-[5.5rem] leading-[0.95] text-ink mb-8">
                  Education is the{" "}
                  <em className="text-brand not-italic relative">
                    foundation
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      height="8"
                      viewBox="0 0 200 8"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 6 Q50 0 100 5 Q150 10 200 4"
                        stroke="#f5a623"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </em>{" "}
                  of every dream.
                </h1>

                <p className="text-lg text-slate-600 max-w-xl leading-relaxed mb-10">
                  Join us in our mission to empower rural communities and create a strong foundation
                  for lasting change through education, upliftment, and a wide range of impactful activities.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 bg-brand text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors"
                  >
                    Read Our Work
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/programmes"
                    className="inline-flex items-center gap-2 border border-brand/30 text-brand px-7 py-3.5 rounded-full text-sm font-medium hover:bg-brand/5 transition-colors"
                  >
                    Our Programmes
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex flex-col gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm w-56">
                    <stat.icon size={20} className="text-accent mb-3" />
                    <div className="font-display text-4xl text-brand">{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:hidden grid grid-cols-3 gap-4 mt-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-2xl sm:text-3xl text-brand">{stat.value}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400">
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-slate-300" />
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          </div>
        </section>

        {/* Mission strip */}
        <section className="bg-brand text-white py-16">
          <div className="container-wide">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl leading-tight mb-4">
                  &ldquo;Dreaming is your responsibility,<br />
                  helping you realize it is ours.&rdquo;
                </h2>
              </div>
              <div>
                <p className="text-white/70 leading-relaxed">
                  Experience the transformative power of community development as we work towards
                  empowering rural lives, building a solid foundation through education, upliftment,
                  and various empowering initiatives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest posts */}
        <section className="py-24 bg-cream">
          <div className="container-wide">
            <div className="flex items-end justify-between mb-14">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-8 bg-accent" />
                  <span className="text-xs uppercase tracking-[0.2em] text-brand">Field Reports</span>
                </div>
                <h2 className="font-display text-4xl text-ink">Latest from the ground</h2>
              </div>
              <Link
                href="/blog"
                className="hidden md:inline-flex items-center gap-2 text-sm text-brand font-medium hover:gap-3 transition-all"
              >
                View all posts <ArrowRight size={16} />
              </Link>
            </div>

            {latestBlogs.length === 0 ? (
              <p className="text-slate-500">No posts yet.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {latestBlogs.map((blog) => (
                  <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block">
                    <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-5">
                      {blog.featuredImage ? (
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
                          width={600}
                          height={450}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-50 flex items-center justify-center">
                          <BookOpen size={32} className="text-brand/30" />
                        </div>
                      )}
                    </div>
                    <div className="inline-block text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
                      {blog.category}
                    </div>
                    <h3 className="font-display text-xl leading-snug text-ink group-hover:text-brand transition-colors mb-2">
                      {blog.title}
                    </h3>
                    {blog.publishedAt && (
                      <p className="text-xs text-slate-400">{formatDate(blog.publishedAt)}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Programmes strip */}
        <section className="bg-brand-50 border-y border-brand/10 py-16">
          <div className="container-wide">
            <div className="flex items-end justify-between gap-6 mb-8">
              <h3 className="font-display text-2xl text-brand">Our programmes</h3>
              <Link href="/programmes" className="inline-flex items-center gap-2 text-sm text-brand font-medium hover:gap-3 transition-all">
                All programmes <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {PROGRAMMES.map((p) => (
                <Link
                  key={p.slug}
                  href={`/programmes/${p.slug}`}
                  className="px-5 py-2 rounded-full bg-white border border-brand/20 text-sm text-brand font-medium hover:bg-brand hover:text-white hover:border-brand transition-all"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
