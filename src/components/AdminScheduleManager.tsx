"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import shared from "./AdminProductionManager.module.css";
import styles from "./AdminScheduleManager.module.css";

const days = [
  ["sunday", "Sunday"],
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
] as const;

export type AdminScheduleRecord = {
  id: number;
  playId: number;
  theatreId: number;
  startDate: string;
  endDate: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  play: { id: number; title: string; slug: string | null };
  theatre: { id: number; title: string };
  exclusions: number;
  extras: number;
  shows: number;
  bookings: number;
};

export type ScheduleProductionOption = {
  id: number;
  title: string;
  theatre: { id: number; title: string } | null;
  hasSchedule: boolean;
};

type ModalState = { type: "create" } | { type: "edit"; schedule: AdminScheduleRecord } | null;

async function responsePayload(response: Response): Promise<{ error?: string; message?: string }> {
  try { return await response.json() as { error?: string; message?: string }; } catch { return {}; }
}

function prettyDate(value: string) {
  return new Intl.DateTimeFormat("en-NP", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
}

function ScheduleForm({
  schedule,
  productions,
  onClose,
  onSaved,
}: {
  schedule?: AdminScheduleRecord;
  productions: ScheduleProductionOption[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const prefix = schedule ? `schedule-${schedule.id}` : "schedule-new";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(schedule ? `/api/admin/schedules/${schedule.id}` : "/api/admin/schedules", {
        method: schedule ? "PATCH" : "POST",
        body: new FormData(event.currentTarget),
      });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Could not save the schedule.");
      onSaved(payload.message || (schedule ? "Schedule updated." : "Schedule added."));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save the schedule.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={shared.form} onSubmit={submit}>
      <div className={shared.formSection}>
        <div className={shared.sectionHeading}>
          <span>01</span><div><h3>Production & date range</h3><p>The venue is taken automatically from the selected production.</p></div>
        </div>
        <div className={shared.formGrid}>
          <label className={shared.fieldWide} htmlFor={`${prefix}-play`}>
            <span>Production *</span>
            <select id={`${prefix}-play`} name="playId" defaultValue={schedule?.playId ?? ""} required>
              <option value="" disabled>Select a production</option>
              {productions.map((production) => (
                <option
                  key={production.id}
                  value={production.id}
                  disabled={!production.theatre || (production.hasSchedule && production.id !== schedule?.playId)}
                >
                  {production.title} — {production.theatre?.title ?? "No theatre"}{production.hasSchedule && production.id !== schedule?.playId ? " (schedule exists)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor={`${prefix}-start`}><span>Start date *</span><input id={`${prefix}-start`} type="date" name="startDate" defaultValue={schedule?.startDate.slice(0, 10) ?? ""} required /></label>
          <label htmlFor={`${prefix}-end`}><span>End date *</span><input id={`${prefix}-end`} type="date" name="endDate" defaultValue={schedule?.endDate.slice(0, 10) ?? ""} required /></label>
        </div>
      </div>

      <div className={shared.formSection}>
        <div className={shared.sectionHeading}>
          <span>02</span><div><h3>Weekly showtimes</h3><p>Enter one or more 24-hour times for each performance day.</p></div>
        </div>
        <div className={styles.dayGrid}>
          {days.map(([key, label]) => (
            <label key={key} htmlFor={`${prefix}-${key}`}>
              <span>{label}</span>
              <input id={`${prefix}-${key}`} name={key} defaultValue={schedule?.[key] ?? ""} placeholder="17:30, 19:00" inputMode="numeric" />
            </label>
          ))}
        </div>
        <p className={styles.dayHint}>Use <strong>HH:MM</strong> in 24-hour format. Separate multiple shows with commas, for example: 14:00, 18:30.</p>
        {schedule && schedule.bookings > 0 && <p className={styles.bookingWarning}>This schedule has {schedule.bookings} booking{schedule.bookings === 1 ? "" : "s"}. Editing is locked by the server so booked show records are not accidentally rebuilt.</p>}
      </div>

      {error && <div className={shared.formError} role="alert">{error}</div>}
      <div className={shared.formActions}>
        <button type="button" className={shared.secondaryButton} onClick={onClose} disabled={saving}>Cancel</button>
        <button type="submit" className={shared.primaryButton} disabled={saving}>{saving ? "Saving..." : schedule ? "Save schedule" : "Add schedule"}</button>
      </div>
    </form>
  );
}

export function AdminScheduleManager({
  schedules,
  productions,
  totalSchedules,
}: {
  schedules: AdminScheduleRecord[];
  productions: ScheduleProductionOption[];
  totalSchedules: number;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [deleting, setDeleting] = useState<AdminScheduleRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const today = new Date().toISOString().slice(0, 10);

  const visibleSchedules = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return schedules.filter((schedule) => {
      const active = schedule.endDate.slice(0, 10) >= today;
      const matchesStatus = status === "ALL" || (status === "ACTIVE" ? active : !active);
      const haystack = `${schedule.play.title} ${schedule.theatre.title} ${schedule.id}`.toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [query, schedules, status, today]);

  function saved(message: string) {
    const wasCreate = modal?.type === "create";
    setModal(null);
    setNotice(message);
    if (wasCreate) router.push("/admin/schedules");
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/admin/schedules/${deleting.id}`, { method: "DELETE" });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Could not delete the schedule.");
      setDeleting(null);
      setNotice(payload.message || "Schedule deleted.");
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete the schedule.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className={`${shared.manager} ${styles.theme}`}>
      <div className={shared.toolbar}>
        <div><span className={shared.eyebrow}>Calendar management</span><h2>Show schedules</h2><p>Add, edit or remove any of the {totalSchedules} performance schedules.</p></div>
        <button className={shared.addButton} type="button" onClick={() => { setNotice(""); setModal({ type: "create" }); }}><span aria-hidden="true">+</span> Add schedule</button>
      </div>

      {notice && <div className={shared.notice} role="status"><span aria-hidden="true">✓</span>{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

      <div className={shared.filters}>
        <label className={shared.searchBox}><SearchIcon /><span className={shared.srOnly}>Search this page</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search production, theatre or ID..." /></label>
        <label className={shared.statusFilter}><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All schedules</option><option value="ACTIVE">Active & upcoming</option><option value="ENDED">Ended</option></select></label>
        <span className={shared.resultCount}>{visibleSchedules.length} on this page</span>
      </div>

      {visibleSchedules.length ? (
        <div className={styles.scheduleGrid}>
          {visibleSchedules.map((schedule) => {
            const active = schedule.endDate.slice(0, 10) >= today;
            const slots = days.map(([key, label]) => [label.slice(0, 3), schedule[key]] as const).filter(([, time]) => time);
            return (
              <article className="adm-schedule-card" key={schedule.id}>
                <div className="adm-schedule-card-accent" aria-hidden="true" />
                <div className="adm-schedule-card-head"><span className="adm-schedule-id">SCHEDULE #{schedule.id}</span><span className={`adm-schedule-status ${active ? "is-active" : "is-ended"}`}><span aria-hidden="true" />{active ? "Active" : "Ended"}</span></div>
                <h3>{schedule.play.title}</h3>
                <p className="adm-schedule-venue"><span aria-hidden="true">⌂</span> {schedule.theatre.title}</p>
                <div className="adm-schedule-date-range"><div><small>START</small><strong>{prettyDate(schedule.startDate)}</strong></div><span aria-hidden="true">→</span><div><small>END</small><strong>{prettyDate(schedule.endDate)}</strong></div></div>
                <div className="adm-schedule-slot-block"><small>WEEKLY SHOWTIMES</small><div className="adm-schedule-slots">{slots.length ? slots.map(([day, time]) => <span key={day}><strong>{day}</strong>{time}</span>) : <span className="is-empty">No recurring showtimes</span>}</div></div>
                <div className={styles.scheduleFacts}><span>{schedule.shows} generated shows</span><span>{schedule.bookings} bookings</span><span>{schedule.exclusions} excluded</span><span>{schedule.extras} extra</span></div>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.editButton} onClick={() => { setNotice(""); setModal({ type: "edit", schedule }); }}>Edit schedule</button>
                  {schedule.play.slug ? <Link href={`/play/${schedule.play.slug}/`} target="_blank" rel="noopener noreferrer">View ↗</Link> : <span />}
                  <button type="button" className={styles.deleteButton} onClick={() => { setDeleteError(""); setDeleting(schedule); }}>Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={shared.empty}><span aria-hidden="true">⌕</span><h3>{schedules.length ? "No matching schedules" : "No schedules yet"}</h3><p>{schedules.length ? "Change the search or status filter." : "Add the first performance calendar."}</p>{!schedules.length && <button type="button" className={shared.addButton} onClick={() => setModal({ type: "create" })}>+ Add schedule</button>}</div>
      )}

      {modal && <div className={`${shared.overlay} ${styles.centeredOverlay}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><section className={shared.modal} role="dialog" aria-modal="true" aria-labelledby="schedule-dialog-title"><header className={shared.modalHeader}><div><span>{modal.type === "edit" ? `SCHEDULE #${modal.schedule.id}` : "NEW PERFORMANCE CALENDAR"}</span><h2 id="schedule-dialog-title">{modal.type === "edit" ? "Edit schedule" : "Add schedule"}</h2><p>Manage the date range and weekly showtimes. Generated shows update automatically.</p></div><button type="button" onClick={() => setModal(null)} aria-label="Close schedule form">×</button></header><ScheduleForm key={modal.type === "edit" ? modal.schedule.id : "create"} schedule={modal.type === "edit" ? modal.schedule : undefined} productions={productions} onClose={() => setModal(null)} onSaved={saved} /></section></div>}

      {deleting && <div className={`${shared.overlay} ${styles.centeredOverlay}`} role="presentation" onMouseDown={(event) => { if (!isDeleting && event.target === event.currentTarget) setDeleting(null); }}><section className={`${shared.modal} ${shared.deleteModal}`} role="alertdialog" aria-modal="true" aria-labelledby="delete-schedule-title" aria-describedby="delete-schedule-description"><div className={shared.dangerIcon} aria-hidden="true">!</div><span className={shared.dangerEyebrow}>Permanent action</span><h2 id="delete-schedule-title">Delete schedule #{deleting.id}?</h2><p id="delete-schedule-description">This removes the performance calendar, generated shows and their booking records. The production and theatre stay intact.</p><div className={`${shared.deleteImpact} ${styles.deleteImpactThree}`}><span><strong>{deleting.shows}</strong> shows</span><span><strong>{deleting.bookings}</strong> bookings</span><span><strong>{deleting.exclusions + deleting.extras}</strong> exceptions</span></div>{deleteError && <div className={shared.formError} role="alert">{deleteError}</div>}<div className={shared.deleteActions}><button type="button" className={shared.secondaryButton} onClick={() => setDeleting(null)} disabled={isDeleting}>Keep schedule</button><button type="button" className={shared.confirmDeleteButton} onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete permanently"}</button></div></section></div>}
    </section>
  );
}
