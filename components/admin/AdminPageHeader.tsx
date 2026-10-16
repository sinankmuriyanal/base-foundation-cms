import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}

export default function AdminPageHeader({ title, description, back, actions }: Props) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand mb-3 transition-colors">
          <ChevronLeft size={16} /> {back.label}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink leading-tight">{title}</h1>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
