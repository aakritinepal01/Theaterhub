import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheatrePhoto, mediaUrl, publishedWhere } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { PageFrame } from "@/components/SiteShell";

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
  year: "numeric",
  timeZone: "Asia/Kathmandu",
});

export default async function TheatrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const now = new Date();

  const theatre = await prisma.theatre.findUnique({
    where: { slug },
    include: {
      shows: {
        where: { showtime: { gt: now }, play: publishedWhere(now) },
        orderBy: { showtime: "asc" },
        include: { play: true },
      },
      plays: {
        where: publishedWhere(now),
        take: 6,
        orderBy: { title: "asc" },
      },
    },
  });

  if (!theatre) notFound();

  const coverImg = mediaUrl(theatre.coverImage) ?? getTheatrePhoto(theatre);
  const profilePic = mediaUrl(theatre.profilePic) ?? getTheatrePhoto(theatre);
  const establishedYear = theatre.establishedOn
    ? new Date(theatre.establishedOn).getFullYear()
    : null;

  const socialLinks = [
    { name: "Website", url: theatre.linkWebsite, icon: "🌐" },
    { name: "Facebook", url: theatre.linkFacebook, icon: "📘" },
    { name: "Instagram", url: theatre.linkInstagram, icon: "📷" },
    { name: "Twitter", url: theatre.linkTwitter, icon: "🐦" },
  ].filter((s) => Boolean(s.url));

  return (
    <>
      {/* Venue Header Banner */}
      <section className="theatre-single-hero">
        {coverImg ? (
          <div className="theatre-hero-bg">
            <img src={coverImg} alt="" aria-hidden="true" />
            <div className="theatre-hero-overlay" />
          </div>
        ) : (
          <div className="theatre-hero-bg theatre-hero-bg-fallback" />
        )}

        <div className="site-container theatre-single-hero-inner">
          <div className="theatre-single-brand">
            {profilePic ? (
              <img className="theatre-single-avatar" src={profilePic} alt={theatre.title} />
            ) : (
              <div className="theatre-single-avatar-fallback">🎭</div>
            )}

            <div className="theatre-single-title-box">
              <div className="theatre-single-badges">
                {theatre.shows.length > 0 ? (
                  <span className="theatre-live-badge">● Stage Live ({theatre.shows.length} shows)</span>
                ) : (
                  <span className="theatre-listed-badge">Listed Venue</span>
                )}
                {establishedYear && <span className="theatre-year-badge">Est. {establishedYear}</span>}
              </div>

              <h1>{theatre.title}</h1>
              {theatre.address && <p className="theatre-single-location">📍 {theatre.address}</p>}
            </div>
          </div>

          <div className="theatre-single-actions">
            {theatre.phone && (
              <a href={`tel:${theatre.phone}`} className="about-btn about-btn-ghost">
                📞 {theatre.phone}
              </a>
            )}
            {theatre.email && (
              <a href={`mailto:${theatre.email}`} className="about-btn about-btn-primary">
                ✉️ Contact Venue
              </a>
            )}
          </div>
        </div>
      </section>

      <PageFrame>
        <div className="theatre-single-grid">
          {/* Main Content Area */}
          <main className="theatre-single-main">
            {/* Upcoming Shows at this venue */}
            <section className="theatre-single-section">
              <div className="theatre-section-title">
                <h2>Upcoming Performances</h2>
                <span>{theatre.shows.length} shows scheduled</span>
              </div>

              {theatre.shows.length > 0 ? (
                <div className="theatre-shows-list">
                  {theatre.shows.map((show) => {
                    const playImage = mediaUrl(show.play.coverImage);
                    return (
                      <article className="theatre-show-item" key={show.id}>
                        <div className="theatre-show-date-badge">
                          <strong>
                            {new Intl.DateTimeFormat("en-NP", { day: "2-digit", timeZone: "Asia/Kathmandu" }).format(
                              show.showtime
                            )}
                          </strong>
                          <span>
                            {new Intl.DateTimeFormat("en-NP", { month: "short", timeZone: "Asia/Kathmandu" }).format(
                              show.showtime
                            )}
                          </span>
                        </div>

                        {playImage && (
                          <div className="theatre-show-img">
                            <img src={playImage} alt={show.play.title} />
                          </div>
                        )}

                        <div className="theatre-show-info">
                          <span className="theatre-show-time">🕒 {showTime.format(show.showtime)}</span>
                          <h3>
                            <Link href={`/play/${show.play.slug}/`}>{show.play.title}</Link>
                          </h3>
                          <p>{cardDate.format(show.showtime)}</p>
                          {show.price != null && (
                            <span className="theatre-show-price">Tickets: NPR {show.price.toLocaleString()}</span>
                          )}
                        </div>

                        <div className="theatre-show-action">
                          <Link href={`/play/${show.play.slug}/`} className="about-btn about-btn-primary">
                            View Show
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="landing-empty" style={{ margin: "20px 0" }}>
                  <h3>No upcoming shows scheduled</h3>
                  <p>There are no live performances currently listed for {theatre.title}. Check back soon!</p>
                </div>
              )}
            </section>

            {/* About / Description */}
            <section className="theatre-single-section">
              <div className="theatre-section-title">
                <h2>About the Venue</h2>
              </div>
              <div className="theatre-about-content">
                {theatre.about ? (
                  <div dangerouslySetInnerHTML={{ __html: theatre.about }} />
                ) : theatre.description ? (
                  <p>{theatre.description}</p>
                ) : (
                  <p>No detailed overview has been published for &quot;{theatre.title}&quot; yet.</p>
                )}
              </div>
            </section>

            {/* Stage Productions Archive */}
            {theatre.plays.length > 0 && (
              <section className="theatre-single-section">
                <div className="theatre-section-title">
                  <h2>Productions Staged Here</h2>
                </div>

                <div className="theatre-plays-grid">
                  {theatre.plays.map((play) => {
                    const img = mediaUrl(play.coverImage);
                    return (
                      <Link href={`/play/${play.slug}/`} key={play.id} className="theatre-play-mini-card">
                        {img ? <img src={img} alt={play.title} /> : <div className="theatre-play-mini-empty">🎭</div>}
                        <span>{play.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Venue Amenities */}
            <section className="theatre-single-section">
              <div className="theatre-section-title">
                <h2>Venue Features &amp; Amenities</h2>
              </div>
              <div className="theatre-amenities-grid">
                <div className="theatre-amenity">
                  <span>🎭</span>
                  <div>
                    <strong>Staging Facilities</strong>
                    <small>Dedicated stage lighting &amp; acoustic setup</small>
                  </div>
                </div>
                <div className="theatre-amenity">
                  <span>🎟️</span>
                  <div>
                    <strong>Box Office Desk</strong>
                    <small>On-site ticket sales and reservations</small>
                  </div>
                </div>
                <div className="theatre-amenity">
                  <span>🚗</span>
                  <div>
                    <strong>Parking &amp; Access</strong>
                    <small>Accessible location with parking nearby</small>
                  </div>
                </div>
                <div className="theatre-amenity">
                  <span>☕</span>
                  <div>
                    <strong>Concessions &amp; Lounge</strong>
                    <small>Pre-show waiting lounge &amp; refreshment counter</small>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="theatre-single-sidebar">
            <div className="contact-info-card">
              <h3>Venue Info</h3>
              <ul className="contact-info-list">
                {theatre.address && (
                  <li>
                    <span className="contact-info-label">Address</span>
                    <strong>{theatre.address}</strong>
                  </li>
                )}
                {theatre.phone && (
                  <li>
                    <span className="contact-info-label">Phone</span>
                    <a href={`tel:${theatre.phone}`}>{theatre.phone}</a>
                  </li>
                )}
                {theatre.email && (
                  <li>
                    <span className="contact-info-label">Email</span>
                    <a href={`mailto:${theatre.email}`}>{theatre.email}</a>
                  </li>
                )}
                {establishedYear && (
                  <li>
                    <span className="contact-info-label">Established</span>
                    <strong>{establishedYear}</strong>
                  </li>
                )}
              </ul>
            </div>

            {socialLinks.length > 0 && (
              <div className="contact-social-card">
                <h3>Connect with {theatre.title}</h3>
                <div className="theatre-social-buttons">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="theatre-social-btn"
                    >
                      <span>{s.icon}</span>
                      <span>{s.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="contact-info-card">
              <h3>Are you the venue manager?</h3>
              <p style={{ margin: "0 0 14px", color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
                Update your theatre info, add show dates, or update seating capacity.
              </p>
              <Link href="/contact-us/" className="about-btn about-btn-outline" style={{ width: "100%" }}>
                Claim or Update Venue
              </Link>
            </div>
          </aside>
        </div>
      </PageFrame>
    </>
  );
}
