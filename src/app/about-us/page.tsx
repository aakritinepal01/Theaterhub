import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "TheatreHub was built to celebrate Nepal's theatre community — connecting audiences, artists, and venues in one living archive of the stage.",
};

const TEAM = [
  {
    initial: "S",
    name: "Sandesh Neupane",
    role: "Founder & Developer",
    bio: "A theatre lover turned builder. Sandesh created TheatreHub to solve the fragmented discovery problem Nepal's theatre community has faced for years.",
    badge: "Engineering",
  },
  {
    initial: "P",
    name: "Priya Shrestha",
    role: "Content & Community Lead",
    bio: "Former actress and arts journalist who curates stories, coordinates with theatre teams, and keeps TheatreHub's editorial voice true to the craft.",
    badge: "Editorial",
  },
  {
    initial: "A",
    name: "Arjun Maharjan",
    role: "Design & Brand",
    bio: "Visual designer obsessed with typographic craft. Arjun shapes every pixel of TheatreHub's identity — from logo to layout to lighting.",
    badge: "Design",
  },
  {
    initial: "N",
    name: "Nisha Tamang",
    role: "Outreach & Partnerships",
    bio: "Connects TheatreHub with theatre groups, festivals, and cultural organisations. Nisha is the bridge between the platform and the performing world.",
    badge: "Outreach",
  },
];

const VALUES = [
  {
    title: "Open to Everyone",
    body: "We believe theatre belongs to all of Nepal — from grand Kathmandu stages to grassroots productions in far-flung towns. Our platform is free for audiences to explore.",
    emoji: "🎭",
    highlight: "Free & Accessible",
  },
  {
    title: "Always Up to Date",
    body: "Show dates, cast updates, ticket prices — we push hard to keep every detail current so audiences never arrive at an empty stage.",
    emoji: "🕐",
    highlight: "Real-time Sync",
  },
  {
    title: "Community First",
    body: "Every feature we build serves the people making and watching theatre. Our roadmap is shaped by the community, not advertising.",
    emoji: "🤝",
    highlight: "Artist-Driven",
  },
  {
    title: "Authentic Stories",
    body: "We celebrate the craft behind every production. TheatreHub's editorial content goes beyond listings — we champion the stories that belong on stage.",
    emoji: "📖",
    highlight: "In-depth Coverage",
  },
];

const MILESTONES = [
  { year: "2022", label: "The Spark", detail: "TheatreHub was born from a frustrating evening spent searching in vain for show dates online." },
  { year: "2023", label: "Beta Launch", detail: "First version launched in Kathmandu with 12 theatre groups and essential play listings." },
  { year: "2024", label: "Nationwide Growth", detail: "Expanded to 50+ productions, interactive show scheduling, user profiles, and the Stories journal." },
  { year: "2025", label: "Living Archive", detail: "Connecting thousands of theatre lovers across Nepal with instant booking info and stage archives." },
];

