import { escapeHtml } from "./template";

/**
 * Attributes for a legacy-template form. Posts to Formspree when an endpoint is configured;
 * otherwise falls back to opening the visitor's email client.
 */
export function formAttrs(endpoint: string, email: string, subject: string): { form_attrs: string; form_note: string } {
  if (endpoint) {
    return {
      form_attrs: `action="${escapeHtml(endpoint)}" method="POST"`,
      form_note: "* The following info is required",
    };
  }
  return {
    form_attrs: `action="mailto:${escapeHtml(email)}?subject=${encodeURIComponent(subject)}" method="POST" enctype="text/plain"`,
    form_note: `This opens your email app. You can also write to ${email}.`,
  };
}
