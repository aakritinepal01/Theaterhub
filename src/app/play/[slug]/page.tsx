import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, getPlayPhoto, plainText, publishedWhere } from "@/lib/content";
import { groupRoles } from "@/lib/roles";
import { RoleList } from "@/components/RoleList";

export const revalidate = 300;

const showDate = new Intl.DateTimeFormat("en-NP", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Kathmandu",
});

const showTime = new Intl.DateTimeFormat("en-NP", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kathmandu",
});

function safeHtml(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&");
}

function hasContent(html: string) {
  return plainText(html).length > 0;
}

function formatRunDate(start?: Date | null, end?: Date | null) {
  if (start && end) return `${formatDate(start)} - ${formatDate(end)}`;
  if (start) return `From ${formatDate(start)}`;
  if (end) return `Until ${formatDate(end)}`;
  return "Dates TBA";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const play = await prisma.play.findFirst({
    where: { slug, ...publishedWhere() },
    select: { id: true, title: true, description: true, coverImage: true },
  });

  if (!play) return { title: "Play Not Found | TheatreHub" };

  const image = getPlayPhoto(play);

  return {
    title: `${play.title} | TheatreHub`,
    description: plainText(play.description) || `Read about ${play.title} on TheatreHub.`,
    openGraph: {
      title: play.title,
      description: plainText(play.description),
      images: image ? [image] : [],
    },
  };
}

export default async function PlayDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const play = await prisma.play.findFirst({
    where: { slug, ...publishedWhere() },
    include: {
      theatre: true,
      makers: { orderBy: { order: "asc" }, include: { profile: true } },
      cast: { orderBy: { order: "asc" }, include: { profile: true } },
      crew: { orderBy: { order: "asc" }, include: { profile: true } },
      shows: { where: { showtime: { gt: new Date() } }, orderBy: { showtime: "asc" } },
    },
  });

  if (!play) notFound();

  const image = getPlayPhoto(play);
  const makerRoles = groupRoles(play.makers);
  const castRoles = groupRoles(play.cast);
  const crewRoles = groupRoles(play.crew);
  const synopsisHtml = safeHtml(play.abstract || play.description);
  const noteHtml = safeHtml(play.directorialNote);
  const descriptionText = plainText(safeHtml(play.description));
  const runDate = formatRunDate(play.launchedOn, play.endedOn);
  const firstShow = play.shows[0];
  const ratingText = play.ratingCount ? `${play.ratingAverage.toFixed(1)} / 5` : "Not rated";

  return (
    <article className="play-detail-page">
      <section className="play-detail-hero">
        <div className="site-container play-detail-hero-inner">
          <div className="play-detail-hero-copy">
            <nav className="play-detail-breadcrumbs" aria-label="Breadcrumbs">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/play/">Plays</Link>
              <span aria-hidden="true">/</span>
              <span>{play.title}</span>
            </nav>

            <span className="play-detail-kicker">Production Detail</span>
            <h1>{play.title}</h1>

            <div className="play-detail-meta-row">
              {play.theatre?.slug ? (
                <Link className="play-detail-venue-link" href={`/theatre/${play.theatre.slug}/`}>
                  {play.theatre.title}
                </Link>
              ) : play.theatre ? (
                <span className="play-detail-venue-link">{play.theatre.title}</span>
              ) : (
                <span className="play-detail-venue-link">Venue TBA</span>
              )}
              <span>{runDate}</span>
              {play.duration ? <span>{play.duration} min</span> : null}
            </div>

            {/* Mobile-only inline poster — shown after meta, hidden on desktop */}
            {image && (
              <aside className="play-detail-poster-inline" aria-label={`${play.title} poster`}>
                <img src={image} alt={play.title} />
              </aside>
            )}

            {descriptionText ? (
              <p className="play-detail-lead">{descriptionText}</p>
            ) : null}

            <div className="play-detail-actions">
              <Link className="play-detail-secondary-btn" href="/play/">
                Back to Plays
              </Link>
              {play.shows.length ? (
                <Link className="play-detail-primary-btn" href={`/play/${play.slug}/shows/`}>
                  View Showtimes
                </Link>
              ) : null}
            </div>
          </div>

          <aside className="play-detail-poster-card" aria-label={`${play.title} poster`}>
            <img src={image} alt={play.title} />
          </aside>
        </div>
      </section>

      <main className="site-container play-detail-layout">
        <div className="play-detail-main">
          {hasContent(synopsisHtml) ? (
            <section className="play-detail-section">
              <div className="play-detail-section-head">
                <span>01</span>
                <h2>Synopsis</h2>
              </div>
              <div className="play-detail-prose" dangerouslySetInnerHTML={{ __html: synopsisHtml }} />
            </section>
          ) : null}

          {hasContent(noteHtml) ? (
            <section className="play-detail-section">
              <div className="play-detail-section-head">
                <span>02</span>
                <h2>Director&apos;s Note</h2>
              </div>
              <div className="play-detail-prose" dangerouslySetInnerHTML={{ __html: noteHtml }} />
            </section>
          ) : null}

          {makerRoles.length || castRoles.length || crewRoles.length ? (
            <section className="play-detail-section">
              <div className="play-detail-section-head">
                <span>03</span>
                <h2>People Behind the Play</h2>
              </div>

              <div className="play-detail-credits-grid">
                {makerRoles.length ? (
                  <section className="play-detail-credit-panel">
                    <h3>Creative Team</h3>
                    <RoleList items={makerRoles} />
                  </section>
                ) : null}

                {castRoles.length ? (
                  <section className="play-detail-credit-panel">
                    <h3>On Stage</h3>
                    <RoleList items={castRoles} />
                  </section>
                ) : null}

                {crewRoles.length ? (
                  <section className="play-detail-credit-panel play-detail-credit-panel-full">
                    <h3>Off Stage</h3>
                    <RoleList items={crewRoles} />
                  </section>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="play-detail-sidebar">
          <section className="play-detail-side-panel">
            <h2>At a Glance</h2>
            <dl className="play-detail-facts">
              <div>
                <dt>Venue</dt>
                <dd>{play.theatre?.title || "TBA"}</dd>
              </div>
              <div>
                <dt>Run</dt>
                <dd>{runDate}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{play.duration ? `${play.duration} min` : "TBA"}</dd>
              </div>
              <div>
                <dt>Rating</dt>
                <dd>{ratingText}</dd>
              </div>
            </dl>
          </section>

          {play.shows.length ? (
            <section className="play-detail-side-panel">
              <div className="play-detail-side-head">
                <h2>Upcoming Shows</h2>
                <Link href={`/play/${play.slug}/shows/`}>All</Link>
              </div>
              <div className="play-detail-show-list">
                {play.shows.slice(0, 5).map((show) => (
                  <div className="play-detail-show-chip" key={show.id}>
                    <span>{showDate.format(show.showtime)}</span>
                    <strong>{showTime.format(show.showtime)}</strong>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {play.theatre?.slug ? (
            <section className="play-detail-side-panel play-detail-theatre-panel">
              <span className="play-detail-kicker">Venue</span>
              <h2>{play.theatre.title}</h2>
              {play.theatre.address ? <p>{play.theatre.address}</p> : null}
              <Link href={`/theatre/${play.theatre.slug}/`}>View Theatre</Link>
            </section>
          ) : null}
        </aside>
      </main>
    </article>
  );
}
