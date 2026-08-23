"use client";

import Link from "next/link";
import { mediaUrl } from "@/lib/content";

type LiveShow = {
  id: number;
  showtime: Date;
  price: number | null;
  play: {
    title: string;
    slug: string;
    coverImage?: string | null;
  };
  theatre: {
    title: string;
  };
};

type LivePlay = {
  id: number;
  title: string;
  slug: string;
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
  // Combine shows and plays into detailed live ticker items
  const items = shows.length
    ? shows.map((s) => ({
        id: `show-${s.id}`,
        title: s.play.title,
        slug: s.play.slug,
        venue: s.theatre.title,
        price: s.price != null ? `NPR ${s.price.toLocaleString()}` : "Free RSVP",
        image: mediaUrl(s.play.coverImage),
        timeText: new Intl.DateTimeFormat("en-NP", {
          weekday: "short",
          month: "short",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "Asia/Kathmandu",
        }).format(new Date(s.showtime)),
      }))
    : plays.map((p) => ({
        id: `play-${p.id}`,
        title: p.title,
        slug: p.slug,
        venue: "Kathmandu Stages",
        price: "Box Office",
        image: mediaUrl(p.coverImage),
        timeText: "On Stage Today",
      }));

  if (!items.length) return null;

  // Duplicate items for continuous smooth looping animation
  const loopItems = [...items, ...items, ...items];

  return (
    <section className="live-marquee-section" aria-label="Currently Playing Stage Productions in Nepal">
      {/* Background Ambient Glow FX */}
      <div className="live-marquee-bg-glow" aria-hidden="true" />

      <div className="site-container live-marquee-header-row">
        <div className="live-marquee-header-left">
          <div className="live-marquee-badge">
            <span className="live-dot-pulse" />
            <span>PLAYING NOW IN NEPAL</span>
          </div>
          <span className="live-marquee-sub">
            🎭 <strong>{items.length}</strong> Stage Shows Active Across Nepal
          </span>
        </div>

        <div className="live-marquee-header-right">
          <span className="live-marquee-hint">⚡ Auto-scrolling live feed · Hover to pause</span>
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
              {/* Card Poster Image with Status Pill */}
              <div className="live-marquee-thumb">
                {item.image ? (
                  <img src={item.image} alt={item.title} />
                ) : (
                  <div className="live-marquee-thumb-fallback">
                    <span>🎭</span>
                  </div>
                )}
                <span className="live-thumb-live-tag">LIVE</span>
              </div>

              {/* Card Main Info */}
              <div className="live-marquee-info">
                <div className="live-marquee-meta-line">
                  <span className="live-time-chip">🕒 {item.timeText}</span>
                  <span className="live-price-pill">{item.price}</span>
                </div>

                <h4 className="live-marquee-title">{item.title}</h4>

                <div className="live-marquee-bottom-row">
                  <p className="live-marquee-venue">📍 {item.venue}</p>
                  <span className="live-card-btn">
                    Get Tickets <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
