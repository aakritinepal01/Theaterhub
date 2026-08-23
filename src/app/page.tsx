import Link from "next/link";
import { mediaUrl, plainText } from "@/lib/content";
import { getFeaturedPlays, getHeroPlays, getHomepageStats, getUpcomingShows } from "@/lib/home";
import { Hero } from "@/components/Hero";
import { LiveStageMarquee } from "@/components/LiveStageMarquee";

export const revalidate = 300;

const showTime = new Intl.DateTimeFormat("en-NP", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kathmandu",
});

const cardDate = new Intl.DateTimeFormat("en-NP", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Kathmandu",
});

export default async function Home() {
  let plays: Awaited<ReturnType<typeof getFeaturedPlays>> = [];
  let heroPlays: Awaited<ReturnType<typeof getHeroPlays>> = [];
  let shows: Awaited<ReturnType<typeof getUpcomingShows>> = [];
  let stats = { plays: 0, theatres: 0, bookings: 0, upcomingShows: 0 };

  try {
    [plays, heroPlays, shows, stats] = await Promise.all([
      getFeaturedPlays(),
      getHeroPlays(),
      getUpcomingShows(),
      getHomepageStats(),
    ]);
  } catch (error) {
    console.error("Unable to load landing-page data", error);
  }

  const heroImages = heroPlays.flatMap((play) => {
    const image = mediaUrl(play.coverImage);
    return image ? [image] : [];
  });

  const heroStats = [
    { value: stats.plays, label: "Published plays" },
    { value: stats.theatres, label: "Theatres" },
    { value: stats.upcomingShows, label: "Upcoming shows" },
    { value: stats.bookings, label: "Bookings" },
  ];

  const ctaImage = heroImages[0];

  return (
    <>
      <Hero images={heroImages} stats={heroStats} />

      <main>
        {/* ── 0. LIVE STAGE MARQUEE TICKER (Auto-scrolling Live Plays in Nepal) ── */}
        <LiveStageMarquee shows={shows} plays={plays} />

        {/* ── 1. FEATURED PLAYS (Curated Showcase) ── */}
        <section className="landing-section landing-featured site-container">
          <div className="landing-section-heading">
            <div>
              <span className="landing-kicker">Handpicked Stage Craft</span>
              <h2>Featured Plays &amp; Productions</h2>
              <p className="landing-section-subtext">
                Discover Nepal&apos;s most captivating dramas, musicals, and experimental stage performances.
              </p>
            </div>
            <Link href="/play/" className="landing-section-link-light">
              Browse all plays <span aria-hidden="true">→</span>
            </Link>
          </div>

          {plays.length ? (
            <div className="landing-play-grid">
              {plays.map((play, index) => {
                const image = mediaUrl(play.coverImage);
                const nextShow = play.shows[0];
                const teaser =
                  plainText(play.description).slice(0, index === 0 ? 160 : 110) ||
                  "Discover this production on TheatreHub.";
                const isSpotlight = index === 0;

                return (
                  <article
                    className={`landing-play-card ${isSpotlight ? "landing-play-card-spotlight" : ""}`}
                    key={play.id}
                  >
                    <Link className="landing-play-image" href={`/play/${play.slug}/`}>
                      {image ? (
                        <img src={image} alt={play.title} loading="lazy" />
                      ) : (
                        <div className="landing-image-empty">
                          <span>🎭</span>
                          <small>TheatreHub</small>
                        </div>
                      )}
                      <span className="landing-play-badges">
                        {isSpotlight && <span className="landing-featured-badge">⭐ Editor&apos;s Pick</span>}
                        {nextShow && <span className="landing-live-badge">● On Stage Now</span>}
                      </span>
                    </Link>

                    <div className="landing-play-copy">
                      <div className="landing-play-meta">
                        <span className="landing-tag-curated">{isSpotlight ? "Spotlight Production" : "Curated Show"}</span>
                        {nextShow && <span className="landing-tag-date">📅 {cardDate.format(nextShow.showtime)}</span>}
                      </div>

                      <h3>
                        <Link href={`/play/${play.slug}/`}>{play.title}</Link>
                      </h3>
                      <p>{teaser}</p>

                      <div className="landing-play-footer">
                        <Link className="landing-play-card-link" href={`/play/${play.slug}/`}>
                          View full production details <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="landing-empty">
              <h3>No featured plays published yet</h3>
              <p>Check back soon as theatre companies publish new stage productions.</p>
            </div>
          )}

          <div className="landing-view-all">
            <Link href="/play/">
              View all plays archive <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* ── 2. UPCOMING SHOWS (Stage Calendar & Tickets) ── */}
        <section className="landing-section landing-upcoming">
          <div className="landing-upcoming-orb" aria-hidden="true" />

          <div className="site-container">
            <div className="landing-section-heading landing-section-heading-light">
              <div>
                <span className="landing-kicker">Live Stage Calendar</span>
                <h2>Upcoming Shows &amp; Performances</h2>
                <p className="landing-section-copy">
                  Reserve your seats for live stage shows playing in Kathmandu, Pokhara, and across Nepal.
                </p>
              </div>
              <Link className="landing-section-link-light" href="/play/">
                Explore all dates <span aria-hidden="true">→</span>
              </Link>
            </div>

            {shows.length ? (
              <div className="landing-show-grid">
                {shows.map((show) => (
                  <article className="landing-show-card" key={show.id}>
                    <div className="landing-show-date-badge">
                      <strong>
                        {new Intl.DateTimeFormat("en-NP", {
                          day: "2-digit",
                          timeZone: "Asia/Kathmandu",
                        }).format(show.showtime)}
                      </strong>
                      <span>
                        {new Intl.DateTimeFormat("en-NP", {
                          month: "short",
                          timeZone: "Asia/Kathmandu",
                        }).format(show.showtime)}
                      </span>
                    </div>

                    <div className="landing-show-details">
                      <div className="landing-show-meta-line">
                        <span className="landing-show-time">🕒 {showTime.format(show.showtime)}</span>
                        <span className="landing-show-venue-tag">📍 {show.theatre.title}</span>
                      </div>

                      <h3>
                        <Link href={`/play/${show.play.slug}/`}>{show.play.title}</Link>
                      </h3>

                      <div className="landing-show-bottom">
                        {show.price != null ? (
                          <span className="landing-price-tag">From NPR {show.price.toLocaleString()}</span>
                        ) : (
                          <span className="landing-price-tag landing-price-free">Free Entry / RSVP</span>
                        )}

                        <Link href={`/play/${show.play.slug}/`} className="landing-show-book-btn">
                          View Show <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="landing-empty landing-empty-dark landing-schedule-empty">
                <div className="landing-empty-copy">
                  <span className="landing-kicker">Live Calendar Update</span>
                  <h3>No upcoming shows scheduled today</h3>
                  <p>
                    Theatre teams publish new show dates regularly. Create an account or reach out to list your upcoming play run.
                  </p>
                  <div className="landing-actions">
                    <Link className="about-btn about-btn-primary" href="/play/">
                      Explore Play Catalog
                    </Link>
                    <Link className="about-btn about-btn-ghost" href="/contact-us/">
                      List Your Show Dates
                    </Link>
                  </div>
                </div>

                <div className="landing-empty-points" aria-label="Upcoming show updates">
                  <span>
                    <strong>Performance Schedule</strong>
                    <small>Exact dates, showtime slots &amp; matinee runs</small>
                  </span>
                  <span>
                    <strong>Venue &amp; Seating</strong>
                    <small>Hall locations, stage styles &amp; capacity</small>
                  </span>
                  <span>
                    <strong>Ticket Pricing</strong>
                    <small>Real-time ticket rates and box office info</small>
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── 3. CTA SPOTLIGHT (Pure White Light Theme) ── */}
        <section className="landing-cta landing-cta-white">
          <div className="site-container landing-cta-inner">
            <div className="landing-cta-copy">
              <span className="landing-kicker">The Stage is Waiting</span>
              <h2>Find your next unforgettable performance.</h2>
              <p>
                Whether you are looking for tonight&apos;s performance, following your favorite venue,
                or writing about theatre — TheatreHub brings Nepal&apos;s stage community together.
              </p>

              <div className="landing-actions">
                <Link className="about-btn about-btn-primary about-btn-lg" href="/play/">
                  Explore Plays <span aria-hidden="true">→</span>
                </Link>
                <Link className="about-btn about-btn-outline about-btn-lg" href="/theatre/">
                  Find Venues Across Nepal
                </Link>
              </div>
            </div>

            <div className="landing-cta-showcase landing-cta-showcase-white">
              <div className="landing-cta-image">
                {ctaImage ? (
                  <img src={ctaImage} alt="TheatreHub stage preview" />
                ) : (
                  <div className="landing-cta-fallback">
                    <span>🎭</span>
                    <strong>TheatreHub Stage</strong>
                  </div>
                )}
                <div className="landing-cta-image-badge">Nepal Performing Arts</div>
              </div>

              <div className="landing-cta-grid">
                <article className="landing-cta-card">
                  <div className="landing-cta-card-header">
                    <span className="landing-cta-icon">🎟️</span>
                    <span className="landing-cta-tag">For Audience</span>
                  </div>
                  <h3>Pick a story</h3>
                  <p>Browse plays by genre, dates &amp; live activity.</p>
                </article>

                <article className="landing-cta-card">
                  <div className="landing-cta-card-header">
                    <span className="landing-cta-icon">🏛️</span>
                    <span className="landing-cta-tag">For Venues</span>
                  </div>
                  <h3>Explore spaces</h3>
                  <p>Discover theatre halls across Nepal.</p>
                </article>

                <article className="landing-cta-card">
                  <div className="landing-cta-card-header">
                    <span className="landing-cta-icon">✍️</span>
                    <span className="landing-cta-tag">For Writers</span>
                  </div>
                  <h3>Stage stories</h3>
                  <p>Read reviews, interviews &amp; essays.</p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
