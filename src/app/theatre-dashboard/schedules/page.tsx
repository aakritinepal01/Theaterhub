import { getOwnerTheatre, formatDate } from "@/lib/theatre-dashboard";

export const dynamic = "force-dynamic";

export default async function TheatreSchedulesPage() {
  const { theatre } = await getOwnerTheatre();
  if (!theatre) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <section className="owner-panel" id="schedules">
        <div className="owner-panel-head">
          <div>
            <p>Performance calendar</p>
            <h2>Show schedules</h2>
          </div>
          <span>{theatre.showsMeta.length} saved schedules</span>
        </div>

        {theatre.plays.length > 0 && (
          <details className="owner-add-play" style={{ marginBottom: "24px" }}>
            <summary>+ Create new show schedule</summary>
            <form action="/api/theatre/schedules" method="post" className="manage-form" style={{ marginTop: "16px" }}>
              <label>
                Production / Play
                <select name="playId" required defaultValue={theatre.plays[0]?.id}>
                  {theatre.plays.map((play) => (
                    <option key={play.id} value={play.id}>
                      {play.title} ({play.status})
                    </option>
                  ))}
                </select>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label>
                  Start date
                  <input type="date" name="startDate" required />
                </label>
                <label>
                  End date
                  <input type="date" name="endDate" required />
                </label>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--owner-text-sub)", margin: "8px 0 4px" }}>
                Show times (24h format HH:MM, comma-separated for multiple, e.g. 17:00, 19:30):
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                <label>Sunday <input name="sunday" placeholder="17:00" /></label>
                <label>Monday <input name="monday" placeholder="17:00" /></label>
                <label>Tuesday <input name="tuesday" placeholder="17:00" /></label>
                <label>Wednesday <input name="wednesday" placeholder="17:00" /></label>
                <label>Thursday <input name="thursday" placeholder="17:00" /></label>
                <label>Friday <input name="friday" placeholder="17:00" /></label>
                <label>Saturday <input name="saturday" placeholder="13:00, 17:00" /></label>
              </div>
              <button style={{ marginTop: "12px" }}>Generate shows</button>
            </form>
          </details>
        )}

        {theatre.showsMeta.length ? (
          <div className="owner-schedule-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
            {theatre.showsMeta.map((schedule) => (
              <article key={schedule.id} style={{ display: "flex", gap: "14px", padding: "14px", border: "1px solid var(--owner-line)", borderRadius: "12px", background: "var(--owner-card-bg)" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--owner-accent)", minWidth: "55px" }}>
                  {schedule.startDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{schedule.play.title}</strong>
                  <small style={{ color: "var(--owner-text-sub)" }}>
                    {formatDate(schedule.startDate)} – {formatDate(schedule.endDate)}
                  </small>
                  <small style={{ color: "var(--owner-text-muted)" }}>
                    {schedule.excludeDates.length} exclusions · {schedule.extraShows.length} extra shows
                  </small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="owner-small-empty">No show schedules found. Create a schedule above to populate show dates.</p>
        )}
      </section>

      <section className="owner-panel owner-generated-shows">
        <div className="owner-panel-head">
          <div>
            <p>Generated performances</p>
            <h2>All individual shows</h2>
          </div>
          <span>{theatre.shows.length} records</span>
        </div>
        {theatre.shows.length ? (
          <div className="owner-shows-table">
            <table>
              <thead>
                <tr>
                  <th>Production</th>
                  <th>Showtime</th>
                  <th>Seats</th>
                  <th>Available</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {theatre.shows.map((show) => (
                  <tr key={show.id}>
                    <td><strong>{show.play.title}</strong></td>
                    <td>{new Date(show.showtime).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td>{show.totalSeats}</td>
                    <td>{show.availableSeats}</td>
                    <td>{show.price != null ? `NPR ${show.price.toLocaleString()}` : "Free / RSVP"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="owner-small-empty">No generated shows found.</p>
        )}
      </section>
    </div>
  );
}
