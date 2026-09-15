import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  formatDate,
  getArtistPhoto,
  getPlayPhoto,
  getTheatrePhoto,
  mediaUrl,
  plainText,
} from "@/lib/content";
import { prisma } from "@/lib/prisma";
import styles from "./search.module.css";

export const metadata: Metadata = {
  title: "Search",
  description: "Search TheatreHub for plays, artists, theatres, and stories from Nepal's stage.",
  robots: { index: false },
};

type ResultKind = "plays" | "artists" | "theatres" | "stories";

type SearchResult = {
  title: string;
  url: string;
  description: string;
  image: string | null;
  details: string[];
  action: string;
};

type ResultSection = {
  kind: ResultKind;
  label: string;
  singular: string;
  description: string;
  items: SearchResult[];
};

const DISCOVERY_LINKS: Array<{
  kind: ResultKind;
  title: string;
  kicker: string;
  description: string;
  href: string;
}> = [
  {
    kind: "plays",
    title: "Plays & productions",
    kicker: "On the stage",
    description: "Explore classics, contemporary productions, and performances from across Nepal.",
    href: "/play/",
  },
  {
    kind: "artists",
    title: "Artists & makers",
    kicker: "Behind the work",
    description: "Meet actors, directors, writers, designers, technicians, and theatre-makers.",
    href: "/profile/",
  },
  {
    kind: "theatres",
    title: "Theatres & venues",
    kicker: "Where stories live",
    description: "Find performance spaces, companies, cultural venues, and upcoming programmes.",
    href: "/theatre/",
  },
  {
    kind: "stories",
    title: "Stories & news",
    kicker: "From the wings",
    description: "Read interviews, features, reviews, announcements, and ideas from backstage.",
    href: "/blog/",
  },
];

function isResultKind(value?: string): value is ResultKind {
  return value === "plays" || value === "artists" || value === "theatres" || value === "stories";
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CollectionIcon({ kind }: { kind: ResultKind }) {
  if (kind === "plays") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 4.5c2.4 0 4.7-.8 7-2 2.3 1.2 4.6 2 7 2v6.2c0 5-3 8.6-7 10.8-4-2.2-7-5.8-7-10.8V4.5Z" />
        <path d="M8.5 9.5h.01M15.5 9.5h.01M9 14.2c2 1.6 4 1.6 6 0" />
      </svg>
    );
  }

  if (kind === "artists") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21c.5-4.5 3-7 7-7s6.5 2.5 7 7" />
      </svg>
    );
  }

  if (kind === "theatres") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="m3 9 9-5 9 5M4 20h16M6 9v8M10 9v8M14 9v8M18 9v8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 3h9l3 3v15H6V3Z" />
      <path d="M14 3v4h4M9 11h6M9 15h6M9 18h4" />
    </svg>
  );
}

function makeSummary(value: string, fallback: string) {
  const clean = plainText(value);
  if (!clean) return fallback;
  return clean.length > 190 ? `${clean.slice(0, 187).trimEnd()}…` : clean;
}

