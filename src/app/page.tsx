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

const playDateRangeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Asia/Kathmandu",
});

function renderPlayHeaderTitle(title: string) {
  const match = title.match(/^(.*?)\s*(\(.*\))$/);
  if (match) {
    return (
      <>
        <span className="landing-play-title-primary">{match[1]}</span>{" "}
        <span className="landing-play-title-secondary">{match[2]}</span>
      </>
    );
  }
  return <span className="landing-play-title-primary">{title}</span>;
}

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
              {plays.filter(play => play.slug).map((play) => {
                const image = mediaUrl(play.coverImage);
                const nextShow = play.shows[0];
                const teaser =
                  plainText(play.description).slice(0, 140) ||
                  "Discover this production on TheatreHub.";

                const directorMaker = play.makers?.find(m =>
                  /director|direction|design/i.test(m.role)
                ) || play.makers?.[0];

                const asstMaker = play.makers?.find(m =>
                  m !== directorMaker && (/asst|translation|assistant|writer|author/i.test(m.role))
                ) || play.makers?.find(m => m !== directorMaker);

                const stagedFrom = play.launchedOn ? playDateRangeFormatter.format(new Date(play.launchedOn)) : null;
                const stagedTo = play.endedOn ? playDateRangeFormatter.format(new Date(play.endedOn)) : null;

                let dateLine = "";
                if (stagedFrom && stagedTo) {
                  dateLine = `Staged from ${stagedFrom} to ${stagedTo}`;
                } else if (stagedFrom) {
                  dateLine = `Staged from ${stagedFrom}`;
                } else if (nextShow) {
                  dateLine = `Next show: ${cardDate.format(new Date(nextShow.showtime))}`;
                } else if (play.theatre) {
                  dateLine = `Venue: ${play.theatre.title}`;
                } else {
                  dateLine = "Featured Production";
                }

                return (
                  <article className="landing-play-card" key={play.id}>
                    <div className="landing-card-top-bar" aria-hidden="true" />

                    {/* Top Split Section: Poster Image + Header Details */}
                    <div className="landing-play-card-top">
                      <Link className="landing-play-poster-wrap" href={`/play/${play.slug}/`}>
                        {image ? (
                          <img src={image} alt={play.title} loading="lazy" />
                        ) : (
                          <div className="landing-image-empty">
                            <span>🎭</span>
                            <small>TheatreHub</small>
                          </div>
                        )}
                      </Link>

                      <div className="landing-play-header-details">
                        <h3 className="landing-play-header-title">
                          <Link href={`/play/${play.slug}/`}>
                            {renderPlayHeaderTitle(play.title)}
                          </Link>
                        </h3>

                        <div className="landing-play-divider" />

                        <div className="landing-play-credits-list">
                          <div className="landing-credit-row">

                            <div className="landing-credit-text">
                              <span className="landing-credit-label">
                                {directorMaker ? directorMaker.role : "Design and Direction"}:
                              </span>{" "}
                              <strong className="landing-credit-value">
                                {directorMaker ? directorMaker.profile?.name : (play.theatre?.title || "TheatreHub")}
                              </strong>
                            </div>
                          </div>

                          {asstMaker && (
                            <div className="landing-credit-row">

                              <div className="landing-credit-text">
                                <span className="landing-credit-label">{asstMaker.role}:</span>{" "}
                                <strong className="landing-credit-value">{asstMaker.profile?.name}</strong>
                              </div>
                            </div>
                          )}

                          <div className="landing-credit-row landing-credit-date-row">

                            <div className="landing-credit-text">
                              <span className="landing-credit-date">{dateLine}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section: Badge, Title, Teaser & Read More Button */}
                    <div className="landing-play-card-body">
                      <div className="landing-play-badge-wrap">
                        <span className="landing-play-pill-tag">
                          <span className="landing-badge-dot" aria-hidden="true" />
                          PUBLISHED PLAY
                        </span>
                      </div>

                      <h4 className="landing-play-body-title">
                        <Link href={`/play/${play.slug}/`}>{play.title}</Link>
                      </h4>

                      <p className="landing-play-body-teaser">{teaser}</p>

                      <div className="landing-play-card-action">
                        <Link className="landing-play-read-more" href={`/play/${play.slug}/`}>
                          <span>Read more</span>
                          <span className="landing-read-circle" aria-hidden="true">→</span>
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
                {shows.filter(show => show.play.slug).map((show) => (
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
