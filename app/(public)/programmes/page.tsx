import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { PROGRAMMES } from "@/lib/programmes";

export const metadata = {
  title: "Programmes | Base Foundation",
  description: "Classrooms, school visits, Madhyamik support, teacher training and more across rural West Bengal.",
};

export default function ProgrammesPage() {
  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-wide">
        <PageHeader
          eyebrow="What we do"
          title="Our programmes"
          intro="Education, upliftment and a range of community activities, building a strong foundation for lasting change in rural Bengal."
        />

        <ol className="border-t border-ink/15">
          {PROGRAMMES.map((p, i) => (
            <li key={p.slug} className="rise" style={{ "--d": `${200 + i * 60}ms` } as React.CSSProperties}>
              <Link
                href={`/programmes/${p.slug}`}
                className="group grid grid-cols-[3.5rem_1fr_auto] md:grid-cols-[6rem_minmax(0,24rem)_minmax(0,1fr)_auto] gap-x-6 gap-y-2 items-baseline py-8 border-b border-ink/15 hover:bg-white/60 transition-colors px-2 -mx-2 rounded-sm"
              >
                <span className="font-display text-3xl md:text-5xl text-brand/25 group-hover:text-accent transition-colors tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-[11px] uppercase tracking-[0.2em] text-accent font-medium mb-1">{p.area}</span>
                  <span className="font-display text-2xl md:text-3xl text-ink leading-tight group-hover:text-brand transition-colors">
                    {p.title}
                  </span>
                </span>
                <span className="col-start-2 col-span-2 md:col-start-3 md:col-span-1 md:row-start-1 text-sm text-slate-600 leading-relaxed md:line-clamp-2">
                  {p.summary}
                </span>
                <ArrowUpRight
                  size={22}
                  className="row-start-1 col-start-3 md:col-start-4 text-slate-300 group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
