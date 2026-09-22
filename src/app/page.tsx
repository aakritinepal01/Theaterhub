import { featuredStoryGroups, featuredReelGroups } from "@/lib/featured-theatre-media";
import Link from "next/link";
import { getTheatrePhoto, mediaUrl } from "@/lib/content";
import { getFeaturedPlays, getPlayingNowPlays, getHeroPlays, getHomepageStats, getHomepageTheatres, getUpcomingShows, getHomepageTheatreReels, getHomepageTheatreStories } from "@/lib/home";
import { Hero } from "@/components/Hero";
import { LiveStageMarquee } from "@/components/LiveStageMarquee";
import { PlayCard } from "@/components/PlayCard";
import { ReelsSection } from "@/components/ReelsSection";
import { PhotoStories } from "@/components/PhotoStories";
import { loadHomeSection } from "@/lib/home-section";
import { getRecentPlays } from "@/lib/home";

export const dynamic = "force-dynamic";



export default async function Home() {
  let plays: Awaited<ReturnType<typeof getFeaturedPlays>> = [];
  let playingNow: Awaited<ReturnType<typeof getPlayingNowPlays>> = [];
  let recentPlays: Awaited<ReturnType<typeof getRecentPlays>> = [];
  let heroPlays: Awaited<ReturnType<typeof getHeroPlays>> = [];
  let shows: Awaited<ReturnType<typeof getUpcomingShows>> = [];
  let theatres: Awaited<ReturnType<typeof getHomepageTheatres>> = [];
  let theatreReels: Awaited<ReturnType<typeof getHomepageTheatreReels>> = [];
  let theatreStories: Awaited<ReturnType<typeof getHomepageTheatreStories>> = [];
  let stats = { plays: 0, theatres: 0, bookings: 0, upcomingShows: 0 };

  try {
    [plays, heroPlays, shows, stats, theatres, theatreReels, theatreStories, playingNow, recentPlays] = await Promise.all([
      loadHomeSection("featured plays", getFeaturedPlays, plays),
      loadHomeSection("hero", getHeroPlays, heroPlays),
      loadHomeSection("upcoming shows", getUpcomingShows, shows),
      loadHomeSection("statistics", getHomepageStats, stats),
      loadHomeSection("theatres", getHomepageTheatres, theatres),
      loadHomeSection("theatre reels", getHomepageTheatreReels, theatreReels),
      loadHomeSection("theatre stories", getHomepageTheatreStories, theatreStories),
      loadHomeSection("playing now", getPlayingNowPlays, playingNow),
      loadHomeSection("recent plays", getRecentPlays, recentPlays),
    ]);
  } catch (error) {
    console.error("Unable to load landing-page data", error);
  }

  const heroImages = heroPlays.flatMap((play) => {
    const image = mediaUrl(play.coverImage);
    return image ? [image] : [];
  });
  const heroImage = "/hero-theatre-stage.png";
  const currentIds = new Set(playingNow.map(play => play.id));
  const featuredIds = new Set(plays.map(play => play.id));
  const spotlightPlays = [...new Map([...playingNow, ...plays, ...recentPlays]
    .filter(play => play.slug)
    .map(play => [play.id, play])).values()]
    .map(play => ({ ...play, stageLabel: currentIds.has(play.id) ? "ON STAGE" : featuredIds.has(play.id) ? "FEATURED" : "RECENT" }));

  const heroStats = [
    { value: stats.plays, label: "Published plays" },
    { value: stats.theatres, label: "Theatres" },
    { value: stats.upcomingShows, label: "Upcoming shows" },
    { value: stats.bookings, label: "Bookings" },
  ];

  return (
    <>
      <Hero images={heroImage ? [heroImage] : []} stats={heroStats} />

      <main>
        {/* ── 0. LIVE STAGE MARQUEE TICKER (Auto-scrolling Live Plays in Nepal) ── */}
        <LiveStageMarquee plays={spotlightPlays} />

        {/* ── 1. FEATURED PLAYS (Curated Showcase) ── */}
        <section className="landing-section landing-featured site-container">
          <div className="landing-section-heading">
            <div>
              <span className="landing-kicker">Handpicked Stage Craft</span>
              <h2>Featured Plays &amp; Productions</h2>
              <p className="landing-section-subtext">
                Discover Nepal&apos;s most captivating dramas, musicals, and experimental stage performances.
              </p>
            </div>
            <Link href="/play/" className="landing-section-link-light">
              Browse all plays <span aria-hidden="true">→</span>
            </Link>
          </div>

          {plays.length ? (
            <div className="landing-play-grid">
              {plays.filter(play => play.slug).map((play) => (
                <PlayCard
                  key={play.id}
                  play={play}
                  showTeaser={false}
                  showAction={false}
                />
              ))}
            </div>
          ) : (
            <div className="landing-empty">
              <h3>No featured plays published yet</h3>
              <p>Check back soon as theatre companies publish new stage productions.</p>
            </div>
          )}

          <div className="landing-view-all">
            <Link href="/play/">
              View all plays archive <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <ReelsSection items={theatreReels.map((reel) => ({ id: reel.id, title: reel.title, videoUrl: reel.videoUrl, theatreTitle: reel.theatre.title }))} />

        {/* ── THEATREHUB STORIES (Interactive Theatre Stories) ── */}
        <PhotoStories
          groups={(() => {
            const managed = theatreStories.reduce<Record<string, { id: string; title: string; stories: { id: number; title: string; image: string; href: string }[] }>>((groups, story) => {
              const key = story.theatre.slug || `theatre-${story.theatre.title}`;
              groups[key] ||= { id: `managed-${key}`, title: story.theatre.title, stories: [] };
              groups[key].stories.push({ id: story.id, title: story.title, image: story.imageUrl, href: story.theatre.slug ? `/theatre/${story.theatre.slug}` : "/theatre/" });
              return groups;
            }, {});
            const kantipurStories = [
              { id: 1000001, title: "Theatre at Kantipur", image: "/story-images/theatre-story-1.jpg", href: "/theatre/" },
              { id: 1000002, title: "Theatre at Kantipur", image: "/story-images/theatre-story-2.jpg", href: "/theatre/" },
              { id: 1000003, title: "Theatre at Kantipur", image: "/story-images/theatre-story-3.jpg", href: "/theatre/" },
            ];
            const secondStories = [
              { id: 1000004, title: "Theatre Workshop", image: "/story-images/theatre-story-4.jpg", href: "/theatre/" },
              { id: 1000005, title: "Theatre Workshop", image: "/story-images/theatre-story-5.jpg", href: "/theatre/" },
              { id: 1000006, title: "Theatre Workshop", image: "/story-images/theatre-story-6.jpg", href: "/theatre/" },
              { id: 1000007, title: "Theatre Workshop", image: "/story-images/theatre-story-7.jpg", href: "/theatre/" },
              { id: 1000008, title: "Theatre Workshop", image: "/story-images/theatre-story-8.jpg", href: "/theatre/" },
            ];
            const thirdStories = [
              { id: 1000009, title: "Theatre Production", image: "/story-images/theatre-story-9.jpg", href: "/theatre/" },
              { id: 1000010, title: "Theatre Production", image: "/story-images/theatre-story-10.jpg", href: "/theatre/" },
              { id: 1000011, title: "Theatre Production", image: "/story-images/theatre-story-11.jpg", href: "/theatre/" },
              { id: 1000012, title: "Theatre Production", image: "/story-images/theatre-story-12.jpg", href: "/theatre/" },
            ];
            const fourthStories = [
              { id: 1000013, title: "Theatre Spotlight", image: "/story-images/theatre-story-13.jpg", href: "/theatre/" },
              { id: 1000014, title: "Theatre Spotlight", image: "/story-images/theatre-story-14.jpg", href: "/theatre/" },
              { id: 1000015, title: "Theatre Spotlight", image: "/story-images/theatre-story-15.jpg", href: "/theatre/" },
              { id: 1000016, title: "Theatre Spotlight", image: "/story-images/theatre-story-16.jpg", href: "/theatre/" },
            ];
            const fifthStories = [
              { id: 1000017, title: "Stage Spaces", image: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
              { id: 1000018, title: "Stage Spaces", image: "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
              { id: 1000019, title: "Stage Spaces", image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
            ];
            const sixthStories = [
              { id: 1000020, title: "Behind the Curtain", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
              { id: 1000021, title: "Behind the Curtain", image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
              { id: 1000022, title: "Behind the Curtain", image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
            ];
            return [...Object.values(managed), {
              id: "photo-story-kantipur",
              title: "TheaterHub Stories",
              stories: kantipurStories.slice(0, 3),
            }, {
              id: "photo-story-workshop",
              title: "TheaterHub Stories",
              stories: secondStories,
            }, {
              id: "photo-story-production",
              title: "TheaterHub Stories",
              stories: thirdStories,
            }, {
              id: "photo-story-spotlight",
              title: "TheaterHub Stories",
              stories: fourthStories,
            }, {
              id: "photo-story-spaces",
              title: "TheaterHub Stories",
              stories: fifthStories,
            }, {
              id: "photo-story-curtain",
              title: "TheaterHub Stories",
              stories: sixthStories,
            }];
          })()}
        />

        {/* ── 2. UPCOMING SHOWS (Stage Calendar & Tickets) ── */}
        <section className="landing-section landing-upcoming">
          <div className="landing-upcoming-orb" aria-hidden="true" />

          <div className="site-container">
            <div className="landing-section-heading landing-section-heading-light">
              <div>
                <span className="landing-kicker">Live Stage Calendar</span>
                <h2>Upcoming Shows &amp; Performances</h2>
                <p className="landing-section-copy">
                  Reserve your seats for live stage shows playing in Kathmandu, Pokhara, and across Nepal.
                </p>
              </div>
              <Link className="landing-section-link-light" href="/play/">
                Explore all dates <span aria-hidden="true">→</span>
              </Link>
            </div>

            {shows.length ? (
              <div className="landing-play-grid">
                {shows.map(show => (
                  <PlayCard key={show.play.id} play={show.play} showTeaser={false} />
                ))}
              </div>
            ) : (
              <div className="landing-empty landing-empty-dark landing-schedule-empty">
                <div className="landing-empty-copy">
                  <span className="landing-kicker">Live Calendar Update</span>
                  <h3>No upcoming shows scheduled today</h3>
                  <p>
                    Theatre teams publish new show dates regularly. Create an account or reach out to list your upcoming play run.
                  </p>
                  <div className="landing-actions">
                    <Link className="about-btn about-btn-primary" href="/play/">
                      Explore Play Catalog
                    </Link>
                    <Link className="about-btn about-btn-ghost" href="/contact-us/">
                      List Your Show Dates
                    </Link>
                  </div>
                </div>

                <div className="landing-empty-points" aria-label="Upcoming show updates">
                  <span>
                    <strong>Performance Schedule</strong>
                    <small>Exact dates, showtime slots &amp; matinee runs</small>
                  </span>
                  <span>
                    <strong>Venue &amp; Seating</strong>
                    <small>Hall locations, stage styles &amp; capacity</small>
                  </span>
                  <span>
                    <strong>Ticket Pricing</strong>
                    <small>Real-time ticket rates and box office info</small>
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {theatres.length > 0 && (
          <section className="landing-theatre-profiles" aria-labelledby="landing-theatres-title">
            <div className="site-container">
              <div className="landing-theatre-profiles-heading landing-photo-stories-heading">
                <h2 id="landing-theatres-title">Explore Theatres</h2>
                <Link href="/theatre/">View all <span aria-hidden="true">→</span></Link>
              </div>
              <div className="landing-theatre-profile-list">
                {theatres.map((theatre) => {
                  const profilePic = mediaUrl(theatre.profilePic) ?? mediaUrl(theatre.coverImage) ?? getTheatrePhoto(theatre);
                  return (
                    <Link className="landing-theatre-profile" href={`/theatre/${theatre.slug}/`} key={theatre.id}>
                      <span className="landing-theatre-avatar">
                        {profilePic ? <img src={profilePic} alt="" /> : <span aria-hidden="true">{theatre.title.slice(0, 1).toUpperCase()}</span>}
                      </span>
                      <strong>{theatre.title}</strong>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </main>
    </>
  );
}
