export const metadata = {
  title: "Contact | Base Foundation",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-narrow">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-brand">Get In Touch</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-4">Contact Us</h1>
          <p className="text-slate-500 max-w-lg">
            Want to collaborate, volunteer, or learn more about our programmes? Reach out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <form
            action="https://formspree.io/f/placeholder"
            method="POST"
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition resize-none"
                placeholder="Tell us how you'd like to connect..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand text-white py-3.5 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors"
            >
              Send Message
            </button>
            <p className="text-xs text-slate-400 text-center">
              Replace the Formspree action URL with your own endpoint.
            </p>
          </form>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-xl text-ink mb-2">Email</h3>
              <a
                href="mailto:contact@basefoundation.org"
                className="text-brand hover:underline"
              >
                contact@basefoundation.org
              </a>
            </div>
            <div>
              <h3 className="font-display text-xl text-ink mb-2">Location</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Operating across Birbhum, Murshidabad, Malda, Nadia,<br />
                and North Dinajpur districts, West Bengal, India.
              </p>
            </div>
            <div className="bg-brand-50 rounded-2xl p-6 border border-brand/10">
              <h3 className="font-display text-xl text-ink mb-2">Volunteer with us</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We're always looking for teachers, career counsellors, and skilled volunteers.
                Send us a message describing your background and how you'd like to help.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
