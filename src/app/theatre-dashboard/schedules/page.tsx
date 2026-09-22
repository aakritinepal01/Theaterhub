import { ScheduleForm } from "@/components/OwnerScheduleForm";
import { getOwnerTheatre, formatDate } from "@/lib/theatre-dashboard";

export const dynamic = "force-dynamic";

export default async function TheatreSchedulesPage() {
  const { theatre } = await getOwnerTheatre();
  if (!theatre) return null;

  const upcomingShows = theatre.shows
    .filter(show => show.showtime >= new Date())
    .sort((a, b) => a.showtime.getTime() - b.showtime.getTime());

  return (
    <div className="owner-schedule-workspace">
      <section className="owner-panel" id="schedules" style={{ margin: 0 }}>
        <div className="owner-panel-head">
          <div>
            <p>Performance calendar</p>
            <h2>Show schedules</h2>
          </div>
          <span>{theatre.showsMeta.length} saved schedules</span>
        </div>

        {theatre.showsMeta.length ? (
          <div className="owner-schedule-list">
            {theatre.showsMeta.map((schedule) => (
              <article key={schedule.id}>
                <span>
                  {schedule.startDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                </span>
                <div>
                  <strong>{schedule.play.title}</strong>
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
          <p className="owner-small-empty">No schedules yet. Complete the form below to create the first one.</p>
        )}
        <div className="owner-schedule-creator">
          <ScheduleForm plays={theatre.plays.map(play => ({ id: play.id, title: play.title, launchedOn: play.launchedOn, endedOn: play.endedOn }))} />
        </div>
      </section>

      <section className="owner-panel owner-generated-shows-inline">
        <div className="owner-panel-head">
          <div>
            <p>Generated performances</p>
            <h2>Upcoming shows</h2>
          </div>
          <span>{upcomingShows.length}</span>
        </div>
        {upcomingShows.length ? (
          <div className="owner-shows-table">
            <table>
              <thead>
                <tr>
                  <th>Production</th>
                  <th>Showtime</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {upcomingShows.map((show) => (
                  <tr key={show.id}>
                    <td><strong>{show.play.title}</strong></td>
                    <td>{new Date(show.showtime).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td>{show.availableSeats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="owner-small-empty">Upcoming shows will appear here after creating a schedule.</p>
        )}
      </section>
    </div>
  );
}
