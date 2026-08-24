"use client";

import { useState, type FormEvent } from "react";

export function NewsletterSubscribe({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 600));
    setStatus("success");
    setMessage("Dhanyabad! You are subscribed to TheatreHub Newsletter.");
    setEmail("");
  };

  if (compact) {
    return (
      <div className="newsletter-compact-card">
        <div className="newsletter-compact-header">
          <span className="newsletter-badge">📬 Weekly Dispatch</span>
          <h4>Subscribe to TheatreHub Newsletter</h4>
          <p>Get instant show announcements, stage reviews, and festival updates delivered to your inbox.</p>
        </div>
        {status === "success" ? (
          <div className="newsletter-alert newsletter-alert-success">
            <span>🎉 {message}</span>
          </div>
        ) : (
          <form className="newsletter-form-inline" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              className="input newsletter-input"
              required
            />
            <button type="submit" className="button newsletter-btn" disabled={status === "loading"}>
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && <p className="newsletter-error-text">{message}</p>}
      </div>
    );
  }

  return (
    <section className="newsletter-section-banner" aria-label="TheatreHub Newsletter Signup">
      <div className="newsletter-banner-glow" />
      <div className="newsletter-banner-content">
        <div className="newsletter-pill-tag">
          <span className="pill-dot" />
          <span>NEPAL STAGE DISPATCH &amp; NEWSLETTER</span>
        </div>
        <h2>Never Miss a Curtain Call.</h2>
        <p className="newsletter-desc">
          Subscribe to our official <strong>TheatreHub Newsletter</strong> for weekly show calendars, exclusive director notes, 
          festival lineup updates, and deep dives into Nepal&apos;s vibrant theatre scene.
        </p>

        {status === "success" ? (
          <div className="newsletter-success-box">
            <div className="newsletter-success-icon">✨</div>
            <h3>Dhanyabad! You&apos;re on the Guest List.</h3>
            <p>{message}</p>
          </div>
        ) : (
          <form className="newsletter-main-form" onSubmit={handleSubmit}>
            <div className="newsletter-input-group">
              <div className="newsletter-input-wrap">
                <svg className="newsletter-mail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  className="newsletter-big-input"
                  required
                />
              </div>
              <button type="submit" className="newsletter-big-btn" disabled={status === "loading"}>
                {status === "loading" ? "Joining..." : "Subscribe Free"}
              </button>
            </div>
            {status === "error" && <p className="newsletter-error-text">{message}</p>}
          </form>
        )}

        <div className="newsletter-perks-row">
          <span>🔒 No spam, unsubscribe anytime</span>
          <span>🎭 100% Free Stage Updates</span>
          <span>🇳🇵 Dedicated to Nepal Theatre</span>
        </div>
      </div>
    </section>
  );
}
