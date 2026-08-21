import { ContentStatus } from "@prisma/client";
import Link from "next/link";
import { mediaUrl, plainText, publishedWhere } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { PageFrame } from "@/components/SiteShell";

export const revalidate = 300;

const PAGE_SIZE = 9;

const showTime = new Intl.DateTimeFormat("en-NP", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kathmandu",
});

const nextShowDate = new Intl.DateTimeFormat("en-NP", {
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Kathmandu",
});

const STAGE_TYPES = [
  {
    title: "Proscenium Stages",
    icon: "🎭",
    description: "Classic framed stages with grand curtain lines, elevated stages, and tiered auditorium seating.",
    examples: "Rastriya Nachghar, Nepal Academy",
  },
  {
    title: "Black Box Studios",
    icon: "⬛",
    description: "Intimate, reconfigurable experimental spaces bringing actors and audience closer than ever.",
    examples: "Shilpee Theatre, Mandala Studio, Kausi Theatre",
  },
  {
    title: "Traditional Dabali",
    icon: "🏛️",
    description: "Open-air Newari stone platforms built into historic squares for community theatrical festivals.",
    examples: "Patan Dabali, Bhaktapur Squares",
  },
  {
    title: "Community Hubs",
    icon: "🌿",
    description: "Multipurpose cultural spaces hosting indie plays, play-readings, drama workshops, and rehearsals.",
    examples: "Aarohan Gurukul, Independent Halls",
  },
];

