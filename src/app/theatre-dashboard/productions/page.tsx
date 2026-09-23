import { PlayEditor } from "@/components/TheatreDashboardForms";
import { ImageUploadField } from "@/components/ImageUploadField";
import { ProductionCreditsFields } from "@/components/ProductionCreditsFields";
import { getOwnerTheatre, formatDate } from "@/lib/theatre-dashboard";

export const dynamic = "force-dynamic";

function displayStatus(play: { status: string; launchedOn: Date | null; endedOn: Date | null }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (play.status === "UPCOMING" && play.launchedOn && new Date(play.launchedOn) <= today) {
    if (play.endedOn && new Date(play.endedOn) < today) return "ARCHIVED";
    return "PUBLISHED";
  }
  return play.status;
}

export default async function TheatreProductionsPage() {
  const { theatre } = await getOwnerTheatre();
  if (!theatre) return null;

  const published = theatre.plays.filter((play) => play.status === "PUBLISHED").length;

  return (
    <div className="owner-productions-page" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <section className="owner-panel" id="plays" style={{ margin: 0 }}>
        <div className="owner-panel-head">
          <div>
            <p>Production Archive</p>
            <h2>Your plays &amp; productions</h2>
          </div>
          <span>
            {theatre.plays.length} total&nbsp;·&nbsp;{published} published
          </span>
        </div>

        {theatre.plays.length ? (
          <div className="owner-play-list">
            {theatre.plays.map((play) => (
              <div className="owner-play-card" key={play.id}>
                <div className="owner-play-row">
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
                    <span className="owner-play-badge">{displayStatus(play)}</span>
                    <h3>{play.title}</h3>
                    <p>{play.abstract || play.description || "No production summary added yet."}</p>
                    <small>
                      {formatDate(play.launchedOn)} {play.duration ? `· ${play.duration} min` : ""}{" "}
                      {play.ratingCount ? `· ★ ${play.ratingAverage.toFixed(1)}` : ""}
                    </small>
                  </div>
                </div>
                <div className="owner-production-actions"><PlayEditor play={play} /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="owner-empty">
            <span>♪</span>
            <h3>No plays added yet</h3>
            <p>Start building your theatre archive with its first production below.</p>
          </div>
        )}

        <details className="owner-add-play owner-add-play--cta" id="add-play">
          <summary>+ Add a new production</summary>
          <form action="/api/theatre/plays" method="post" className="manage-form">
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Status
              <select name="status" defaultValue="PUBLISHED">
                <option value="PUBLISHED">Published</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="DRAFT">Draft</option>
              </select>
            </label>

            <ImageUploadField
              label="Poster image"
              name="coverImage"
              aspect="avatar"
              folder="theatres/plays"
            />

            <label>
              Launched on
              <input type="date" name="launchedOn" />
            </label>
            <label>
              Ended on
              <input type="date" name="endedOn" />
            </label>
            <label>
              Duration (minutes)
              <input type="number" min="1" name="duration" />
            </label>
            <label>
              Description
              <textarea name="description" />
            </label>
            <label>
              Abstract
              <textarea name="abstract" />
            </label>
            <label>
              Directorial note
              <textarea name="directorialNote" />
            </label>
            <ProductionCreditsFields />
            <label>
              <input type="checkbox" name="isFeatured" /> Featured play
            </label>
            <button>Add play</button>
          </form>
        </details>

      </section>
    </div>
  );
}
