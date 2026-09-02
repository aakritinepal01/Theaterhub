import Link from "next/link";
import { publishedWhere } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { PlayCard } from "@/components/PlayCard";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

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

export default async function Plays({ searchParams }: { searchParams: Promise<{ page?: string; theatre?: string; filter?: string }> }) {
  const params = await searchParams;
  const raw = Number(params.page);
  const requested = Number.isInteger(raw) && raw > 0 ? raw : 1;
  const selectedTheatreId = Number(params.theatre);
  const theatreId = Number.isInteger(selectedTheatreId) && selectedTheatreId > 0 ? selectedTheatreId : null;
  const selectedFilter = params.filter === "showing" || params.filter === "archive" ? params.filter : "all";
  const now = new Date();
  const where = publishedWhere(now);
  const filteredWhere = {
    ...where,
    ...(theatreId ? { theatreId } : {}),
    ...(selectedFilter === "showing" ? { shows: { some: { showtime: { gt: now } } } } : {}),
    ...(selectedFilter === "archive" ? { shows: { none: { showtime: { gt: now } } } } : {}),
  };

  let count = 86;
  let totalTheatres = 25;
  let totalShows = 858;
  let plays: any[] = [];
  let theatres: { id: number; title: string }[] = [];

  try {
    const [c, tt, ts, theatreOptions] = await Promise.all([
      withRetry(() => prisma.play.count({ where: filteredWhere })).catch(() => 86),
      withRetry(() => prisma.theatre.count({ where: { status: "PUBLISHED" } })).catch(() => 25),
      withRetry(() => prisma.show.count()).catch(() => 858),
      withRetry(() => prisma.theatre.findMany({ where: { status: "PUBLISHED" }, select: { id: true, title: true }, orderBy: { title: "asc" } })).catch(() => []),
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
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (theatreId) query.set("theatre", String(theatreId));
    if (selectedFilter !== "all") query.set("filter", selectedFilter);
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
              Explore timeless classics, groundbreaking contemporary plays, and festival productions shaping Nepal&apos;s theatrical history.
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
        <section className="play-index-toolbar" aria-label="Play archive view">
          <div>
            <strong>Newest productions</strong>
            <span>{count ? `Showing ${plays.length} of ${count}` : "No plays published yet"}</span>
          </div>
          <div className="play-index-chips">
            <span>Latest first</span>
            <span>Page {page} of {pages}</span>
          </div>
        </section>

        <form className="play-filter-bar" method="get" aria-label="Filter plays">
          <div className="play-filter-heading">
            <strong>Filter productions</strong>
            <span>Browse by venue or current availability</span>
          </div>
          <label>
            <span className="sr-only">Theatre venue</span>
            <select name="theatre" defaultValue={theatreId ? String(theatreId) : ""}>
              <option value="">All theatres</option>
              {theatres.map((theatre) => <option key={theatre.id} value={theatre.id}>{theatre.title}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Availability</span>
            <select name="filter" defaultValue={selectedFilter}>
              <option value="all">All productions</option>
              <option value="showing">Currently showing</option>
              <option value="archive">Archive</option>
            </select>
          </label>
          <button type="submit" className="play-filter-submit">Apply filters</button>
          {(theatreId || selectedFilter !== "all") && <Link href="/play/" className="play-filter-reset">Clear</Link>}
        </form>

        {selectedFilter === "all" ? (
          <div className="play-collections">
            <section className="play-collection-section" aria-labelledby="running-plays-title">
              <div className="play-collection-heading">
                <div>
                  <span className="play-collection-kicker">On stage now</span>
                  <h2 id="running-plays-title">Currently Running Plays</h2>
                </div>
                <span>{runningPlays.length} production{runningPlays.length === 1 ? "" : "s"}</span>
              </div>
              {runningPlays.length ? (
                <div className="landing-play-grid play-list-grid-animated">
                  {runningPlays.map((play) => <PlayCard key={play.id} play={play} />)}
                </div>
              ) : <div className="play-collection-empty">No currently running plays found.</div>}
            </section>

            <section className="play-collection-section" aria-labelledby="archive-plays-title">
              <div className="play-collection-heading">
                <div>
                  <span className="play-collection-kicker">Past productions</span>
                  <h2 id="archive-plays-title">Play Archive</h2>
                </div>
                <span>{archivedPlays.length} production{archivedPlays.length === 1 ? "" : "s"}</span>
              </div>
              {archivedPlays.length ? (
                <div className="landing-play-grid play-list-grid-animated">
                  {archivedPlays.map((play) => <PlayCard key={play.id} play={play} />)}
                </div>
              ) : <div className="play-collection-empty">No archived plays found.</div>}
            </section>
          </div>
        ) : plays.length ? (
          <div className="landing-play-grid play-list-grid-animated">
            {plays.map((play) => <PlayCard key={play.id} play={play} />)}
          </div>
        ) : (
          <div className="landing-empty play-index-empty">
            <h3>No matching plays</h3>
            <p>Try changing the selected theatre or production filter.</p>
          </div>
        )}

        {count > PAGE_SIZE && (
          <nav className="theatre-pagination play-index-pagination" aria-label="Play pages">
            {page > 1 ? (
                <Link className="theatre-page-btn" href={pageHref(page - 1)}>
                ← Prev
              </Link>
            ) : (
              <span className="theatre-page-btn" aria-disabled="true">← Prev</span>
            )}

            <div className="theatre-page-numbers">
              {(() => {
                let start = Math.max(1, page - 1);
                if (start + 2 > pages) {
                  start = Math.max(1, pages - 2);
                }
                const visiblePages = Array.from(
                  { length: Math.min(3, pages) },
                  (_, i) => start + i
                );
                return visiblePages.map((item) =>
                  item === page ? (
                    <span className="theatre-page-num is-active" aria-current="page" key={item}>
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
              <span className="theatre-page-btn" aria-disabled="true">Next →</span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
