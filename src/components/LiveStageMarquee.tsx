"use client";

import Link from "next/link";
import { getPlayPhoto } from "@/lib/content";

type LiveShow = {
  id: number;
  showtime: Date;
  price: number | null;
  play: {
    id?: number;
    title: string;
    slug: string | null;
    coverImage?: string | null;
  };
  theatre: {
    title: string;
  };
};

type LivePlay = {
  id: number;
  title: string;
  slug: string | null;
  coverImage?: string | null;
  shows: Array<{ showtime: Date }>;
};

export function LiveStageMarquee({
  shows = [],
  plays = [],
}: {
  shows?: LiveShow[];
  plays?: LivePlay[];
}) {
  const hasScheduledShows = shows.length > 0;

  const items = hasScheduledShows
    ? shows
        .filter((s) => s.play.slug)
        .map((s) => ({
          id: `show-${s.id}`,
          title: s.play.title,
          slug: s.play.slug!,
          venue: s.theatre.title,
          price: s.price != null ? `NPR ${s.price.toLocaleString()}` : "Free RSVP",
          image: getPlayPhoto(s.play),
          timeText: new Intl.DateTimeFormat("en-NP", {
            weekday: "short",
            month: "short",
            day: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            timeZone: "Asia/Kathmandu",
          }).format(new Date(s.showtime)),
        }))
    : plays
        .filter((p) => p.slug)
        .map((p) => ({
          id: `play-${p.id}`,
          title: p.title,
          slug: p.slug!,
          venue: "Nepal theatre stages",
          price: null,
          image: getPlayPhoto(p),
          timeText: "Featured production",
        }));

  if (!items.length) return null;

  const loopItems = [...items, ...items, ...items];
  const subtext = hasScheduledShows
    ? `${items.length} scheduled performances with ticket details`
    : `${items.length} theatre titles currently featured on TheaterHub`;
  const cardAction = "View details";

  return (
    <section className="live-marquee-section" aria-label="Currently Playing Stage Productions in Nepal">
      <div className="live-marquee-bg-glow" aria-hidden="true" />

      <div className="site-container">
        <div className="live-marquee-header-row">
          <div className="live-marquee-heading-group">
            <div className="live-marquee-kicker">Stage spotlight</div>
            <h2 className="live-marquee-title-heading">Playing Now in Nepal</h2>
            <p className="live-marquee-subtext">{subtext}</p>
          </div>

        </div>

        <div className="live-marquee-container">
          <div className="live-marquee-track">
            {loopItems.map((item, index) => (
              <Link
                key={`${item.id}-${index}`}
                href={`/play/${item.slug}/`}
                className="live-marquee-card"
              >
                <div className="live-marquee-thumb">
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <div className="live-marquee-thumb-fallback">
                      <span aria-hidden="true">TH</span>
                    </div>
                  )}
                </div>

                <div className="live-marquee-info">
                  <div className="live-marquee-meta-line">
                    <span className="live-time-chip">{item.timeText}</span>
                    {item.price ? <span className="live-price-pill">{item.price}</span> : null}
                  </div>
                  <h4 className="live-marquee-title">{item.title}</h4>

                  <div className="live-marquee-bottom-row">
                    <p className="live-marquee-venue">{item.venue}</p>
                    <span className="live-card-btn">
                      {cardAction} <span aria-hidden="true">-&gt;</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
