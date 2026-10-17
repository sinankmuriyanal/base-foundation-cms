import { notFound } from "next/navigation";

// Routes unmatched URLs into the (site) group so they get the template 404 instead of Next's default.
export default function MissingPage() {
  notFound();
}
