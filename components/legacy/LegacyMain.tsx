import { mainInner } from "@/lib/legacy/template";

/** Renders a legacy template page body inside the template's own <main class="main">. */
export default function LegacyMain({ html }: { html: string }) {
  return <main className="main" dangerouslySetInnerHTML={{ __html: mainInner(html) }} />;
}
