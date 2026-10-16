"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SITE } from "@/lib/site";

export const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition";

interface Props {
  endpoint: string;
  submitLabel: string;
  successMessage: string;
  children: React.ReactNode;
}

type Status = "idle" | "sending" | "sent" | "error";

export default function FormspreeForm({ endpoint, submitLabel, successMessage, children }: Props) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (!endpoint) {
    return (
      <div className="rounded-2xl border border-brand/15 bg-brand-50 p-6 text-sm text-slate-600 leading-relaxed">
        Online forms are being set up. Until then, write to us at{" "}
        <a href={`mailto:${SITE.email}`} className="text-brand font-medium hover:underline">
          {SITE.email}
        </a>
        .
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-brand/15 bg-brand-50 p-8 text-center">
        <CheckCircle2 size={28} className="text-brand mx-auto mb-3" />
        <p className="font-display text-xl text-ink mb-1">Thank you</p>
        <p className="text-sm text-slate-600">{successMessage}</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-5 text-sm text-brand hover:underline">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {children}
      {/* Honeypot for bots; Formspree drops submissions that fill it */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {status === "error" && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
          Something went wrong. Please try again, or email {SITE.email}.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white py-3.5 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {status === "sending" && <Loader2 size={16} className="animate-spin" />}
        {status === "sending" ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
