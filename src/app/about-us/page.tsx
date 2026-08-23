import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — TheatreHub Nepal",
  description:
    "TheatreHub was built to celebrate Nepal's theatre community — connecting audiences, artists, and venues in one living archive of the stage.",
};

const TEAM = [
  {
    initial: "S",
    name: "Sandesh Neupane",
    role: "Founder & Lead Engineer",
    bio: "A theatre lover turned builder. Sandesh created TheatreHub to solve the fragmented discovery problem Nepal's theatre community has faced for years.",
    badge: "Engineering",
    color: "#9d4f36",
    tag: "@sandesh",
  },
  {
    initial: "P",
    name: "Priya Shrestha",
    role: "Content & Community Lead",
    bio: "Former actress and arts journalist who curates stories, coordinates with theatre teams, and keeps TheatreHub's editorial voice true to the craft.",
    badge: "Editorial",
    color: "#64856c",
    tag: "@priya_stage",
  },
  {
    initial: "A",
    name: "Arjun Maharjan",
    role: "Design & Brand Director",
    bio: "Visual designer obsessed with typographic craft. Arjun shapes every pixel of TheatreHub's identity — from logo to layout to lighting.",
    badge: "Design",
    color: "#c58962",
    tag: "@arjun_art",
  },
  {
    initial: "N",
    name: "Nisha Tamang",
    role: "Outreach & Partnerships",
    bio: "Connects TheatreHub with theatre groups, festivals, and cultural organisations. Nisha is the bridge between the platform and the performing world.",
    badge: "Outreach",
    color: "#7a6a9e",
    tag: "@nisha_theatre",
  },
];

const VALUES = [
  {
    title: "Open to Everyone",
    body: "We believe theatre belongs to all of Nepal — from grand Kathmandu stages to grassroots productions in far-flung towns.",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--au-accent, #9d4f36)" aria-hidden="true">
        <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.28 19.65 10.59 20 12 20s2.72-.35 4.34-1.09l1.9 1.9c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.62-1.79C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9zm-3.5 8c-.83 0-1.5-.67-1.5-1.5S7.67 8 8.5 8s1.5.67 1.5 1.5S9.33 11 8.5 11zm7 0c-.83 0-1.5-.67-1.5-1.5S14.67 8 15.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-3.5 5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
      </svg>
    ),
    highlight: "Free & Accessible",
    accent: "#9d4f36",
    stat: "100% Free for Viewers",
  },
  {
    title: "Always Up to Date",
    body: "Show dates, cast updates, ticket prices — we push hard to keep every detail current so audiences never arrive at an empty stage.",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--au-accent, #64856c)" aria-hidden="true">
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
      </svg>
    ),
    highlight: "Real-time Sync",
    accent: "#64856c",
    stat: "Live Showtime Status",
  },
  {
    title: "Community First",
    body: "Every feature we build serves the people making and watching theatre. Our roadmap is shaped by artists and directors, not ads.",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--au-accent, #c58962)" aria-hidden="true">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ),
    highlight: "Artist-Driven",
    accent: "#c58962",
    stat: "Built With Artists",
  },
  {
    title: "Authentic Stories",
    body: "We champion the craft behind every production. Our editorial journal goes beyond listings to celebrate the art of Nepal's stage.",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--au-accent, #7a6a9e)" aria-hidden="true">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    ),
    highlight: "In-depth Coverage",
    accent: "#7a6a9e",
    stat: "Rich Stage Journal",
  },
];

const MILESTONES = [
  {
    year: "2022",
    label: "The Spark",
    detail: "Born from a frustrating evening spent searching in vain for show dates online in Kathmandu.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0723e" aria-hidden="true">
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
      </svg>
    ),
    metric: "Idea Conceived",
  },
  {
    year: "2023",
    label: "Beta Launch",
    detail: "First version went live with 12 pioneer theatre collectives and essential play listings.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0723e" aria-hidden="true">
        <path d="M12 2.5s4 4 4 9.5c0 2.21-.89 4.21-2.34 5.66l.84 2.84-2.5-1.5-2.5 1.5.84-2.84C8.89 16.21 8 14.21 8 12c0-5.5 4-9.5 4-9.5z"/>
      </svg>
    ),
    metric: "12 Theatres Onboarded",
  },
  {
    year: "2024",
    label: "Nationwide Growth",
    detail: "Expanded to 50+ productions, interactive scheduling, user profiles, and the Stories journal.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0723e" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    ),
    metric: "50+ Productions Listed",
  },
  {
    year: "2025",
    label: "Living Stage Archive",
    detail: "Connecting thousands of theatre lovers across Nepal with instant showtimes, venue info, and stage archives.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0723e" aria-hidden="true">
        <path d="M12 2L2 7v2h20V7L12 2zM4 11v8h3v-8H4zm6 0v8h4v-8h-4zm7 0v8h3v-8h-3zm-15 10v2h20v-2H2z"/>
      </svg>
    ),
    metric: "850+ Shows Documented",
  },
];

