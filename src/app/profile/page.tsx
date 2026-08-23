import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getArtistPhoto, plainText } from "@/lib/content";
import { PageFrame } from "@/components/SiteShell";

export const revalidate = 300;
export const dynamic = "force-dynamic";

// Retry helper for transient Neon DB cold starts & pool timeouts
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 600): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      const isTransient = code === "P1001" || code === "P2024";
      if (isTransient && attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #FF512F 0%, #DD2476 100%)",
  "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
  "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
  "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
  "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  "linear-gradient(135deg, #FF8008 0%, #FFC837 100%)",
  "linear-gradient(135deg, #4568DC 0%, #B06AB3 100%)",
  "linear-gradient(135deg, #D4145A 0%, #FBB03B 100%)",
  "linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)",
  "linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)",
];

function getAvatarStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

const PAGE_SIZE = 15;

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; role?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const roleFilter = params.role?.trim().toLowerCase() || "";
  const rawPage = Number(params.page);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  // Build filters
  const where: any = {
    status: "PUBLISHED",
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { bio: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
    ];
  }

  if (roleFilter === "actor") {
    where.castCredits = { some: {} };
  } else if (roleFilter === "director") {
    where.makerCredits = { some: {} };
  } else if (roleFilter === "crew") {
    where.crewCredits = { some: {} };
  }

  let totalCount = 0;
  let profiles: any[] = [];

  try {
    totalCount = await withRetry(() => prisma.profile.count({ where }));
    profiles = await withRetry(() =>
      prisma.profile.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          _count: {
            select: {
              castCredits: true,
              crewCredits: true,
              makerCredits: true,
            },
          },
        },
      })
    );
  } catch (error) {
    console.error("Database connection error on ArtistsPage:", error);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));


  return (
    <>
      {/* ── Artists Spotlight Hero ── */}
      <section className="artists-hero">
        <div className="site-container">
          <div className="artists-hero-content">
            <div className="artists-hero-badge-row">
              <span className="artists-hero-badge">
                <span>🎭</span> Nepal Stage Directory
              </span>
              <span className="artists-hero-stats-pill">
                <strong>{totalCount}</strong> Artists Registered
              </span>
            </div>

            <h1>Nepal&apos;s Theatre Artists &amp; Creators</h1>
            <p className="artists-hero-sub">
              Discover actors, directors, playwrights, stage designers, and crew defining Nepal&apos;s rich theatre heritage.
            </p>

            {/* Unified Search & Filter Control Row */}
            <div className="artists-control-row">
              {/* Search Bar (Left side) */}
              <form className="artists-search-bar" action="/profile/" method="GET">
                <div className="artists-search-input-wrap">
                  <svg className="artists-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Search artists..."
                    className="artists-search-input"
                  />
                  {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
                </div>
                <button type="submit" className="about-btn about-btn-primary search-submit-btn">
                  Search
                </button>
              </form>

              {/* Category Filter Tabs (Right side) */}
              <div className="artists-filter-tabs">
                <Link
                  href="/profile/"
                  className={`artists-tab ${!roleFilter ? "is-active" : ""}`}
                >
                  All Artists
                </Link>
                <Link
                  href={`/profile/?role=actor${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`artists-tab ${roleFilter === "actor" ? "is-active" : ""}`}
                >
                  🎭 Cast / Actors
                </Link>
                <Link
                  href={`/profile/?role=director${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`artists-tab ${roleFilter === "director" ? "is-active" : ""}`}
                >
                  🎬 Directors &amp; Playmakers
                </Link>
                <Link
                  href={`/profile/?role=crew${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`artists-tab ${roleFilter === "crew" ? "is-active" : ""}`}
                >
                  🛠️ Stage &amp; Crew
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageFrame>
        {/* ── Main Artists Grid Results Header ── */}
        <div className="artists-results-header">
          <div className="artists-results-title">
            <h2>
              {roleFilter
                ? `${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)} Profiles`
                : "All Stage Artists"}
            </h2>
            <p className="artists-count-text">
              Showing <strong>{profiles.length}</strong> of <strong>{totalCount}</strong> practitioners
              {query && <span> matching &ldquo;{query}&rdquo;</span>}
            </p>
          </div>

          {(query || roleFilter) && (
            <Link href="/profile/" className="about-btn about-btn-ghost clear-filters-btn">
              ✕ Reset Filters
            </Link>
          )}
        </div>

        {/* ── Artists Grid ── */}
        {profiles.length > 0 ? (
          <>
            <div className="artists-grid">
              {profiles.map((artist) => {
                const image = getArtistPhoto(artist);
                const bgGradient = getAvatarStyle(artist.name);

                const castCount = artist._count.castCredits;
                const makerCount = artist._count.makerCredits;
                const crewCount = artist._count.crewCredits;
                const totalCredits = castCount + makerCount + crewCount;

                // Role badges
                const tags: { label: string; icon: string }[] = [];
                if (makerCount > 0) tags.push({ label: "Director / Playmaker", icon: "🎬" });
                if (castCount > 0) tags.push({ label: "Actor / Cast", icon: "🎭" });
                if (crewCount > 0) tags.push({ label: "Crew Member", icon: "🛠️" });
                if (tags.length === 0) tags.push({ label: "Theatre Practitioner", icon: "♟️" });

                return (
                  <div key={artist.id} className="artist-card">
                    {/* Card Header Banner */}
                    <div className="artist-card-header">
                      <div className="artist-card-backdrop" style={{ background: bgGradient }} />
                      <Link
                        href={`/profile/${artist.slug || artist.id}/`}
                        className="artist-card-avatar-container"
                        aria-label={`View ${artist.name}'s profile`}
                      >
                        <img
                          src={image}
                          alt={artist.name}
                          className="artist-card-avatar-img"
                        />
                      </Link>
                    </div>

                    {/* Card Body */}
                    <div className="artist-card-body">
                      <div className="artist-card-title-row">
                        <h3 className="artist-card-name">
                          <Link href={`/profile/${artist.slug || artist.id}/`}>
                            {artist.name}
                          </Link>
                        </h3>
                        {tags.length > 0 && (
                          <span className="artist-role-tag">
                            <span>{tags[0].icon}</span> {tags[0].label}
                          </span>
                        )}
                      </div>

                      {artist.address && (
                        <span className="artist-location-pill">📍 {artist.address}</span>
                      )}

                      <p className="artist-card-bio">
                        {artist.bio
                          ? plainText(artist.bio).slice(0, 105) + "..."
                          : `Stage practitioner contributing to Nepal's living theatre arts.`}
                      </p>

                      {/* Card Footer */}
                      <div className="artist-card-footer">
                        <div className="artist-credits-count">
                          <span className="credits-icon">🎭</span>
                          <strong>{totalCredits}</strong> {totalCredits === 1 ? "credit" : "credits"}
                        </div>

                        <Link
                          href={`/profile/${artist.slug || artist.id}/`}
                          className="artist-profile-btn"
                        >
                          View Profile <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── High-Visibility Pagination Navigation ── */}
            {totalPages > 1 && (
              <nav className="artists-pagination-nav" aria-label="Pagination Navigation">
                <div className="artists-pagination-controls">
                  {/* Previous Button */}
                  {page > 1 ? (
                    <Link
                      href={`/profile/?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
                      className="pagination-btn pagination-nav-btn"
                    >
                      <span aria-hidden="true">←</span> Previous
                    </Link>
                  ) : (
                    <span className="pagination-btn pagination-nav-btn is-disabled" aria-disabled="true">
                      <span aria-hidden="true">←</span> Previous
                    </span>
                  )}

                  {/* Page Numbers */}
                  <div className="pagination-page-numbers">
                    {(() => {
                      let start = Math.max(1, page - 1);
                      if (start + 2 > totalPages) {
                        start = Math.max(1, totalPages - 2);
                      }
                      const visiblePages = Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => start + i
                      );
                      return visiblePages.map((p) => (
                        <Link
                          key={p}
                          href={`/profile/?page=${p}${query ? `&q=${encodeURIComponent(query)}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
                          className={`pagination-num-btn ${p === page ? "is-active" : ""}`}
                          aria-current={p === page ? "page" : undefined}
                        >
                          {p}
                        </Link>
                      ));
                    })()}
                  </div>

                  {/* Next Button */}
                  {page < totalPages ? (
                    <Link
                      href={`/profile/?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
                      className="pagination-btn pagination-nav-btn"
                    >
                      Next <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <span className="pagination-btn pagination-nav-btn is-disabled" aria-disabled="true">
                      Next <span aria-hidden="true">→</span>
                    </span>
                  )}
                </div>

                <div className="pagination-status-pill">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </div>
              </nav>
            )}
          </>
        ) : (
          <div className="landing-empty artists-empty">
            <div className="empty-icon">🎭</div>
            <h2>No artists found</h2>
            <p>
              {query
                ? `No theatre practitioners matching "${query}".`
                : "No artist profiles available matching the selected filter."}
            </p>
            <Link href="/profile/" className="about-btn about-btn-primary">
              Clear All Filters
            </Link>
          </div>
        )}
      </PageFrame>
    </>
  );
}