export default async function Theatres({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const rawPage = Number(params.page);
  const query = params.q?.trim() || "";
  const requested = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const now = new Date();

  const baseWhere = { status: ContentStatus.PUBLISHED };
  const searchFilter = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { address: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const where = { ...baseWhere, ...searchFilter };
  const liveWhere = { showtime: { gt: now }, play: publishedWhere(now) };

  const [totalCount, activeVenues, upcomingShows, filteredCount] = await Promise.all([
    prisma.theatre.count({ where: baseWhere }),
    prisma.theatre.count({ where: { ...baseWhere, shows: { some: liveWhere } } }),
    prisma.show.count({ where: { ...liveWhere, theatre: baseWhere } }),
    prisma.theatre.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const page = Math.min(requested, pages);

  const theatres = await prisma.theatre.findMany({
    where,
    orderBy: { title: "asc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      shows: {
        where: liveWhere,
        orderBy: { showtime: "asc" },
        take: 1,
        include: { play: true },
      },
    },
  });

  return (
    <>
      {/* Hero Header */}
      <header className="theatre-index-hero">
        <div className="theatre-hero-orb theatre-hero-orb-1" aria-hidden="true" />
        <div className="theatre-hero-orb theatre-hero-orb-2" aria-hidden="true" />

        <div className="site-container play-index-hero-inner">
          <div className="play-index-copy">
            <div className="about-hero-pill">
              <span className="about-hero-pill-dot" />
              <span>Nepal Venue Directory</span>
            </div>
            <h1>Theatres &amp; Performance Spaces</h1>
            <p>
              Explore Nepal&apos;s iconic auditoriums, intimate black box studios, and historic open-air
              stages where stories come alive every night.
            </p>

            <div className="play-index-actions">
              <Link href="/play/" className="about-btn about-btn-primary">
                Browse plays <span aria-hidden="true">→</span>
              </Link>
              <Link href="/contact-us/" className="about-btn about-btn-ghost">
                Register a venue
              </Link>
            </div>
          </div>

          <div className="play-index-stats" aria-label="Theatre directory statistics">
            <div className="theatre-stat-box">
              <strong>{totalCount}</strong>
              <small>Listed Theatres</small>
            </div>
            <div className="theatre-stat-box">
              <strong>{activeVenues}</strong>
              <small>Active Stages</small>
            </div>
            <div className="theatre-stat-box">
              <strong>{upcomingShows}</strong>
              <small>Upcoming Shows</small>
            </div>
          </div>
        </div>
      </header>

      <PageFrame fullWidth>
        {/* Toolbar & Search */}
        <section className="play-index-toolbar theatre-index-toolbar" aria-label="Theatre directory view">
          <div>
            <strong>Venue Directory</strong>
            <span>
              {filteredCount
                ? `Showing ${theatres.length} of ${filteredCount} theatre venues`
                : "No theatres match your search"}
            </span>
          </div>

          <div className="theatre-search-wrap">
            <form action="/theatre/" method="GET" className="theatre-search-form">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search venue or location..."
                className="theatre-search-input"
              />
              {query && (
                <Link href="/theatre/" className="theatre-search-clear" title="Clear search">
                  ✕
                </Link>
              )}
              <button type="submit" className="theatre-search-btn">
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Theatres Grid */}
        {theatres.length ? (
          <div className="play-list-grid play-list-grid-animated theatre-list-grid">
            {theatres.map((theatre) => {
              const image = mediaUrl(theatre.coverImage || theatre.profilePic);
              const nextShow = theatre.shows[0];
              const summary =
                plainText(theatre.description || theatre.about) ||
                "Discover this theatre venue on TheatreHub.";
              const establishedYear = theatre.establishedOn
                ? new Date(theatre.establishedOn).getFullYear()
                : null;

              return (
                <article className="play-list-card theatre-card" key={theatre.id}>
                  <Link className="play-list-image theatre-list-image" href={`/theatre/${theatre.slug}/`}>
                    {image ? (
                      <img src={image} alt={theatre.title} loading="lazy" />
                    ) : (
                      <div className="theatre-empty-image">
                        <span>🎭</span>
                        <small>{theatre.title}</small>
                      </div>
                    )}
                    <span className="theatre-card-badges">
                      {nextShow ? (
                        <span className="theatre-live-badge">● Stage Live</span>
                      ) : (
                        <span className="theatre-listed-badge">Venue</span>
                      )}
                      {establishedYear && (
                        <span className="theatre-year-badge">Est. {establishedYear}</span>
                      )}
                    </span>
                  </Link>

                  <div className="play-list-copy theatre-list-copy">
                    <div className="play-list-meta">
                      {theatre.address ? (
                        <span className="theatre-location-pin">📍 {theatre.address}</span>
                      ) : (
                        <span>Nepal</span>
                      )}
                    </div>

                    <h3>
                      <Link href={`/theatre/${theatre.slug}/`}>{theatre.title}</Link>
                    </h3>
                    <p>{summary.slice(0, 120)}{summary.length > 120 ? "…" : ""}</p>

                    {/* Next Show Preview Card */}
                    {nextShow && (
                      <div className="theatre-next-show-box">
                        <div className="theatre-next-show-header">
                          <span className="theatre-next-label">Next Performance</span>
                          <span className="theatre-next-date">{nextShowDate.format(nextShow.showtime)}</span>
                        </div>
                        <strong className="theatre-next-title">
                          <Link href={`/play/${nextShow.play.slug}/`}>{nextShow.play.title}</Link>
                        </strong>
                        <span className="theatre-next-time">{showTime.format(nextShow.showtime)}</span>
                      </div>
                    )}

                    <div className="theatre-card-footer">
                      <Link className="play-read-more" href={`/theatre/${theatre.slug}/`}>
                        Explore venue <span aria-hidden="true">→</span>
                      </Link>
                      {theatre.phone && (
                        <a href={`tel:${theatre.phone}`} className="theatre-phone-link" title={`Call ${theatre.phone}`}>
                          📞 {theatre.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="landing-empty play-index-empty">
            <h3>No theatres found</h3>
            <p>Try clearing your search query or check back soon for new venue listings.</p>
            <Link href="/theatre/" className="about-btn about-btn-primary" style={{ marginTop: 16 }}>
              Reset search
            </Link>
          </div>
        )}

        {/* Pagination */}
        {filteredCount > PAGE_SIZE && (
          <nav className="pagination play-index-pagination" aria-label="Theatre pages">
            {Array.from({ length: pages }, (_, index) => {
              const item = index + 1;
              const href = query ? `/theatre/?q=${encodeURIComponent(query)}&page=${item}` : `/theatre/?page=${item}`;
              return item === page ? (
                <span className="is-active" aria-current="page" key={item}>
                  {item}
                </span>
              ) : (
                <Link key={item} href={href}>
                  {item}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Stage Types Guide Section */}
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

        {/* Venue Owner CTA */}
        <section className="theatre-register-cta">
          <div className="theatre-cta-box">
            <div className="theatre-cta-text">
              <p className="landing-kicker">For Stage Managers</p>
              <h2>Do you operate a theatre space or auditorium?</h2>
              <p>
                List your venue on TheatreHub to reach thousands of theatre-goers, display your upcoming show dates,
                and manage booking announcements in one central hub.
              </p>
            </div>
            <div className="theatre-cta-actions">
              <Link href="/contact-us/" className="about-btn about-btn-primary about-btn-lg">
                Register Your Venue
              </Link>
            </div>
          </div>
        </section>
      </PageFrame>
    </>
  );
}