const STATS = [
  {
    value: "86+",
    label: "Plays Documented",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0723e" aria-hidden="true">
        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
      </svg>
    ),
    sub: "Classics & Modern Drama",
  },
  {
    value: "25",
    label: "Iconic Venues",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0723e" aria-hidden="true">
        <path d="M12 2L2 7v2h20V7L12 2zM4 11v8h3v-8H4zm6 0v8h4v-8h-4zm7 0v8h3v-8h-3zm-15 10v2h20v-2H2z"/>
      </svg>
    ),
    sub: "Auditoriums & Black Boxes",
  },
  {
    value: "858+",
    label: "Recorded Shows",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0723e" aria-hidden="true">
        <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/>
      </svg>
    ),
    sub: "Lifetime Performances",
  },
  {
    value: "3+",
    label: "Years Running",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0723e" aria-hidden="true">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
      </svg>
    ),
    sub: "Empowering Nepal Stage",
  },
];

const REGION_HUBS = [
  {
    name: "Kathmandu Valley",
    count: "16 Theatres",
    desc: "Mandala, Shilpee, Kausi, Sarwanam, Kunja & More",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="#e0723e" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
  },
  {
    name: "Pokhara Valley",
    count: "4 Theatres",
    desc: "Pokhara Theatre, Gandaki Stage & Cultural Hubs",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="#e0723e" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
  },
  {
    name: "Eastern Nepal (Koshi)",
    count: "5 Theatres",
    desc: "Ilam, Belbari, Jhorahat & Dharan Drama Clubs",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="#e0723e" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
  },
];

const FAQS = [
  {
    q: "How does TheatreHub get showtimes and play listings?",
    a: "We work directly with theatre managers, directors, and independent theatre collectives across Nepal to sync show schedules, ticket details, and cast credits."
  },
  {
    q: "Is TheatreHub free for theatre groups to list their plays?",
    a: "Yes! TheatreHub is 100% free for theatre groups and venues. Our mission is to make Nepal's stage arts visible to everyone."
  },
  {
    q: "Can I register my own theatre venue or play production?",
    a: "Absolutely. Simply reach out via our contact form or create an account to get your venue listed in our directory."
  }
];

