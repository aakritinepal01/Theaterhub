import Link from "next/link";
import { publishedWhere } from "@/lib/content";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PlayCard } from "@/components/PlayCard";
import { PlaysFilterSidebar } from "@/components/PlaysFilterSidebar";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

type PlayListItem = Prisma.PlayGetPayload<{
  include: {
    shows: true;
    theatre: true;
    makers: { include: { profile: true } };
  };
}>;

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

export default async function Plays({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    theatre?: string;
    filter?: string;
    duration?: string;
    rating?: string;
    featured?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;

  // ── Parse query params ──────────────────────────────────────────
  const raw = Number(params.page);
  const requested = Number.isInteger(raw) && raw > 0 ? raw : 1;

  const selectedTheatreId = Number(params.theatre);
  const theatreId =
    Number.isInteger(selectedTheatreId) && selectedTheatreId > 0 ? selectedTheatreId : null;

  const selectedFilter =
    params.filter === "showing" || params.filter === "archive" ? params.filter : "all";

  const selectedDuration =
    params.duration === "short" || params.duration === "medium" || params.duration === "long"
      ? params.duration
      : "";

  const selectedRating =
    params.rating === "2" || params.rating === "3" || params.rating === "4"
      ? params.rating
      : "";

  const selectedFeatured =
    params.featured === "yes" || params.featured === "with-image" ? params.featured : "";

  const selectedPlayType =
    params.type === "storytelling" || params.type === "theatre" ? params.type : "";

  // ── Build Prisma where clause ───────────────────────────────────
  const now = new Date();
  const base = publishedWhere(now);

  const durationRange: { gte?: number; lte?: number; gt?: number } | undefined =
    selectedDuration === "short"
      ? { lte: 60 }
      : selectedDuration === "medium"
      ? { gte: 60, lte: 120 }
      : selectedDuration === "long"
      ? { gt: 120 }
      : undefined;

  const ratingMin = selectedRating ? Number(selectedRating) : null;

  const storytellingWhere = {
    OR: [
      { title: { contains: "storytelling", mode: "insensitive" } },
      { metaTitle: { contains: "storytelling", mode: "insensitive" } },
      { description: { contains: "storytelling", mode: "insensitive" } },
      { abstract: { contains: "storytelling", mode: "insensitive" } },
      { directorialNote: { contains: "storytelling", mode: "insensitive" } },
      { keywordsString: { contains: "storytelling", mode: "insensitive" } },
    ],
  } satisfies Prisma.PlayWhereInput;

  const playTypeWhere: Prisma.PlayWhereInput =
    selectedPlayType === "storytelling"
      ? storytellingWhere
      : selectedPlayType === "theatre"
      ? { NOT: storytellingWhere }
      : {};

  const filteredWhere: Prisma.PlayWhereInput = {
    ...base,
    ...(theatreId ? { theatreId } : {}),
    ...(selectedFilter === "showing" ? { shows: { some: { showtime: { gt: now } } } } : {}),
    ...(selectedFilter === "archive" ? { shows: { none: { showtime: { gt: now } } } } : {}),
    ...(durationRange ? { duration: durationRange } : {}),
    ...(ratingMin ? { ratingAverage: { gte: ratingMin } } : {}),
    ...(selectedFeatured === "yes" ? { isFeatured: true } : {}),
    ...(selectedFeatured === "with-image" ? { coverImage: { not: null } } : {}),
    ...playTypeWhere,
  };

  // ── Fetch data ──────────────────────────────────────────────────
  let count = 86;
  let totalTheatres = 25;
  let totalShows = 858;
  let plays: PlayListItem[] = [];
  let theatres: { id: number; title: string }[] = [];

  try {
    const [c, tt, ts, theatreOptions] = await Promise.all([
      withRetry(() => prisma.play.count({ where: filteredWhere })).catch(() => 86),
      withRetry(() => prisma.theatre.count({ where: { status: "PUBLISHED" } })).catch(() => 25),
      withRetry(() => prisma.show.count()).catch(() => 858),
      withRetry(() =>
        prisma.theatre.findMany({
          where: { status: "PUBLISHED" },
          select: { id: true, title: true },
          orderBy: { title: "asc" },
        })
      ).catch(() => []),
    ]);
    count = c;
    totalTheatres = tt;
    totalShows = ts;
    theatres = theatreOptions;

    const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    const page = Math.min(requested, pages);

    plays = await withRetry(() =>
      prisma.play.findMany({
        where: filteredWhere,
        orderBy: { launchedOn: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          shows: { where: { showtime: { gt: now } }, take: 1 },
          theatre: true,
          makers: {
            include: { profile: true },
            orderBy: { order: "asc" },
          },
        },
      })
    );
  } catch (error) {
    console.error("Database connection error on Plays page:", error);
  }

  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const page = Math.min(requested, pages);
  const runningPlays = plays.filter((play) => play.shows?.length > 0);
  const archivedPlays = plays.filter((play) => !play.shows?.length);

  const hasFilters =
    !!theatreId ||
    selectedFilter !== "all" ||
    !!selectedDuration ||
    !!selectedRating ||
    !!selectedFeatured ||
    !!selectedPlayType;

  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (theatreId) query.set("theatre", String(theatreId));
    if (selectedFilter !== "all") query.set("filter", selectedFilter);
    if (selectedDuration) query.set("duration", selectedDuration);
    if (selectedRating) query.set("rating", selectedRating);
    if (selectedFeatured) query.set("featured", selectedFeatured);
    if (selectedPlayType) query.set("type", selectedPlayType);
    if (nextPage > 1) query.set("page", String(nextPage));
    const queryString = query.toString();
    return `/play/${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <div className="play-page-unified-container">
      {/* ── Play Index Hero ── */}
      <header className="play-index-hero">
        <div className="site-container play-index-hero-inner">
          <div className="play-index-copy">
            <div className="play-hero-badge">
              <span className="hero-badge-icon">🎭</span>
              <span>Nepal Stage Archive &amp; Repertory</span>
            </div>
            <h1 className="play-hero-title">
              Stories from Nepal&apos;s <span className="play-hero-gradient">Living Stage</span>
            </h1>
            <p className="play-hero-sub">
              Explore timeless classics, groundbreaking contemporary plays, and festival productions
              shaping Nepal&apos;s theatrical history.
            </p>
            <div className="play-index-actions">
              <Link href="/theatre/" className="about-btn about-btn-primary">
                Find theatres <span aria-hidden="true">→</span>
              </Link>
              <Link href="/blog/" className="about-btn about-btn-ghost">
                Read stage stories 📖
              </Link>
            </div>
          </div>

          <div className="play-bento-stats" aria-label="Play archive statistics">
            <div className="bento-stat-card">
              <div className="bento-stat-icon">🎭</div>
              <div className="bento-stat-text">
                <strong>{count}+</strong>
                <small>Documented Plays</small>
              </div>
            </div>
            <div className="bento-stat-card">
              <div className="bento-stat-icon">🏛️</div>
              <div className="bento-stat-text">
                <strong>{totalTheatres}</strong>
                <small>Performance Spaces</small>
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

      {/* ── Main Content ── */}
      <main className="site-container play-main-content">
        {/* Toolbar */}
        <section className="play-index-toolbar" aria-label="Play archive view">
          <div>
            <strong>Newest productions</strong>
            <span>{count ? `Showing ${plays.length} of ${count}` : "No plays published yet"}</span>
          </div>
          <div className="play-index-chips">
            <span>Latest first</span>
            <span>Page {page} of {pages}</span>
            {hasFilters && (
              <Link href="/play/" className="play-filter-reset-inline">
                ✕ Clear filters
              </Link>
            )}
          </div>
        </section>

        {/* Two-column layout: Sidebar + Grid */}
        <div className="play-browse-layout">
          {/* Filter sidebar (client component) */}
          <PlaysFilterSidebar
            theatres={theatres}
            selectedTheatreId={theatreId}
            selectedFilter={selectedFilter}
            selectedDuration={selectedDuration}
            selectedRating={selectedRating}
            selectedFeatured={selectedFeatured}
            selectedPlayType={selectedPlayType}
          />

          {/* Play grid */}
          <div className="play-browse-results">
            {selectedFilter === "all" && !hasFilters ? (
              <div className="play-collections">
                <section className="play-collection-section" aria-labelledby="running-plays-title">
                  <div className="play-collection-heading">
                    <div>
                      <span className="play-collection-kicker">On stage now</span>
                      <h2 id="running-plays-title">Currently Running Plays</h2>
                    </div>
                    <span>
                      {runningPlays.length} production{runningPlays.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {runningPlays.length ? (
                    <div className="landing-play-grid play-list-grid-animated">
                      {runningPlays.map((play) => (
                        <PlayCard key={play.id} play={play} />
                      ))}
                    </div>
                  ) : (
                    <div className="play-collection-empty">No currently running plays found.</div>
                  )}
                </section>

                <section className="play-collection-section play-archive-section" aria-labelledby="archive-plays-title">
                  <div className="play-collection-heading">
                    <div>
                      <span className="play-collection-kicker">Past productions</span>
                      <h2 id="archive-plays-title">Play Archive</h2>
                    </div>
                    <span>
                      {archivedPlays.length} production{archivedPlays.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {archivedPlays.length ? (
                    <div className="landing-play-grid play-list-grid-animated">
                      {archivedPlays.map((play) => (
                        <PlayCard key={play.id} play={play} teaserLength={95} />
                      ))}
                    </div>
                  ) : (
                    <div className="play-collection-empty">No archived plays found.</div>
                  )}
                </section>
              </div>
            ) : plays.length ? (
              <div className="landing-play-grid play-list-grid-animated">
                {plays.map((play) => (
                  <PlayCard key={play.id} play={play} />
                ))}
              </div>
            ) : (
              <div className="landing-empty play-index-empty">
                <h3>No matching plays</h3>
                <p>Try adjusting or clearing your filters.</p>
              </div>
            )}

            {/* Pagination */}
            {count > PAGE_SIZE && (
              <nav className="theatre-pagination play-index-pagination" aria-label="Play pages">
                {page > 1 ? (
                  <Link className="theatre-page-btn" href={pageHref(page - 1)}>
                    ← Prev
                  </Link>
                ) : (
                  <span className="theatre-page-btn" aria-disabled="true">
                    ← Prev
                  </span>
                )}

                <div className="theatre-page-numbers">
                  {(() => {
                    let start = Math.max(1, page - 1);
                    if (start + 2 > pages) start = Math.max(1, pages - 2);
                    const visiblePages = Array.from(
                      { length: Math.min(3, pages) },
                      (_, i) => start + i
                    );
                    return visiblePages.map((item) =>
                      item === page ? (
                        <span
                          className="theatre-page-num is-active"
                          aria-current="page"
                          key={item}
                        >
                          {item}
                        </span>
                      ) : (
                        <Link className="theatre-page-num" key={item} href={pageHref(item)}>
                          {item}
                        </Link>
                      )
                    );
                  })()}
                </div>

                {page < pages ? (
                  <Link className="theatre-page-btn" href={pageHref(page + 1)}>
                    Next →
                  </Link>
                ) : (
                  <span className="theatre-page-btn" aria-disabled="true">
                    Next →
                  </span>
                )}
              </nav>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
