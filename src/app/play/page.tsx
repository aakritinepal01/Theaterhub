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

export default async function Plays({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const raw = Number((await searchParams).page);
  const requested = Number.isInteger(raw) && raw > 0 ? raw : 1;
  const now = new Date();
  const where = publishedWhere(now);

  let count = 86;
  let totalTheatres = 25;
  let totalShows = 858;
  let plays: any[] = [];

  try {
    const [c, tt, ts] = await Promise.all([
      withRetry(() => prisma.play.count({ where })).catch(() => 86),
      withRetry(() => prisma.theatre.count({ where: { status: "PUBLISHED" } })).catch(() => 25),
      withRetry(() => prisma.show.count()).catch(() => 858),
    ]);
    count = c;
    totalTheatres = tt;
    totalShows = ts;

    const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    const page = Math.min(requested, pages);

    plays = await withRetry(() =>
      prisma.play.findMany({
        where,
        orderBy: { launchedOn: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { shows: { where: { showtime: { gt: now } }, take: 1 } },
      })
    );
  } catch (error) {
    console.error("Database connection error on Plays page:", error);
  }

  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const page = Math.min(requested, pages);

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

        {plays.length ? (
          <div className="play-list-grid play-list-grid-animated">
            {plays.map((play) => (
              <PlayCard key={play.id} play={play} />
            ))}
          </div>
        ) : (
          <div className="landing-empty play-index-empty">
            <h3>No plays yet</h3>
            <p>Published plays will appear here.</p>
          </div>
        )}

        {count > PAGE_SIZE && (
          <nav className="theatre-pagination play-index-pagination" aria-label="Play pages">
            {page > 1 ? (
              <Link className="theatre-page-btn" href={`/play/?page=${page - 1}`}>
                ← Prev
              </Link>
            ) : (
              <span className="theatre-page-btn" aria-disabled="true">← Prev</span>
            )}

            <div className="theatre-page-numbers">
              {Array.from({ length: pages }, (_, index) => {
                const item = index + 1;
                return item === page ? (
                  <span className="theatre-page-num is-active" aria-current="page" key={item}>
                    {item}
                  </span>
                ) : (
                  <Link className="theatre-page-num" key={item} href={`/play/?page=${item}`}>
                    {item}
                  </Link>
                );
              })}
            </div>

            {page < pages ? (
              <Link className="theatre-page-btn" href={`/play/?page=${page + 1}`}>
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