export default function AboutPage() {
  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="au-hero">
        <div className="au-hero-bg-grid" aria-hidden="true" />
        <div className="au-hero-glow-1" aria-hidden="true" />
        <div className="au-hero-glow-2" aria-hidden="true" />

        <div className="site-container au-hero-inner">
          {/* Left Column: Text & CTAs */}
          <div className="au-hero-left">
            <div className="au-hero-eyebrow">
              <span className="au-eyebrow-dot" />
              <span>Nepal&apos;s Living Stage Archive &amp; Directory</span>
            </div>

            <h1 className="au-hero-title">
              Built for the people<br />
              <em>who live for the stage.</em>
            </h1>

            <p className="au-hero-lead">
              TheatreHub started with a simple question: why is it hard to find
              what&apos;s playing in Nepal tonight? We built the answer — a living,
              breathing digital platform connecting plays, theatres, artists, and
              passionate audiences across the country.
            </p>

            <div className="au-hero-cta">
              <Link href="/play/" className="au-btn-primary">
                Explore Plays <span aria-hidden="true">→</span>
              </Link>
              <Link href="/contact-us/" className="au-btn-ghost">
                Get in touch
              </Link>
            </div>
          </div>

          {/* Right Column: Stat Cards Bento */}
          <div className="au-hero-right">
            {STATS.map((s) => (
              <div className="au-hero-stat" key={s.label}>
                <div className="au-stat-icon-badge">{s.icon}</div>
                <strong>{s.value}</strong>
                <span className="au-stat-lbl">{s.label}</span>
                <span className="au-stat-sub">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main>
        {/* ── MISSION SECTION ── */}
        <section className="au-section au-mission site-container">
          <div className="au-mission-text">
            <p className="au-kicker">Our mission</p>
            <h2>One unified home for all of Nepal&apos;s performing arts.</h2>
            <p>
              Nepal has a rich, centuries-old tradition of performance — from sacred
              theatrical rituals to modern experimental drama. Yet for most audiences,
              discovering a show still means asking around, scrolling through cluttered
              social feeds, or missing out entirely.
            </p>
            <p>
              TheatreHub changes that. We give every theatre collective, venue manager,
              and production team a dedicated digital home — empowering audiences to
              discover, follow, and experience live theatre like never before.
            </p>
            <Link href="/theatre/" className="au-link-arrow">
              Browse iconic venues <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Feature Card Box */}
          <div className="au-mission-visual">
            <div className="au-mission-card">
              <div className="au-mission-card-badge">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 2L2 7v2h20V7L12 2zM4 11v8h3v-8H4zm6 0v8h4v-8h-4zm7 0v8h3v-8h-3zm-15 10v2h20v-2H2z"/>
                </svg>
                <span>Stage Directory Overview</span>
              </div>
              <blockquote className="au-mission-quote">
                &ldquo;Theatre is a communal act of imagination. TheatreHub
                makes that communion accessible to every corner of Nepal.&rdquo;
              </blockquote>
              
              <div className="au-mission-venue-tags">
                <span className="au-v-tag">Mandala Theatre</span>
                <span className="au-v-tag">Shilpee Theatre</span>
                <span className="au-v-tag">Kausi Theatre</span>
                <span className="au-v-tag">Kunja Theatre</span>
                <span className="au-v-tag">Pokhara Theatre</span>
                <span className="au-v-tag">+ 20 More</span>
              </div>

              <div className="au-mission-quote-author">
                <span className="au-mission-author-dot" />
                <span>Curated by TheatreHub Nepal</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── REGIONAL THEATRE HUBS ── */}
        <section className="au-hubs-section">
          <div className="site-container">
            <div className="au-section-head centered">
              <p className="au-kicker">Nationwide Network</p>
              <h2>Empowering Theatre Spaces Across Regions</h2>
              <p className="au-section-sub">
                From intimate black box studios in Kathmandu to community stages across Koshi &amp; Gandaki.
              </p>
            </div>

            <div className="au-hubs-grid">
              {REGION_HUBS.map((hub) => (
                <div className="au-hub-card" key={hub.name}>
                  <div className="au-hub-header">
                    <span className="au-hub-pin">{hub.icon}</span>
                    <h3>{hub.name}</h3>
                  </div>
                  <span className="au-hub-count">{hub.count}</span>
                  <p>{hub.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CORE VALUES BENTO ── */}
        <section className="au-values-section">
          <div className="site-container">
            <div className="au-section-head centered">
              <p className="au-kicker">What drives us</p>
              <h2>The core principles behind the platform.</h2>
              <p className="au-section-sub">
                Designed to empower artists, preserve cultural archives, and make theatre discovery seamless.
              </p>
            </div>

            <div className="au-values-grid">
              {VALUES.map((v, i) => (
                <div
                  className="au-value-card"
                  key={v.title}
                  style={{ "--au-accent": v.accent, animationDelay: `${i * 0.08}s` } as React.CSSProperties}
                >
                  <div className="au-value-top-row">
                    <span className="au-value-icon-wrap">{v.icon}</span>
                    <span className="au-value-tag">{v.highlight}</span>
                  </div>
                  <h3>{v.title}</h3>
                  <p>{v.body}</p>
                  <div className="au-value-stat-pill">{v.stat}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── JOURNEY / TIMELINE ── */}
        <section className="au-section site-container">
          <div className="au-section-head centered">
            <p className="au-kicker">Our journey</p>
            <h2>From a simple idea to a thriving community.</h2>
            <p className="au-section-sub">
              How TheatreHub grew from an evening idea into Nepal&apos;s premier stage network.
            </p>
          </div>

          <div className="au-timeline">
            {MILESTONES.map((m, i) => (
              <div className="au-timeline-item" key={m.year}>
                <div className="au-timeline-node">
                  <span className="au-timeline-icon">{m.icon}</span>
                  {i < MILESTONES.length - 1 && (
                    <div className="au-timeline-line" aria-hidden="true" />
                  )}
                </div>
                <div className="au-timeline-content">
                  <div className="au-timeline-year">{m.year}</div>
                  <strong>{m.label}</strong>
                  <p>{m.detail}</p>
                  <span className="au-timeline-metric">{m.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CREATORS / TEAM ── */}
        <section className="au-team-section">
          <div className="site-container">
            <div className="au-section-head centered">
              <p className="au-kicker">The creators</p>
              <h2>Passionate people behind TheatreHub.</h2>
              <p className="au-section-sub">
                A small, dedicated team of developers, theatre artists, and
                storytellers working to elevate Nepal&apos;s performing arts scene.
              </p>
            </div>

            <div className="au-team-grid">
              {TEAM.map((member) => (
                <article className="au-team-card" key={member.name}>
                  <div className="au-team-header">
                    <div
                      className="au-team-avatar"
                      style={{ "--au-avatar-color": member.color } as React.CSSProperties}
                    >
                      {member.initial}
                      <div className="au-team-avatar-ring" />
                    </div>
                    <span
                      className="au-team-badge"
                      style={{ "--au-avatar-color": member.color } as React.CSSProperties}
                    >
                      {member.badge}
                    </span>
                  </div>

                  <div className="au-team-info">
                    <h3>{member.name}</h3>
                    <span className="au-team-role">{member.role}</span>
                  </div>
                  
                  <p>{member.bio}</p>

                  <div className="au-team-handle">{member.tag}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQS SECTION ── */}
        <section className="au-faq-section site-container">
          <div className="au-section-head centered">
            <p className="au-kicker">Frequently Asked Questions</p>
            <h2>Everything you need to know about TheatreHub</h2>
          </div>

          <div className="au-faq-grid">
            {FAQS.map((faq) => (
              <div className="au-faq-card" key={faq.q}>
                <h4>{faq.q}</h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CALL TO ACTION ── */}
        <section className="au-cta-section">
          <div className="au-cta-glow" aria-hidden="true" />
          <div className="site-container au-cta-inner">
            <div className="au-cta-box">
              <p className="au-kicker">Join the movement</p>
              <h2>The stage is waiting for your story.</h2>
              <p>
                Whether you manage a theatre stage, direct indie productions, or simply
                love watching live theatre — TheatreHub is your digital home.
              </p>
              <div className="au-cta-btns">
                <Link href="/signup/" className="au-btn-primary au-btn-lg">
                  Join TheatreHub — it&apos;s free
                </Link>
                <a
                  href="https://chat.whatsapp.com/KloK0eNsAv7CAEb8MuQdXK"
                  target="_blank"
                  rel="noreferrer"
                  className="au-btn-outline au-btn-lg"
                  style={{ borderColor: "#25D366", color: "#25D366", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366" aria-hidden="true">
                    <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.768.46 3.493 1.332 5.006L2 22l5.118-1.328a9.988 9.988 0 0 0 4.913 1.282h.004c5.534 0 10.03-4.496 10.03-10.032A10.03 10.03 0 0 0 12.031 2zM12.03 20.088a8.03 8.03 0 0 1-4.096-1.12l-.294-.174-3.042.798.812-2.966-.192-.306A8.026 8.026 0 0 1 4.004 12.03c0-4.426 3.6-8.027 8.028-8.027 2.146 0 4.164.836 5.682 2.354A8.003 8.003 0 0 1 20.06 12.03c0 4.427-3.6 8.058-8.03 8.058zm4.404-6.024c-.241-.12-1.428-.705-1.649-.785-.221-.08-.382-.12-.543.12-.16.241-.623.785-.764.945-.14.16-.282.18-.523.06a6.568 6.568 0 0 1-1.942-1.2 7.24 7.24 0 0 1-1.344-1.674c-.14-.241-.015-.372.106-.492.108-.108.241-.282.362-.422.12-.14.16-.241.24-.402.08-.16.04-.302-.02-.422-.06-.12-.543-1.309-.744-1.792-.196-.47-.395-.407-.543-.414-.141-.007-.302-.008-.463-.008s-.422.06-.643.302c-.221.241-.844.825-.844 2.012s.865 2.334.985 2.495c.12.16 1.701 2.597 4.12 3.642.576.248 1.026.397 1.376.509.578.184 1.105.158 1.52.096.464-.069 1.428-.584 1.63-1.147.201-.563.201-1.045.14-1.146-.06-.1-.22-.16-.462-.28z"/>
                  </svg>
                  Join WhatsApp Group
                </a>
                <Link href="/contact-us/" className="au-btn-outline au-btn-lg">
                  Contact team
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
