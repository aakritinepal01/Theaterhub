import Link from "next/link";
import { mediaUrl, plainText } from "@/lib/content";

type Maker = {
  role: string;
  profile?: { name: string } | null;
};

type PlayData = {
  title: string;
  slug: string | null;
  description: string;
  coverImage: string | null;
  launchedOn?: Date | string | null;
  endedOn?: Date | string | null;
  shows?: unknown[];
  theatre?: { title: string } | null;
  makers?: Maker[];
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
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

export function PlayCard({
  play,
  home = false,
}: {
  play: PlayData;
  home?: boolean;
}) {
  const image = mediaUrl(play.coverImage);
  const running = Boolean(play.shows?.length);

  if (home)
    return (
      <div className="panel">
        <div className="image-container">
          {running && (
            <div className="ribbon">
              <span>On Stage</span>
            </div>
          )}
          {image && (
            <Link href={`/play/${play.slug}/`}>
              <img src={image} alt={play.title} />
            </Link>
          )}
        </div>
      </div>
    );

  const teaser =
    plainText(play.description).slice(0, 140) ||
    "Discover this production on TheatreHub.";

  const directorMaker =
    play.makers?.find((m) =>
      /director|direction|design/i.test(m.role)
    ) || play.makers?.[0];

  const asstMaker =
    play.makers?.find(
      (m) =>
        m !== directorMaker &&
        /asst|translation|assistant|writer|author/i.test(m.role)
    ) || play.makers?.find((m) => m !== directorMaker);

  const stagedFrom = play.launchedOn
    ? dateFormatter.format(new Date(play.launchedOn))
    : null;
  const stagedTo = play.endedOn
    ? dateFormatter.format(new Date(play.endedOn))
    : null;

  let dateLine = "";
  if (stagedFrom && stagedTo) {
    dateLine = `Staged from ${stagedFrom} to ${stagedTo}`;
  } else if (stagedFrom) {
    dateLine = `Staged from ${stagedFrom}`;
  } else if (play.theatre) {
    dateLine = `Venue: ${play.theatre.title}`;
  } else {
    dateLine = "Featured Production";
  }

  return (
    <article className="landing-play-card">
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
                  {directorMaker
                    ? directorMaker.profile?.name
                    : play.theatre?.title || "TheatreHub"}
                </strong>
              </div>
            </div>

            {asstMaker && (
              <div className="landing-credit-row">
                <div className="landing-credit-text">
                  <span className="landing-credit-label">
                    {asstMaker.role}:
                  </span>{" "}
                  <strong className="landing-credit-value">
                    {asstMaker.profile?.name}
                  </strong>
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
            {running ? "ON STAGE" : "PUBLISHED PLAY"}
          </span>
        </div>

        <h4 className="landing-play-body-title">
          <Link href={`/play/${play.slug}/`}>{play.title}</Link>
        </h4>

        <p className="landing-play-body-teaser">{teaser}</p>

        <div className="landing-play-card-action">
          <Link
            className="landing-play-read-more"
            href={`/play/${play.slug}/`}
          >
            <span>Read more</span>
            <span className="landing-read-circle" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
