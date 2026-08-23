import type { Metadata } from "next";
import { ContentStatus } from "@prisma/client";
import Link from "next/link";
import { mediaUrl, plainText, publishedWhere, getTheatrePhoto } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { TheatreInteractiveView, type TheatreCardData } from "@/components/TheatreInteractiveView";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Theatres & Performance Spaces in Nepal | TheatreHub",
  description:
    "Explore Nepal's premier auditoriums, black box theatres, and historic cultural stages. Discover venue locations, phone numbers, websites, and play schedules.",
};

const showTimeFormat = new Intl.DateTimeFormat("en-NP", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kathmandu",
});

const showDateFormat = new Intl.DateTimeFormat("en-NP", {
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Kathmandu",
});

const STAGE_TYPES = [
  {
    title: "Black Box Studios",
    icon: "⬛",
    description: "Intimate, flexible experimental spaces where audience sits up close with the performers.",
    examples: "Mandala Studio, Shilpee Gothale Natakghar, Kausi Theatre",
  },
  {
    title: "Proscenium Auditoriums",
    icon: "🎭",
    description: "Grand traditional framed stages with elevated platforms, curtain lines, and tiered seating.",
    examples: "Rastriya Nachghar, Nepal Academy, Rastriya Sabha Griha",
  },
  {
    title: "Traditional Dabali",
    icon: "🏛️",
    description: "Historic stone open-air platforms crafted in ancient Newari squares for community festivals.",
    examples: "Patan Durbar Square, Bhaktapur Dabali, Basantapur",
  },
  {
    title: "Regional Cultural Hubs",
    icon: "🌿",
    description: "Independent performance venues taking contemporary stage productions beyond Kathmandu.",
    examples: "Gandharva Natak Ghar Pokhara, Aarohan Gurukul Biratnagar",
  },
];

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 600): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, delayMs));
      return withRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw error;
  }
}

export default async function TheatresPage() {
  const now = new Date();
  const baseWhere = { status: ContentStatus.PUBLISHED };
  const liveWhere = { showtime: { gt: now }, play: publishedWhere(now) };

  let dbTheatres: any[] = [];
  try {
    // Fetch all venues with their counts and next show
    dbTheatres = await withRetry(() =>
      prisma.theatre.findMany({
        where: baseWhere,
        orderBy: { title: "asc" },
        include: {
          shows: {
            where: liveWhere,
            orderBy: { showtime: "asc" },
            take: 1,
            include: { play: { select: { title: true, slug: true } } },
          },
          _count: {
            select: {
              plays: true,
              shows: true,
            },
          },
        },
      })
    );
  } catch (error) {
    console.error("Database connection error on Theatres page:", error);
  }


  // Calculate total stats
  const totalTheatres = dbTheatres.length;
  const totalPlays = dbTheatres.reduce((acc, t) => acc + t._count.plays, 0);
  const totalShows = dbTheatres.reduce((acc, t) => acc + t._count.shows, 0);

  const theatres: TheatreCardData[] = dbTheatres.map((t) => {
    const rawDesc = t.description || t.about || "";
    const cleanDesc = plainText(rawDesc) || "Discover this iconic theatre space in Nepal on TheatreHub.";
    const nextShow = t.shows[0];

    return {
      id: t.id,
      title: t.title,
      slug: t.slug || String(t.id),
      address: t.address,
      coverImage: getTheatrePhoto(t),
      profilePic: mediaUrl(t.profilePic),
      phone: t.phone,
      email: t.email,
      linkWebsite: t.linkWebsite,
      linkFacebook: t.linkFacebook,
      linkInstagram: t.linkInstagram,
      establishedYear: t.establishedOn ? new Date(t.establishedOn).getFullYear() : null,
      description: cleanDesc.slice(0, 160) + (cleanDesc.length > 160 ? "…" : ""),
      playsCount: t._count.plays,
      showsCount: t._count.shows,
      nextShow: nextShow
        ? {
            playTitle: nextShow.play.title,
            playSlug: nextShow.play.slug || "",
            showtimeFormatted: showTimeFormat.format(nextShow.showtime),
            dateFormatted: showDateFormat.format(nextShow.showtime),
          }
        : null,
    };
  });

  return (
    <div className="theatre-page-unified-container">
      {/* ── Theatre Index Hero ── */}
      <header className="play-index-hero">
        <div className="site-container play-index-hero-inner">
          <div className="play-index-copy">
            <div className="play-hero-badge">
              <span className="hero-badge-icon">🏛️</span>
              <span>Nepal Venue Directory &amp; Cultural Stages</span>
            </div>
            <h1 className="play-hero-title">
              Theatres &amp; <span className="play-hero-gradient">Performance Spaces</span>
            </h1>
            <p className="play-hero-sub">
              Explore Nepal&apos;s iconic auditoriums, intimate black box studios, and historic open-air
              stages where stories come alive every night.
            </p>

            <div className="play-index-actions">
              <Link href="/play/" className="about-btn about-btn-primary">
                Browse plays <span aria-hidden="true">→</span>
              </Link>
              <Link href="/contact-us/" className="about-btn about-btn-ghost">
                Register a venue 🏛️
              </Link>
            </div>
          </div>

          <div className="play-bento-stats" aria-label="Theatre directory statistics">
            <div className="bento-stat-card">
              <div className="bento-stat-icon">🏛️</div>
              <div className="bento-stat-text">
                <strong>{totalTheatres}</strong>
                <small>Iconic Venues</small>
              </div>
            </div>
            <div className="bento-stat-card">
              <div className="bento-stat-icon">🎭</div>
              <div className="bento-stat-text">
                <strong>{totalPlays}+</strong>
                <small>Staged Plays</small>
              </div>
            </div>
            <div className="bento-stat-card">
              <div className="bento-stat-icon">🎟️</div>
              <div className="bento-stat-text">
                <strong>{totalShows}+</strong>
                <small>Recorded Shows</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Interactive Directory Content ── */}
      <main className="site-container theatre-main-content">
        <TheatreInteractiveView theatres={theatres} />

        {/* ── Stage Types Guide Section ── */}
        <section className="theatre-guide-section">
          <div className="about-section-heading">
            <p className="landing-kicker">Stage Architecture</p>
            <h2>Performance Spaces Across Nepal</h2>
          </div>

          <div className="theatre-types-grid">
            {STAGE_TYPES.map((type) => (
              <div className="theatre-type-card" key={type.title}>
                <span className="theatre-type-icon">{type.icon}</span>
                <h3>{type.title}</h3>
                <p>{type.description}</p>
                <div className="theatre-type-examples">
                  <span>Notable:</span> {type.examples}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Venue Owner CTA ── */}
        <section className="theatre-register-cta">
          <div className="theatre-cta-box">
            <div className="theatre-cta-text">
              <p className="landing-kicker">For Stage Managers &amp; Organizers</p>
              <h2>Do you operate a theatre space or auditorium?</h2>
              <p>
                List your venue on TheatreHub to reach thousands of theatre-goers, display your upcoming show dates,
                and manage booking announcements in Nepal&apos;s central theatre hub.
              </p>
            </div>
            <div className="theatre-cta-actions">
              <Link href="/contact-us/" className="about-btn about-btn-primary about-btn-lg">
                Register Your Venue
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
