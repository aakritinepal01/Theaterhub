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
    emoji: "🎭",
    highlight: "Free & Accessible",
    accent: "#9d4f36",
    stat: "100% Free for Viewers",
  },
  {
    title: "Always Up to Date",
    body: "Show dates, cast updates, ticket prices — we push hard to keep every detail current so audiences never arrive at an empty stage.",
    emoji: "⚡",
    highlight: "Real-time Sync",
    accent: "#64856c",
    stat: "Live Showtime Status",
  },
  {
    title: "Community First",
    body: "Every feature we build serves the people making and watching theatre. Our roadmap is shaped by artists and directors, not ads.",
    emoji: "🤝",
    highlight: "Artist-Driven",
    accent: "#c58962",
    stat: "Built With Artists",
  },
  {
    title: "Authentic Stories",
    body: "We champion the craft behind every production. Our editorial journal goes beyond listings to celebrate the art of Nepal's stage.",
    emoji: "📖",
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
    icon: "✨",
    metric: "Idea Conceived",
  },
  {
    year: "2023",
    label: "Beta Launch",
    detail: "First version went live with 12 pioneer theatre collectives and essential play listings.",
    icon: "🚀",
    metric: "12 Theatres Onboarded",
  },
  {
    year: "2024",
    label: "Nationwide Growth",
    detail: "Expanded to 50+ productions, interactive scheduling, user profiles, and the Stories journal.",
    icon: "🌏",
    metric: "50+ Productions Listed",
  },
  {
    year: "2025",
    label: "Living Stage Archive",
    detail: "Connecting thousands of theatre lovers across Nepal with instant showtimes, venue info, and stage archives.",
    icon: "🏛️",
    metric: "850+ Shows Documented",
  },
];

const STATS = [
  { value: "86+", label: "Plays Documented", icon: "🎭", sub: "Classics & Modern Drama" },
  { value: "25", label: "Iconic Venues", icon: "🏛️", sub: "Auditoriums & Black Boxes" },
  { value: "858+", label: "Recorded Shows", icon: "🎟️", sub: "Lifetime Performances" },
  { value: "3+", label: "Years Running", icon: "⏳", sub: "Empowering Nepal Stage" },
];

const REGION_HUBS = [
  { name: "Kathmandu Valley", count: "16 Theatres", desc: "Mandala, Shilpee, Kausi, Sarwanam, Kunja & More" },
  { name: "Pokhara Valley", count: "4 Theatres", desc: "Pokhara Theatre, Gandaki Stage & Cultural Hubs" },
  { name: "Eastern Nepal (Koshi)", count: "5 Theatres", desc: "Ilam, Belbari, Jhorahat & Dharan Drama Clubs" },
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
              <div className="au-mission-card-badge">🏛️ Stage Directory Overview</div>
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
                    <span className="au-hub-pin">📍</span>
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
                    <span className="au-value-emoji">{v.emoji}</span>
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
                  style={{ borderColor: "#25D366", color: "#25D366" }}
                >
                  💬 Join WhatsApp Group
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