function readTime(value: string) {
  const words = plainText(value).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} min read`;
}

function compactDetails(values: Array<string | null | undefined>) {
  return values.filter((value): value is string => Boolean(value)).slice(0, 3);
}

function ResultCard({ item, kind, singular }: { item: SearchResult; kind: ResultKind; singular: string }) {
  return (
    <article className={styles.resultCard} data-kind={kind}>
      <Link href={item.url} className={styles.resultLink}>
        <div className={styles.resultImage} data-kind={kind}>
          {item.image ? (
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(max-width: 640px) 96px, 168px"
              className={styles.image}
            />
          ) : (
            <span className={styles.imageFallback}>
              <CollectionIcon kind={kind} />
            </span>
          )}
          <span className={styles.imageType}>{singular}</span>
        </div>

        <div className={styles.resultCopy}>
          <div className={styles.resultTopline}>
            <span className={styles.resultType} data-kind={kind}>{singular}</span>
            <span className={styles.resultRule} />
            <span>THEATREHUB ARCHIVE</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className={styles.detailRow}>
            {item.details.map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>
        </div>

        <span className={styles.resultAction}>
          <span>{item.action}</span>
          <i aria-hidden="true"><ArrowIcon /></i>
        </span>
      </Link>
    </article>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; type?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const rawType = Array.isArray(params.type) ? params.type[0] : params.type;
  const query = rawQuery?.trim().slice(0, 120) ?? "";
  const selectedKind = isResultKind(rawType) ? rawType : null;

  let searchFailed = false;
  let sections: ResultSection[] = [];

  if (query) {
    try {
      const [plays, artists, theatres, posts] = await Promise.all([
        prisma.play.findMany({
          where: {
            status: "PUBLISHED",
            slug: { not: null },
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { abstract: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            abstract: true,
            coverImage: true,
            duration: true,
            ratingAverage: true,
            ratingCount: true,
            theatre: { select: { title: true } },
          },
          orderBy: { title: "asc" },
          take: 20,
        }),
        prisma.profile.findMany({
          where: {
            status: "PUBLISHED",
            slug: { not: null },
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { bio: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            slug: true,
            title: true,
            bio: true,
            description: true,
            profilePic: true,
            address: true,
            _count: { select: { castCredits: true, makerCredits: true, crewCredits: true } },
          },
          orderBy: { name: "asc" },
          take: 20,
        }),
        prisma.theatre.findMany({
          where: {
            status: "PUBLISHED",
            slug: { not: null },
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { about: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            title: true,
            slug: true,
            about: true,
            description: true,
            coverImage: true,
            profilePic: true,
            address: true,
            establishedOn: true,
            _count: { select: { plays: true, shows: true } },
          },
          orderBy: { title: "asc" },
          take: 20,
        }),
        prisma.blogPost.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            title: true,
            slug: true,
            description: true,
            content: true,
            featuredImage: true,
            publishDate: true,
          },
          orderBy: { publishDate: "desc" },
          take: 20,
        }),
      ]);

      sections = [
        {
          kind: "plays",
          label: "Plays",
          singular: "Play",
          description: "Productions, performances, and work from the stage",
          items: plays.map((play) => ({
            title: play.title,
            url: `/play/${play.slug}/`,
            description: makeSummary(
              play.description || play.abstract,
              "Discover this production and the people who brought it to the stage.",
            ),
            image: getPlayPhoto(play),
            details: compactDetails([
              play.theatre?.title || "TheatreHub production",
              play.duration ? `${play.duration} minutes` : null,
              play.ratingCount > 0 ? `${play.ratingAverage.toFixed(1)} audience rating` : null,
            ]),
            action: "View production",
          })),
        },
        {
          kind: "artists",
          label: "Artists",
          singular: "Artist",
          description: "Actors, directors, writers, designers, and makers",
          items: artists.map((artist) => {
            const credits = artist._count.castCredits + artist._count.makerCredits + artist._count.crewCredits;
            return {
              title: artist.name,
              url: `/profile/${artist.slug}/`,
              description: makeSummary(
                artist.bio || artist.description,
                "Explore this artist's profile, stage work, and creative journey.",
              ),
              image: getArtistPhoto(artist),
              details: compactDetails([
                artist.title || "Theatre practitioner",
                artist.address,
                credits ? `${credits} stage ${credits === 1 ? "credit" : "credits"}` : null,
              ]),
              action: "View profile",
            };
          }),
        },
        {
          kind: "theatres",
          label: "Theatres",
          singular: "Theatre",
          description: "Companies, venues, and spaces where stories come alive",
          items: theatres.map((theatre) => ({
            title: theatre.title,
            url: `/theatre/${theatre.slug}/`,
            description: makeSummary(
              theatre.about || theatre.description,
              "Discover this performance space and the stories staged here.",
            ),
            image: mediaUrl(theatre.profilePic) || getTheatrePhoto(theatre),
            details: compactDetails([
              theatre.address || "Performance space in Nepal",
              theatre.establishedOn ? `Established ${theatre.establishedOn.getFullYear()}` : null,
              theatre._count.plays ? `${theatre._count.plays} productions` : `${theatre._count.shows} recorded shows`,
            ]),
            action: "Explore theatre",
          })),
        },
        {
          kind: "stories",
          label: "Stories & news",
          singular: "Story",
          description: "Features, interviews, dispatches, and theatre news",
          items: posts.map((post) => ({
            title: post.title,
            url: `/blog/${post.slug}/`,
            description: makeSummary(
              post.description || post.content,
              "Read this story from Nepal's theatre community.",
            ),
            image: mediaUrl(post.featuredImage),
            details: compactDetails([
              formatDate(post.publishDate) || "TheatreHub journal",
              readTime(post.content || post.description),
            ]),
            action: "Read story",
          })),
        },
      ];
    } catch (error) {
      console.error("Search request failed:", error);
      searchFailed = true;
    }
  }

  const resultCount = sections.reduce((total, section) => total + section.items.length, 0);
  const populatedSections = sections.filter((section) => section.items.length > 0);
  const visibleSections = selectedKind
    ? sections.filter((section) => section.kind === selectedKind && section.items.length > 0)
    : populatedSections;
  const visibleCount = visibleSections.reduce((total, section) => total + section.items.length, 0);
  const selectedSection = sections.find((section) => section.kind === selectedKind);

  function filterHref(kind?: ResultKind) {
    const filterParams = new URLSearchParams({ q: query });
    if (kind) filterParams.set("type", kind);
    return `/search?${filterParams.toString()}`;
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <form className={styles.searchForm} action="/search" method="get" role="search">
            <span className={styles.searchIcon}><SearchIcon /></span>
            <label className={styles.srOnly} htmlFor="site-search">Search TheatreHub</label>
            <input
              id="site-search"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search a play, artist, theatre, or topic…"
              autoComplete="off"
            />
            {selectedKind && <input type="hidden" name="type" value={selectedKind} />}
            <button type="submit"><span>Search archive</span><ArrowIcon /></button>
          </form>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.container}>
          {!query ? (
            <section className={styles.discovery} aria-labelledby="browse-heading">
              <header className={styles.discoveryHeading}>
                <div>
                  <p>Explore the collection</p>
                  <h2 id="browse-heading">Four ways into Nepal&apos;s theatre world</h2>
                </div>
                <span>Browse curated collections or use the archive search above to find something specific.</span>
              </header>
              <div className={styles.discoveryGrid}>
                {DISCOVERY_LINKS.map((item, index) => (
                  <Link key={item.kind} href={item.href} className={styles.discoveryCard} data-kind={item.kind}>
                    <span className={styles.discoveryNumber}>0{index + 1}</span>
                    <span className={styles.discoveryIcon}><CollectionIcon kind={item.kind} /></span>
                    <span className={styles.discoveryCopy}>
                      <small>{item.kicker}</small>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </span>
                    <span className={styles.discoveryAction}>Explore collection <i><ArrowIcon /></i></span>
                  </Link>
                ))}
              </div>
            </section>
          ) : searchFailed ? (
            <section className={styles.emptyState}>
              <span className={styles.emptyIcon}><SearchIcon /></span>
              <p className={styles.emptyEyebrow}>Please try again</p>
              <h2>The archive is taking an intermission</h2>
              <p>We couldn&apos;t complete this search just now. Refresh the page or try again in a moment.</p>
              <Link href={filterHref(selectedKind ?? undefined)} className={styles.primaryLink}>Try again</Link>
            </section>
          ) : resultCount === 0 ? (
            <section className={styles.emptyState}>
              <span className={styles.emptyIcon}><SearchIcon /></span>
              <p className={styles.emptyEyebrow}>No matches found</p>
              <h2>Nothing stepped into the spotlight</h2>
              <p>We couldn&apos;t find anything for <strong>&ldquo;{query}&rdquo;</strong>. Check the spelling or try a broader keyword.</p>
              <div className={styles.emptyActions}>
                <Link href="/search" className={styles.primaryLink}>Start a new search</Link>
                <Link href="/play/" className={styles.secondaryLink}>Browse all plays</Link>
              </div>
            </section>
          ) : (
            <>
              <header className={styles.resultsHeader}>
                <div>
                  <p className={styles.resultsEyebrow}>Search results / TheatreHub archive</p>
                  <h2>
                    {selectedSection ? `${visibleCount} ${selectedSection.label.toLowerCase()}` : `${resultCount} results`} for <em>&ldquo;{query}&rdquo;</em>
                  </h2>
                  <span>
                    {selectedSection
                      ? `Filtered from ${resultCount} total ${resultCount === 1 ? "match" : "matches"}.`
                      : `${populatedSections.length} ${populatedSections.length === 1 ? "collection" : "collections"} contain matching work.`}
                  </span>
                </div>
                <Link href="/search" className={styles.clearLink}>New search <ArrowIcon /></Link>
              </header>

              <div className={styles.resultsLayout}>
                <aside className={styles.filterPanel} aria-label="Filter search results">
                  <div className={styles.filterHeading}>
                    <span>Refine results</span>
                    <small>Choose a collection</small>
                  </div>
                  <nav className={styles.filterNav}>
                    <Link href={filterHref()} className={!selectedKind ? styles.activeFilter : ""} aria-current={!selectedKind ? "page" : undefined}>
                      <span className={styles.filterIcon}><SearchIcon /></span>
                      <span className={styles.filterCopy}><strong>All results</strong><small>Everything in one view</small></span>
                      <b>{resultCount}</b>
                    </Link>
                    {sections.map((section) => (
                      <Link
                        key={section.kind}
                        href={filterHref(section.kind)}
                        className={selectedKind === section.kind ? styles.activeFilter : ""}
                        aria-current={selectedKind === section.kind ? "page" : undefined}
                      >
                        <span className={styles.filterIcon} data-kind={section.kind}><CollectionIcon kind={section.kind} /></span>
                        <span className={styles.filterCopy}><strong>{section.label}</strong><small>{section.singular} matches</small></span>
                        <b>{section.items.length}</b>
                      </Link>
                    ))}
                  </nav>
                </aside>

                <div className={styles.sections}>
                  {visibleCount === 0 ? (
                    <section className={styles.categoryEmpty}>
                      <span><CollectionIcon kind={selectedKind || "plays"} /></span>
                      <h2>No {selectedSection?.label.toLowerCase()} found</h2>
                      <p>Your search has matches elsewhere in the archive.</p>
                      <Link href={filterHref()}>View all {resultCount} results <ArrowIcon /></Link>
                    </section>
                  ) : (
                    visibleSections.map((section) => (
                      <section key={section.kind} className={styles.resultSection} data-kind={section.kind}>
                        <header className={styles.sectionHeader}>
                          <span className={styles.sectionIcon} data-kind={section.kind}><CollectionIcon kind={section.kind} /></span>
                          <div>
                            <p>Collection</p>
                            <h2>{section.label}</h2>
                            <span>{section.description}</span>
                          </div>
                          <b>{section.items.length.toString().padStart(2, "0")}</b>
                        </header>
                        <div className={styles.resultList}>
                          {section.items.map((item) => (
                            <ResultCard key={item.url} item={item} kind={section.kind} singular={section.singular} />
                          ))}
                        </div>
                      </section>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