const TICKER_WORDS = ["Plays", "Stages", "Stories", "Artists", "Shows", "Kathmandu", "Nepal", "Drama", "Community", "Culture"];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-orb about-hero-orb-1" aria-hidden="true" />
        <div className="about-hero-orb about-hero-orb-2" aria-hidden="true" />

        <div className="site-container about-hero-inner">
          <div className="about-hero-pill">
            <span className="about-hero-pill-dot" />
            <span>Discover Nepal&apos;s Stage Archive</span>
          </div>

          <h1>Built for the people who live for the stage.</h1>

          <p className="about-hero-lead">
            TheatreHub started with a simple question: why is it so hard to find out what is playing
            in Nepal tonight? We built the answer — a living, breathing digital platform connecting
            plays, theatres, artists, and passionate audiences.
          </p>

          <div className="about-hero-actions">
            <Link href="/play/" className="about-btn about-btn-primary">
              Explore plays <span aria-hidden="true">→</span>
            </Link>
            <Link href="/contact-us/" className="about-btn about-btn-ghost">
              Get in touch
            </Link>
          </div>
        </div>

        {/* Continuous Marquee Ticker */}
        <div className="about-ticker-container" aria-hidden="true">
          <div className="about-ticker-track">
            {TICKER_WORDS.concat(TICKER_WORDS).map((w, idx) => (
              <span className="about-ticker-item" key={`${w}-${idx}`}>
                <span className="about-ticker-sparkle">✦</span>
                {w}
              </span>
            ))}
          </div>
        </div>
      </section>

      <main>
        {/* Mission */}
        <section className="about-section about-mission site-container">
          <div className="about-mission-copy">
            <p className="landing-kicker">Our mission</p>
            <h2>One unified home for all of Nepal&apos;s performing arts.</h2>
            <p>
              Nepal has a rich, centuries-old tradition of performance — from sacred theatrical rituals
              to modern experimental drama. Yet for most audiences, discovering a show still means asking around,
              scrolling through cluttered social media feeds, or missing out completely.
            </p>
            <p>
              TheatreHub changes that forever. We provide every theatre collective, venue manager, and production
              team with a dedicated digital home — empowering audiences to discover, follow, and experience theatre.
            </p>
          </div>

          <div className="about-mission-stats">
            <div className="about-stat">
              <div className="about-stat-glow" />
              <strong>50+</strong>
              <span>Productions listed</span>
            </div>
            <div className="about-stat">
              <div className="about-stat-glow" />
              <strong>20+</strong>
              <span>Theatre venues</span>
            </div>
            <div className="about-stat">
              <div className="about-stat-glow" />
              <strong>100+</strong>
              <span>Show dates tracked</span>
            </div>
            <div className="about-stat">
              <div className="about-stat-glow" />
              <strong>1</strong>
              <span>United community</span>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="about-values-section">
          <div className="site-container">
            <div className="about-section-heading">
              <p className="landing-kicker">What drives us</p>
              <h2>The core principles behind the platform.</h2>
            </div>

            <div className="about-values-grid">
              {VALUES.map((v) => (
                <div className="about-value-card" key={v.title}>
                  <div className="about-value-top">
                    <span className="about-value-emoji" aria-hidden="true">{v.emoji}</span>
                    <span className="about-value-tag">{v.highlight}</span>
                  </div>
                  <h3>{v.title}</h3>
                  <p>{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="about-section site-container">
          <div className="about-section-heading">
            <p className="landing-kicker">Our journey</p>
            <h2>From a simple idea to a thriving community.</h2>
          </div>

          <ol className="about-timeline" aria-label="TheatreHub milestones">
            {MILESTONES.map((m) => (
              <li className="about-timeline-item" key={m.year}>
                <div className="about-timeline-year">
                  <span>{m.year}</span>
                </div>
                <div className="about-timeline-body">
                  <strong>{m.label}</strong>
                  <p>{m.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Team */}
        <section className="about-team-section">
          <div className="site-container">
            <div className="about-section-heading">
              <p className="landing-kicker">The creators</p>
              <h2>Passionate people behind TheatreHub.</h2>
              <p className="about-section-sub">
                We are a small, dedicated team of developers, theatre artists, and storytellers
                working together to elevate Nepal&apos;s performing arts scene.
              </p>
            </div>

            <div className="about-team-grid">
              {TEAM.map((member) => (
                <article className="about-team-card" key={member.name}>
                  <div className="about-team-top">
                    <div className="about-team-avatar" aria-hidden="true">
                      {member.initial}
                    </div>
                    <span className="about-team-badge">{member.badge}</span>
                  </div>
                  <div className="about-team-copy">
                    <h3>{member.name}</h3>
                    <span className="about-team-role">{member.role}</span>
                    <p>{member.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta-section">
          <div className="about-cta-glow" aria-hidden="true" />
          <div className="site-container about-cta-inner">
            <div className="about-cta-text">
              <p className="landing-kicker">Join the movement</p>
              <h2>The stage is waiting for your story.</h2>
              <p>
                Whether you manage a theatre stage, direct indie productions, or love watching live theatre,
                TheatreHub is your digital home. Join today and help build Nepal&apos;s premier stage network.
              </p>
            </div>
            <div className="about-cta-actions">
              <Link href="/signup/" className="about-btn about-btn-primary about-btn-lg">
                Join TheatreHub — it&apos;s free
              </Link>
              <Link href="/contact-us/" className="about-btn about-btn-outline about-btn-lg">
                Contact our team
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
