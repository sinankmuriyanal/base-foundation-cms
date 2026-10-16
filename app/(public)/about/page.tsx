import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "About | Base Foundation",
  description: "Base Foundation is an NGO in Birbhum, West Bengal dedicated to rural development through education and social welfare.",
};

const TEAM = [
  { name: "Dr Munkir Hossain", role: "President" },
  { name: "Abdul Nafih Hudawi", role: "Secretary" },
  { name: "Sidheekul Akbar Hudawi", role: "Treasurer" },
];

function initials(name: string) {
  return name
    .replace(/^Dr\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-wide">
        <PageHeader
          eyebrow="About the organization"
          title="About Base Foundation"
          intro="A non-governmental organization dedicated to rural development through education and social welfare, based in the Birbhum district of West Bengal."
        />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 lg:gap-20 mb-24">
          <div className="space-y-5 text-slate-600 leading-relaxed">
            <p>
              Since its establishment, our organization has been committed to empowering rural communities,
              enhancing educational opportunities, and improving the overall well-being of rural residents.
            </p>
            <p>
              We strive to address societal challenges such as poverty, education, healthcare, and environmental
              sustainability. Our team of dedicated professionals and volunteers work to implement innovative and
              sustainable solutions that uplift the lives of marginalized individuals and communities.
            </p>
            <p>
              Through collaborative efforts we aim to create lasting change by providing education, vocational
              training, and skill development programs that empower individuals and enhance their employability.
            </p>
          </div>

          <div className="space-y-px bg-ink/10 border border-ink/10 rounded-3xl overflow-hidden">
            {[
              {
                label: "Our Mission",
                body: "To uplift the rural population of West Bengal by providing quality education, fostering sustainable development, and promoting social welfare initiatives — creating an enabling environment where individuals reach their full potential and contribute to the development of their community.",
              },
              {
                label: "Our Vision",
                body: "A future where every individual in West Bengal has access to quality education, enjoys a high standard of living, and actively participates in community growth — a strong foundation for sustainable rural development.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-white p-8 sm:p-10">
                <p className="text-xs uppercase tracking-[0.2em] text-accent mb-3">{item.label}</p>
                <p className="font-display text-xl sm:text-2xl text-ink leading-snug">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="mb-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-brand">Team</span>
          </div>
          <h2 className="font-display text-4xl text-ink mb-10">Meet our team</h2>
          <ul className="grid sm:grid-cols-3 gap-6">
            {TEAM.map((m) => (
              <li key={m.name} className="bg-white rounded-2xl border border-slate-100 p-8">
                <div className="w-16 h-16 rounded-full bg-brand text-cream font-display text-xl flex items-center justify-center mb-6">
                  {initials(m.name)}
                </div>
                <p className="font-display text-xl text-ink">{m.name}</p>
                <p className="text-sm text-accent font-medium mt-1">{m.role}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-brand rounded-3xl p-10 text-white">
          <p className="font-display text-2xl sm:text-3xl leading-snug max-w-xl">
            &ldquo;Dreaming is your responsibility, but helping you realize that dream is ours.&rdquo;
          </p>
          <Link href="/join" className="shrink-0 inline-flex items-center gap-2 bg-accent text-ink px-6 py-3 rounded-full text-sm font-medium hover:bg-white transition-colors">
            Become our volunteer <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
