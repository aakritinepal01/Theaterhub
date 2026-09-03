import Link from "next/link";
import { getPlayPhoto, plainText } from "@/lib/content";

type Maker = {
  role: string;
  profile?: { name: string } | null;
};

type PlayData = {
  id?: number;
  title: string;
  slug: string | null;
  description: string;
  coverImage: string | null;
  theatre?: { title: string } | null;
  makers?: Maker[];
};

export function PlayCard({
  play,
  showTeaser = true,
  teaserLength = 140,
}: {
  play: PlayData;
  showTeaser?: boolean;
  teaserLength?: number;
}) {
  const image = getPlayPhoto(play);

  const teaser =
    plainText(play.description).slice(0, teaserLength) ||
    "Discover this production on TheatreHub.";

  const venueName = play.theatre?.title;

  return (
    <article className="landing-play-card">
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

      <div className="landing-play-card-body">
        <h3 className="landing-play-body-title">
          <Link href={`/play/${play.slug}/`}>{play.title}</Link>
        </h3>

        {venueName && (
          <div className="landing-play-venue" title={venueName}>
            {venueName}
          </div>
        )}

        {showTeaser && <p className="landing-play-body-teaser">{teaser}</p>}

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
