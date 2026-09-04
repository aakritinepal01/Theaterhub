import Link from "next/link";
import { getOwnerTheatre, formatDate } from "@/lib/theatre-dashboard";

export const dynamic = "force-dynamic";

export default async function TheatreOverviewPage() {
  const { theatre } = await getOwnerTheatre();
  if (!theatre) return null;

  const published = theatre.plays.filter((play) => play.status === "PUBLISHED").length;
  const upcoming = theatre.shows.filter((show) => show.showtime >= new Date()).length;
  const profileStrength = [
    theatre.about,
    theatre.profilePic,
    theatre.coverImage,
    theatre.email,
    theatre.phone,
    theatre.address,
    theatre.linkWebsite,
  ].filter(Boolean).length;
  const strength = Math.round((profileStrength / 7) * 100);

  const recentPlays = theatre.plays.slice(0, 3);
  const recentSchedules = theatre.showsMeta.slice(0, 4);

  return (
    <>
      <section
        className="owner-cover"
        style={
          theatre.coverImage
            ? {
                backgroundImage: `linear-gradient(90deg,rgba(10,9,11,.95),rgba(10,9,11,.5)),url(${JSON.stringify(
                  theatre.coverImage
                ).slice(1, -1)})`,
              }
            : undefined
        }
      >
        <div className="owner-cover-copy">
          <p>Theatre management studio</p>
          <h1>{theatre.title}</h1>
          <span>{theatre.address || "Add your theatre address"}</span>
          <div>
            <b className={theatre.status === "PUBLISHED" ? "published" : "draft"}>{theatre.status}</b>
            {theatre.establishedOn && <small>Established {theatre.establishedOn.getFullYear()}</small>}
          </div>
        </div>
        <div className="owner-profile-score">
          <strong>{strength}%</strong>
          <span>Profile complete</span>
          <i>
            <b style={{ width: `${strength}%` }} />
          </i>
          <Link href="/theatre-dashboard/profile">Complete profile</Link>
        </div>
      </section>

      <section className="owner-stats">
        <article>
          <span>Productions</span>
          <strong>{theatre.plays.length}</strong>
          <small>{published} published</small>
        </article>
        <article>
          <span>Show schedules</span>
          <strong>{theatre.showsMeta.length}</strong>
          <small>Saved schedules</small>
        </article>
        <article>
          <span>Generated shows</span>
          <strong>{theatre.shows.length}</strong>
          <small>{upcoming} upcoming</small>
        </article>
        <article>
          <span>Archive rating</span>
          <strong>
            {theatre.plays.length
              ? (theatre.plays.reduce((sum, play) => sum + play.ratingAverage, 0) / theatre.plays.length).toFixed(1)
              : "—"}
          </strong>
          <small>Average across plays</small>
        </article>
      </section>

      <div className="owner-main-grid">
        <section className="owner-panel">
          <div className="owner-panel-head">
            <div>
              <p>Production archive</p>
              <h2>Recent plays</h2>
            </div>
            <Link href="/theatre-dashboard/productions">View all productions →</Link>
          </div>
          {recentPlays.length ? (
            <div className="owner-play-list">
              {recentPlays.map((play) => (
                <div className="owner-play-row" key={play.id}>
                  <div
                    className="owner-play-poster"
                    style={
                      play.coverImage
                        ? { backgroundImage: `url(${JSON.stringify(play.coverImage).slice(1, -1)})` }
                        : undefined
                    }
                  >
                    {!play.coverImage && play.title.slice(0, 1)}
                  </div>
                  <div className="owner-play-info">
                    <span>{play.status}</span>
                    <h3>{play.title}</h3>
                    <p>{play.abstract || play.description || "No production summary added yet."}</p>
                    <small>
                      {formatDate(play.launchedOn)} {play.duration ? `· ${play.duration} min` : ""}{" "}
                      {play.ratingCount ? `· ★ ${play.ratingAverage.toFixed(1)}` : ""}
                    </small>
                  </div>
                  <Link href="/theatre-dashboard/productions" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                    Manage →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="owner-empty">
              <span>♪</span>
              <h3>No plays added yet</h3>
              <p>Start building your theatre archive with its first production.</p>
              <Link href="/theatre-dashboard/productions" className="owner-profile-link" style={{ marginTop: "12px", display: "inline-block" }}>
                + Add production
              </Link>
            </div>
          )}
        </section>

        <aside className="owner-side-column">
          <section className="owner-panel owner-contact">
            <div className="owner-panel-head">
              <div>
                <p>Contact information</p>
                <h2>Public details</h2>
              </div>
              <Link href="/theatre-dashboard/profile">Edit →</Link>
            </div>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{theatre.email || "Not added"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{theatre.phone || "Not added"}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{theatre.address || "Not added"}</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>{theatre.linkWebsite || "Not added"}</dd>
              </div>
            </dl>
          </section>

          <section className="owner-panel">
            <div className="owner-panel-head">
              <div>
                <p>Performance calendar</p>
                <h2>Show schedules</h2>
              </div>
              <Link href="/theatre-dashboard/schedules">All schedules →</Link>
            </div>
            {recentSchedules.length ? (
              <div className="owner-schedule-list">
                {recentSchedules.map((schedule) => (
                  <article key={schedule.id}>
                    <span>
                      {schedule.startDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                    </span>
                    <div>
                      <strong>{schedule.play.title}</strong>
                      <small>
                        {formatDate(schedule.startDate)} – {formatDate(schedule.endDate)}
                      </small>
                      <small>
                        {schedule.excludeDates.length} exclusions · {schedule.extraShows.length} extra shows
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="owner-small-empty">No show schedules found.</p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
