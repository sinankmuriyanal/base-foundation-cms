interface Props {
  eyebrow: string;
  title: string;
  intro?: string;
}

export default function PageHeader({ eyebrow, title, intro }: Props) {
  return (
    <div className="mb-14">
      <div className="rise flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-accent" />
        <span className="text-xs uppercase tracking-[0.2em] text-brand">{eyebrow}</span>
      </div>
      <h1 className="rise font-display text-5xl md:text-6xl text-ink leading-[1.05] mb-5" style={{ "--d": "80ms" } as React.CSSProperties}>
        {title}
      </h1>
      {intro && (
        <p className="rise text-lg text-slate-600 leading-relaxed max-w-2xl" style={{ "--d": "160ms" } as React.CSSProperties}>
          {intro}
        </p>
      )}
    </div>
  );
}
