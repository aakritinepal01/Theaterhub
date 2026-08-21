import Link from "next/link";
import { publishedWhere } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { PageFrame } from "@/components/SiteShell";
import { PlayCard } from "@/components/PlayCard";

export const revalidate = 300;

const PAGE_SIZE = 9;

export default async function Plays({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const raw = Number((await searchParams).page);
  const requested = Number.isInteger(raw) && raw > 0 ? raw : 1;
  const now = new Date();
  const where = publishedWhere(now);

  const [count, runningCount] = await Promise.all([
    prisma.play.count({ where }),
    prisma.play.count({ where: { ...where, shows: { some: { showtime: { gt: now } } } } }),
  ]);

  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const page = Math.min(requested, pages);
  const plays = await prisma.play.findMany({
    where,
    orderBy: { launchedOn: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { shows: { where: { showtime: { gt: now } }, take: 1 } },
  });

  return <>
    <header className="play-index-hero">
      <div className="site-container play-index-hero-inner">
        <div className="play-index-copy">
          <p className="landing-kicker">Explore plays</p>
          <h1>Stories from Nepal&apos;s stage.</h1>
          <p>Browse published productions, follow what is currently on stage, and discover the theatre work shaping the scene.</p>
          <div className="play-index-actions">
            <Link href="/theatre/">Find theatres</Link>
            <Link href="/blog/">Read stories</Link>
          </div>
        </div>
        <div className="play-index-stats" aria-label="Play archive statistics">
          <span><strong>{count}</strong><small>Published plays</small></span>
          <span><strong>{runningCount}</strong><small>On stage now</small></span>
          <span><strong>{pages}</strong><small>Archive pages</small></span>
        </div>
      </div>
    </header>

    <PageFrame fullWidth>
      <section className="play-index-toolbar" aria-label="Play archive view">
        <div>
          <strong>Newest productions</strong>
          <span>{count ? `Showing ${plays.length} of ${count}` : "No plays published yet"}</span>
        </div>
        <div className="play-index-chips">
          <span>Latest first</span>
          {runningCount > 0 && <span>{runningCount} live</span>}
          <span>Page {page} of {pages}</span>
        </div>
      </section>

      {plays.length ? <div className="play-list-grid play-list-grid-animated">
        {plays.map(play => <PlayCard key={play.id} play={play} />)}
      </div> : <div className="landing-empty play-index-empty"><h3>No plays yet</h3><p>Published plays will appear here.</p></div>}

      {count > PAGE_SIZE && <nav className="pagination play-index-pagination" aria-label="Play pages">
        {Array.from({ length: pages }, (_, index) => {
          const item = index + 1;
          return item === page
            ? <span className="is-active" aria-current="page" key={item}>{item}</span>
            : <Link key={item} href={`/play/?page=${item}`}>{item}</Link>;
        })}
      </nav>}
    </PageFrame>
  </>;
}
