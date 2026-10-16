import { Heart, Target, Eye } from "lucide-react";

export const metadata = {
  title: "About | Base Foundation",
  description: "Learn about Base Foundation — who we are, what we do, and why we do it.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Community First",
    body: "Every programme starts with listening — understanding what a village actually needs, not what we assume.",
  },
  {
    icon: Target,
    title: "Systemic Change",
    body: "We don't just distribute aid. We train teachers, map career paths, and build lasting infrastructure.",
  },
  {
    icon: Eye,
    title: "Radical Transparency",
    body: "Our blog documents every school visit, every training session. If we did it, you'll read about it.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-narrow">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-brand">Our Story</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-ink leading-tight mb-6">
            About Base Foundation
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
            Base Foundation is a nonprofit working to close the educational and career opportunity gap
            for marginalized students across rural West Bengal, India. We believe that geography and
            economic circumstance should never determine a student&rsquo;s ceiling.
          </p>
        </div>

        {/* Origin */}
        <div className="bg-white rounded-3xl border border-slate-100 p-10 mb-12">
          <h2 className="font-display text-3xl text-ink mb-5">How it started</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Base Foundation grew out of a simple observation: talented students in Birbhum and
              Murshidabad districts were dropping out of education not because of lack of ability,
              but because of lack of direction — no career guidance, undertrained teachers, and
              zero access to resources that urban students take for granted.
            </p>
            <p>
              Our first initiative was a need assessment in Paikur village, which revealed the
              depth of teacher shortages and the complete absence of career counselling in rural schools.
              That report became our manifesto.
            </p>
            <p>
              Since then, we have launched the Map Bengal project, the TeachCraft training series,
              Base Classrooms, and the Madhyamik Sahayak programme — reaching thousands of students
              across five districts.
            </p>
          </div>
        </div>

        {/* Values */}
        <h2 className="font-display text-3xl text-ink mb-8">What guides us</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-brand-50 rounded-2xl p-8 border border-brand/10">
              <Icon size={24} className="text-brand mb-4" />
              <h3 className="font-display text-xl text-ink mb-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <blockquote className="border-l-4 border-accent pl-8 py-4">
          <p className="font-display text-2xl text-ink leading-snug">
            &ldquo;Dreaming is your responsibility,<br />
            but helping you realize that dream is ours.&rdquo;
          </p>
          <footer className="mt-4 text-sm text-slate-400">— Base Foundation</footer>
        </blockquote>
      </div>
    </div>
  );
}
