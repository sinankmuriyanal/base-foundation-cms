import PageHeader from "@/components/PageHeader";
import JoinForms from "@/components/JoinForms";
import { FORMSPREE } from "@/lib/site";

export const metadata = {
  title: "Join us | Base Foundation",
  description: "Volunteer or intern with Base Foundation in rural West Bengal.",
};

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-wide grid lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] gap-14 lg:gap-24">
        <div>
          <PageHeader
            eyebrow="Join with us"
            title="Together, let's make a difference"
            intro="Empowering rural communities through education, upliftment and a diverse range of activities takes many hands. Volunteers and interns are at the heart of every BASE programme."
          />
          <blockquote className="hidden lg:block border-l-4 border-accent pl-6 py-2 max-w-md">
            <p className="font-display text-2xl text-ink leading-snug">
              &ldquo;Dreaming is your responsibility, but helping you realize that dream is ours.&rdquo;
            </p>
          </blockquote>
        </div>
        <div className="rise bg-white/70 rounded-3xl border border-slate-100 p-6 sm:p-10 self-start" style={{ "--d": "240ms" } as React.CSSProperties}>
          <JoinForms endpoint={FORMSPREE.join} />
        </div>
      </div>
    </div>
  );
}
