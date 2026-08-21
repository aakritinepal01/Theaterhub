"use client";

import { useState } from "react";
import Link from "next/link";

const CONTACT_REASONS = [
  {
    emoji: "🎬",
    title: "List a production",
    detail: "Get your play, musical, or dance show listed on TheatreHub with description, schedule, venue, and ticketing info.",
    href: "/signup/",
    cta: "Create a profile",
    tag: "Producers & Directors",
  },
  {
    emoji: "🏛️",
    title: "Register a venue",
    detail: "Theatre owners and hall managers can showcase their venue, publish stage details, and link upcoming performances.",
    href: "/signup/",
    cta: "Register your venue",
    tag: "Venue Managers",
  },
  {
    emoji: "📰",
    title: "Submit a story",
    detail: "Writers, critics, and theatre scholars can pitch articles, director interviews, and reviews for our blog.",
    href: "mailto:stories@theatrehub.org",
    cta: "Email the editors",
    tag: "Writers & Critics",
  },
  {
    emoji: "🤝",
    title: "Partner with us",
    detail: "Festival organizers, cultural organizations, and sponsors — let's collaborate to build Nepal's theatre ecosystem.",
    href: "mailto:partners@theatrehub.org",
    cta: "Start a conversation",
    tag: "Organizers & Brands",
  },
];

