"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Production = {
  id: number;
  title: string;
  launchedOn: Date | string | null;
  endedOn: Date | string | null;
};
const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
function dateValue(value: Date | string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function ScheduleForm({ plays }: { plays: Production[] }) {
  const router = useRouter();
  const [playId, setPlayId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const body = new FormData(event.currentTarget);
    if (!days.some(day => String(body.get(day) || "").trim())) {
      setError(true);
      setNotice("Add at least one show time.");
      return;
    }
    setSaving(true);
    setNotice("");
    setError(false);
    try {
      const response = await fetch("/api/theatre/schedules", {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) throw new Error(result?.error || "Unable to save schedule. Please try again.");
      setNotice("Schedule saved. Your upcoming shows have been updated.");
      router.refresh();
    } catch (cause) {
      setError(true);
      setNotice(cause instanceof Error ? cause.message : "Connection lost. Please try again.");
    } finally { setSaving(false); }
  }

  if (!plays.length) return <p className="schedule-empty-note">Add a production before creating its schedule. <Link href="/theatre-dashboard/productions#add-play">Add production</Link></p>;

  return (
    <form className="manage-form owner-schedule-form" onSubmit={submit} aria-busy={saving}>
      <div className="schedule-form-heading"><span>New schedule</span><h3>Plan your performances</h3><p>Select a production, its performance dates and weekly showtimes.</p></div>
      <label>Production
        <select name="playId" value={playId} required onChange={event => {
          setPlayId(event.target.value);
          const selected = plays.find(play => play.id === Number(event.target.value));
          setStart(dateValue(selected?.launchedOn ?? null));
          setEnd(dateValue(selected?.endedOn ?? null));
          setNotice("");
        }}>
          <option value="" disabled>Select a production</option>
          {plays.map(play => <option key={play.id} value={play.id}>{play.title}</option>)}
        </select>
      </label>
      <div className="schedule-date-grid">
        <label>Start date<input name="startDate" type="date" value={start} onChange={event => setStart(event.target.value)} required /></label>
        <label>End date<input name="endDate" type="date" value={end} min={start || undefined} onChange={event => setEnd(event.target.value)} required /></label>
      </div>
      <div className="schedule-week-grid">
        {days.map(day => <label key={day}>{day[0].toUpperCase() + day.slice(1)}<input name={day} placeholder="17:30, 19:00" pattern="\s*([01][0-9]|2[0-3]):[0-5][0-9](\s*,\s*([01][0-9]|2[0-3]):[0-5][0-9])*\s*" title="Enter 24-hour times separated by commas, e.g. 17:30, 19:00" /></label>)}
      </div>
      <button disabled={saving || !playId}>{saving ? "Creating schedule…" : "Create schedule"}</button>
      {notice && <p role={error ? "alert" : "status"}>{notice}</p>}
    </form>
  );
}
