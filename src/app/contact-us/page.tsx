"use client";

import { useState } from "react";
import Link from "next/link";

const CONTACT_REASONS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#e0723e" aria-hidden="true">
        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
      </svg>
    ),
    title: "List a production",
    detail: "Get your play, musical, or dance show listed on TheatreHub with description, schedule, venue, and ticketing info.",
    href: "/signup/",
    cta: "Create a profile",
    tag: "Producers & Directors",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#e0723e" aria-hidden="true">
        <path d="M12 2L2 7v2h20V7L12 2zM4 11v8h3v-8H4zm6 0v8h4v-8h-4zm7 0v8h3v-8h-3zm-15 10v2h20v-2H2z"/>
      </svg>
    ),
    title: "Register a venue",
    detail: "Theatre owners and hall managers can showcase their venue, publish stage details, and link upcoming performances.",
    href: "/signup/",
    cta: "Register your venue",
    tag: "Venue Managers",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#e0723e" aria-hidden="true">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    ),
    title: "Submit a story",
    detail: "Writers, critics, and theatre scholars can pitch articles, director interviews, and reviews for our blog.",
    href: "mailto:stories@theatrehub.org",
    cta: "Email the editors",
    tag: "Writers & Critics",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#e0723e" aria-hidden="true">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ),
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
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First FAQ open by default for rich visual layout

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const r = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await r.json().catch(() => null) as { error?: string } | null;
      if (r.ok) {
        setStatus("done");
        (e.target as HTMLFormElement).reset();
      } else {
        setErrorMessage(payload?.error || "We couldn't submit your message. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("We couldn't connect to the contact service. Please try again shortly.");
      setStatus("error");
    }
  }

  return (
    <>
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
                    <span className="contact-reason-icon-wrap" aria-hidden="true">{r.icon}</span>
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
                    onClick={() => {
                      setErrorMessage("");
                      setStatus("idle");
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
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
                    <select id="contact-subject" name="subject" className="contact-input" required defaultValue="">
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
                      rows={3}
                      required
                    />
                  </div>

                  {status === "error" && (
                    <div className="contact-error" role="alert">
                      <span>⚠️</span> {errorMessage}
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
              {/* Direct Emails Tile Card */}
              <div className="contact-info-card">
                <div className="contact-card-title">
                  <div className="contact-card-icon-wrap">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#e0723e" aria-hidden="true">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Direct Emails</h3>
                    <p className="contact-card-subtitle">Direct desks for specific inquiries</p>
                  </div>
                </div>

                <div className="contact-email-tiles">
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=hello@theatrehub.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-email-tile"
                  >
                    <div className="contact-tile-avatar">
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="#e0723e" aria-hidden="true">
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                      </svg>
                    </div>
                    <div className="contact-tile-text">
                      <strong>General &amp; Support</strong>
                      <span>hello@theatrehub.org</span>
                    </div>
                    <span className="contact-tile-arrow" aria-hidden="true">→</span>
                  </a>

                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=stories@theatrehub.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-email-tile"
                  >
                    <div className="contact-tile-avatar">
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="#e0723e" aria-hidden="true">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                    </div>
                    <div className="contact-tile-text">
                      <strong>Editorial &amp; Stories</strong>
                      <span>stories@theatrehub.org</span>
                    </div>
                    <span className="contact-tile-arrow" aria-hidden="true">→</span>
                  </a>

                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=partners@theatrehub.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-email-tile"
                  >
                    <div className="contact-tile-avatar">
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="#e0723e" aria-hidden="true">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                    </div>
                    <div className="contact-tile-text">
                      <strong>Partnerships &amp; Brands</strong>
                      <span>partners@theatrehub.org</span>
                    </div>
                    <span className="contact-tile-arrow" aria-hidden="true">→</span>
                  </a>
                </div>
              </div>

              {/* Connect & Join Community Card */}
              <div className="contact-social-card">
                <div className="contact-card-title">
                  <div className="contact-card-icon-wrap">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#e0723e" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Connect &amp; Community</h3>
                    <p className="contact-card-subtitle">Instant show alerts &amp; artist discussions</p>
                  </div>
                </div>

                <div className="contact-email-tiles">
                  <a
                    href="https://chat.whatsapp.com/KloK0eNsAv7CAEb8MuQdXK"
                    target="_blank"
                    rel="noreferrer"
                    className="contact-email-tile"
                    aria-label="Join Official WhatsApp Group"
                  >
                    <div className="contact-tile-avatar">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="#25D366" aria-hidden="true">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.02.79.81-2.94-.19-.3a8.216 8.216 0 0 1-1.25-4.36c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.47-.01c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.55.12.17 1.74 2.65 4.21 3.72.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.31z"/>
                      </svg>
                    </div>
                    <div className="contact-tile-text">
                      <strong>Official WhatsApp Group</strong>
                      <span>Live show alerts &amp; artist community</span>
                    </div>
                    <span className="contact-tile-arrow" aria-hidden="true">→</span>
                  </a>

                  <a
                    href="https://www.facebook.com/theatrehub.org"
                    target="_blank"
                    rel="noreferrer"
                    className="contact-email-tile"
                    aria-label="TheatreHub on Facebook"
                  >
                    <div className="contact-tile-avatar">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="#1877F2" aria-hidden="true">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="contact-tile-text">
                      <strong>Facebook Page</strong>
                      <span>Event updates &amp; stage photos</span>
                    </div>
                    <span className="contact-tile-arrow" aria-hidden="true">→</span>
                  </a>

                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=hello@theatrehub.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-email-tile"
                    aria-label="Email TheatreHub Team"
                  >
                    <div className="contact-tile-avatar">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="#EA4335" aria-hidden="true">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div className="contact-tile-text">
                      <strong>Send Direct Email</strong>
                      <span>hello@theatrehub.org</span>
                    </div>
                    <span className="contact-tile-arrow" aria-hidden="true">→</span>
                  </a>
                </div>
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