const FAQS = [
  {
    q: "Is TheatreHub free to use for audiences and theatre teams?",
    a: "Yes! TheatreHub is completely free for audiences to discover plays, browse venues, and check schedules. Theatre collectives and venues also receive a free account tier to list productions.",
  },
  {
    q: "How quickly will my show be published after submission?",
    a: "Once you submit your play or show schedule through your dashboard, our editorial team reviews the details and publishes it within 24 hours (or faster for opening-night emergencies!).",
  },
  {
    q: "Can I edit show schedules or ticket prices later?",
    a: "Yes. Logged-in admins and verified venue managers can modify show dates, add matinee times, adjust pricing, or mark performances as Sold Out directly in real time.",
  },
  {
    q: "Do you support productions and venues outside Kathmandu?",
    a: "Absolutely! We actively champion theatre communities across all provinces of Nepal — Pokhara, Biratnagar, Dharan, Nepalgunj, Janakpur, and beyond.",
  },
  {
    q: "How can I report a bug or request a new feature?",
    a: "Select 'Report a bug' or 'General enquiry' in the contact form below, or reach out directly to hello@theatrehub.org. We welcome all feedback from the community!",
  },
];

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First FAQ open by default for rich visual layout

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const r = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (r.ok) {
        setStatus("done");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-orb contact-hero-orb-1" aria-hidden="true" />
        <div className="contact-hero-orb contact-hero-orb-2" aria-hidden="true" />

        <div className="site-container contact-hero-inner">
          <div className="contact-hero-badge">
            <span className="contact-badge-pulse" />
            <span>We respond in ≤ 24 hours</span>
          </div>

          <h1>Let&apos;s talk about the stage.</h1>

          <p className="contact-hero-lead">
            Whether you are announcing a new play, listing a venue, pitching a story, or asking a question —
            our team is ready to connect with you.
          </p>
        </div>
      </section>

      <main>
        {/* Reason Cards */}
        <section className="contact-reasons-section">
          <div className="site-container">
            <div className="about-section-heading">
              <p className="landing-kicker">How can we help?</p>
              <h2>Choose what brings you to TheatreHub.</h2>
            </div>

            <div className="contact-reasons-grid">
              {CONTACT_REASONS.map((r) => (
                <article className="contact-reason-card" key={r.title}>
                  <div className="contact-reason-top">
                    <span className="contact-reason-emoji" aria-hidden="true">{r.emoji}</span>
                    <span className="contact-reason-tag">{r.tag}</span>
                  </div>
                  <h3>{r.title}</h3>
                  <p>{r.detail}</p>
                  <Link href={r.href} className="contact-reason-cta">
                    {r.cta} <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Main Grid: Form + Interactive Sidebar */}
        <section className="contact-main-section">
          <div className="site-container contact-main-grid">
            {/* Form */}
            <div className="contact-form-wrap">
              <div className="contact-form-header">
                <h2>Send us a message</h2>
                <p className="contact-form-intro">
                  Fill in the details below and a member of our team will get back to you promptly.
                </p>
              </div>

              {status === "done" ? (
                <div className="contact-success" role="status">
                  <div className="contact-success-icon" aria-hidden="true">✓</div>
                  <strong>Message received!</strong>
                  <p>Thank you for reaching out to TheatreHub. We have received your inquiry and will respond within one business day.</p>
                  <button
                    type="button"
                    className="about-btn about-btn-primary"
                    onClick={() => setStatus("idle")}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label htmlFor="contact-name">Full name <span aria-hidden="true">*</span></label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        className="contact-input"
                        placeholder="e.g. Anup Baral"
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="contact-field">
                      <label htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        className="contact-input"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-subject">Topic / Reason <span aria-hidden="true">*</span></label>
                    <select id="contact-subject" name="subject" className="contact-input" required defaultvalue="">
                      <option value="" disabled>Select a topic…</option>
                      <option value="list-production">List a production / show dates</option>
                      <option value="register-venue">Register or claim a theatre venue</option>
                      <option value="submit-story">Submit a story, essay, or review</option>
                      <option value="partnership">Partnership or sponsorship inquiry</option>
                      <option value="general">General enquiry</option>
                      <option value="bug">Report a bug or website feedback</option>
                    </select>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-org">Theatre / Group name <span className="contact-optional">(optional)</span></label>
                    <input
                      id="contact-org"
                      name="organisation"
                      type="text"
                      className="contact-input"
                      placeholder="e.g. Mandapagiri Theatre, Theatre Village, etc."
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-message">Message <span aria-hidden="true">*</span></label>
                    <textarea
                      id="contact-message"
                      name="message"
                      className="contact-input contact-textarea"
                      placeholder="Share details about your show, venue, or inquiry..."
                      rows={5}
                      required
                    />
                  </div>

                  {status === "error" && (
                    <div className="contact-error" role="alert">
                      <span>⚠️</span> Something went wrong submitting the form. You can also email us directly at{" "}
                      <a href="mailto:hello@theatrehub.org">hello@theatrehub.org</a>.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="about-btn about-btn-primary about-btn-lg contact-submit"
                    disabled={status === "sending"}
                    aria-disabled={status === "sending"}
                  >
                    {status === "sending" ? "Sending your message..." : "Send Message →"}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <aside className="contact-sidebar">
              <div className="contact-info-card">
                <div className="contact-card-title">
                  <span className="contact-card-icon">✉️</span>
                  <h3>Direct Emails</h3>
                </div>
                <ul className="contact-info-list">
                  <li>
                    <span className="contact-info-label">General &amp; Support</span>
                    <a href="mailto:hello@theatrehub.org">hello@theatrehub.org</a>
                  </li>
                  <li>
                    <span className="contact-info-label">Editorial &amp; Stories</span>
                    <a href="mailto:stories@theatrehub.org">stories@theatrehub.org</a>
                  </li>
                  <li>
                    <span className="contact-info-label">Partnerships</span>
                    <a href="mailto:partners@theatrehub.org">partners@theatrehub.org</a>
                  </li>
                </ul>
              </div>

              <div className="contact-info-card">
                <div className="contact-card-title">
                  <span className="contact-card-icon">⚡</span>
                  <h3>Response SLAs</h3>
                </div>
                <ul className="contact-response-list">
                  <li>
                    <span>General inquiries</span>
                    <strong className="contact-sla-badge">≤ 1 day</strong>
                  </li>
                  <li>
                    <span>Show listings</span>
                    <strong className="contact-sla-badge contact-sla-fast">≤ 24 hours</strong>
                  </li>
                  <li>
                    <span>Partnerships</span>
                    <strong className="contact-sla-badge">2–3 days</strong>
                  </li>
                </ul>
              </div>

              <div className="contact-social-card">
                <h3>Connect on Social</h3>
                <p>Follow show announcements, director interviews, and stage photos.</p>
                <a
                  href="https://www.facebook.com/theatrehub.org"
                  target="_blank"
                  rel="noreferrer"
                  className="contact-facebook"
                  aria-label="TheatreHub on Facebook"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14.2 8.2V6.6c0-.8.5-1 1-1h2.6V2h-3.5c-3.5 0-4.7 2.1-4.7 4.6v1.6H7v4h2.6V22h4.6v-9.8h3.1l.5-4h-3.6Z" />
                  </svg>
                  Follow on Facebook
                </a>
              </div>
            </aside>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="contact-faq-section">
          <div className="site-container contact-faq-inner">
            <div className="about-section-heading">
              <p className="landing-kicker">Got questions?</p>
              <h2>Frequently Asked Questions</h2>
            </div>

            <div className="contact-faq-list" role="list">
              {FAQS.map((faq, i) => (
                <div
                  className={`contact-faq-item${openFaq === i ? " is-open" : ""}`}
                  key={faq.q}
                  role="listitem"
                >
                  <button
                    type="button"
                    className="contact-faq-question"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{faq.q}</span>
                    <span className="contact-faq-chevron" aria-hidden="true">
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="contact-faq-answer" role="region">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="contact-faq-footer">
              Have a question not listed here? Learn more on our{" "}
              <Link href="/about-us/">About Us page</Link> or reach out directly at{" "}
              <a href="mailto:hello@theatrehub.org">hello@theatrehub.org</a>.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
