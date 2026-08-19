import Link from "next/link";
import { mediaUrl, plainText } from "@/lib/content";
import { getFeaturedPlays, getHeroPlays, getHomepageStats, getUpcomingShows } from "@/lib/home";
import { Hero } from "@/components/Hero";

export const revalidate = 300;

const showTime = new Intl.DateTimeFormat("en-NP", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kathmandu",
});

export default async function Home() {
  let plays: Awaited<ReturnType<typeof getFeaturedPlays>> = [];
  let heroPlays: Awaited<ReturnType<typeof getHeroPlays>> = [];
  let shows: Awaited<ReturnType<typeof getUpcomingShows>> = [];
  let stats = { plays: 0, theatres: 0, bookings: 0, upcomingShows: 0 };

  try {
    [plays, heroPlays, shows, stats] = await Promise.all([
      getFeaturedPlays(),
      getHeroPlays(),
      getUpcomingShows(),
      getHomepageStats(),
    ]);
  } catch (error) {
    console.error("Unable to load landing-page data", error);
  }

  const heroImages = heroPlays.flatMap(play => {
    const image = mediaUrl(play.coverImage);
    return image ? [image] : [];
  });

  return <>
    <Hero images={heroImages} />

    <section className="landing-stats" aria-label="TheatreHub statistics">
      <div className="site-container landing-stats-grid">
        {[
          [stats.plays, "Published plays"],
          [stats.theatres, "Theatres"],
          [stats.upcomingShows, "Upcoming shows"],
          [stats.bookings, "Bookings"],
        ].map(([value, label]) => <div className="landing-stat" key={label}>
          <strong>{value}</strong><span>{label}</span>
        </div>)}
      </div>
    </section>

    <main>
      <section className="landing-section site-container">
        <div className="landing-section-heading">
          <div><p className="landing-kicker">Curated for you</p><h2>Featured plays</h2></div>
        </div>
        {plays.length ? <div className="landing-play-grid">
          {plays.map((play, index) => {
            const image = mediaUrl(play.coverImage);
            return <article className={`landing-play-card${index === 0 ? " landing-play-card-large" : ""}`} key={play.id}>
              <Link className="landing-play-image" href={`/play/${play.slug}/`}>
                {image ? <img src={image} alt={play.title} /> : <div className="landing-image-empty">TheatreHub</div>}
                {play.shows.length > 0 && <span className="landing-live-badge">On stage</span>}
              </Link>
              <div className="landing-play-copy">
                <h3><Link href={`/play/${play.slug}/`}>{play.title}</Link></h3>
                <p>{plainText(play.description).slice(0, 110) || "Discover this production on TheatreHub."}</p>
              </div>
            </article>;
          })}
        </div> : <div className="landing-empty"><h3>No plays yet</h3><p>Published plays will appear here.</p></div>}
        <div className="landing-view-all"><Link href="/play/">View all plays <span aria-hidden="true">→</span></Link></div>
      </section>

      <section className="landing-section landing-upcoming">
        <div className="site-container">
          <div className="landing-section-heading landing-section-heading-light">
            <div><p className="landing-kicker">Plan your next night out</p><h2>Upcoming shows</h2></div>
          </div>
          {shows.length ? <div className="landing-show-rail">
            {shows.map(show => <article className="landing-show-card" key={show.id}>
              <div className="landing-show-date"><strong>{new Intl.DateTimeFormat("en-NP", { day: "2-digit", timeZone: "Asia/Kathmandu" }).format(show.showtime)}</strong><span>{new Intl.DateTimeFormat("en-NP", { month: "short", timeZone: "Asia/Kathmandu" }).format(show.showtime)}</span></div>
              <div><p className="landing-show-time">{showTime.format(show.showtime)}</p><h3><Link href={`/play/${show.play.slug}/`}>{show.play.title}</Link></h3><p>{show.theatre.title}</p>{show.price != null && <p className="landing-price">From NPR {show.price.toLocaleString()}</p>}</div>
            </article>)}
          </div> : <div className="landing-empty landing-empty-dark"><h3>No upcoming shows</h3><p>New show dates will appear here as soon as they are announced.</p></div>}
        </div>
      </section>

      <section className="site-container landing-cta">
        <p className="landing-kicker">The stage is waiting</p>
        <h2>Find your next unforgettable performance.</h2>
        <p>Explore productions, meet the people behind them, and discover theatres across Nepal.</p>
        <div className="landing-actions landing-actions-center"><Link className="landing-button landing-button-dark" href="/play/">Explore plays</Link><Link className="landing-button landing-button-outline" href="/theatre/">Find theatres</Link></div>
      </section>
    </main>
  </>;
}
