"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import FormspreeForm, { Field, inputClass } from "./FormspreeForm";

const TRACKS = {
  volunteer: {
    label: "Volunteership",
    blurb: "Give time to our classrooms, school visits, training days and community events.",
  },
  internship: {
    label: "Internship",
    blurb: "Students can work alongside our team on fieldwork, documentation, teaching and outreach.",
  },
} as const;

type Track = keyof typeof TRACKS;

export default function JoinForms({ endpoint }: { endpoint: string }) {
  const [track, setTrack] = useState<Track>("volunteer");

  return (
    <div>
      <div role="tablist" aria-label="Choose how to join" className="inline-flex p-1 rounded-full bg-white border border-slate-200 mb-6">
        {(Object.keys(TRACKS) as Track[]).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={track === key}
            onClick={() => setTrack(key)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition",
              track === key ? "bg-brand text-white" : "text-slate-600 hover:text-brand"
            )}
          >
            {TRACKS[key].label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-500 mb-8">{TRACKS[track].blurb}</p>

      <FormspreeForm
        key={track}
        endpoint={endpoint}
        submitLabel={`Apply for ${TRACKS[track].label.toLowerCase()}`}
        successMessage="We've received your application and will get back to you soon."
      >
        <input type="hidden" name="track" value={TRACKS[track].label} />
        <input type="hidden" name="_subject" value={`New ${TRACKS[track].label} application`} />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Full name">
            <input name="name" required autoComplete="name" className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" type="tel" required autoComplete="tel" className={inputClass} />
          </Field>
        </div>
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </Field>
        {track === "volunteer" ? (
          <Field label="How would you like to help?">
            <select name="interest" className={inputClass} defaultValue="Teaching">
              <option>Teaching</option>
              <option>Teacher training</option>
              <option>School visits</option>
              <option>Events &amp; community work</option>
              <option>Media &amp; documentation</option>
              <option>Other</option>
            </select>
          </Field>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="College / institution">
              <input name="institution" required className={inputClass} />
            </Field>
            <Field label="Course & year">
              <input name="course" required className={inputClass} />
            </Field>
          </div>
        )}
        <Field label={track === "volunteer" ? "About you" : "What would you like to work on?"}>
          <textarea name="message" rows={4} className={cn(inputClass, "resize-none")} />
        </Field>
      </FormspreeForm>
    </div>
  );
}
