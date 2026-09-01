import Link from "next/link";

type HeroStat = {
  label: string;
  value: number;
};

export function Hero({ images, stats }: { images: string[]; stats: HeroStat[] }) {
  const backgroundImage = images[0];

  return <section className="landing-hero" aria-label="Welcome to TheaterHub">
    <div className="landing-hero-backgrounds" aria-hidden="true">
      {backgroundImage ? (
        <div
          className="landing-hero-art is-active"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : null}
    </div>
    <div className="landing-hero-shade" />
    <div className="site-container landing-hero-content">
      <div className="landing-hero-copy">
        <p className="landing-eyebrow">
          NEPAL&apos;S THEATRE, ALL IN ONE PLACE
        </p>
        <h1>Where Nepal&apos;s stories step into the light.</h1>
        <p className="landing-lead">Discover unforgettable performances, meet the artists behind them, and find your place in Nepal&apos;s living theatre scene.</p>
        <div className="landing-actions">
          <Link className="landing-button landing-button-primary" href="/play/">Explore Plays</Link>
          <Link className="landing-button landing-button-ghost" href="/about-us/">About Us</Link>
        </div>
      </div>
      <aside className="landing-hero-stats" aria-label="TheatreHub statistics">
        {stats.map(stat => <div className="landing-hero-stat-item" key={stat.label}>
          <div className="landing-hero-stat-num">
            <strong>{stat.value}</strong>
            <span className="landing-hero-stat-plus">+</span>
          </div>
          <span className="landing-hero-stat-label">{stat.label}</span>
        </div>)}
      </aside>
    </div>
  </section>;
}
