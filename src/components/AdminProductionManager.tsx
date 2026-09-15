"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ImageUploadField } from "@/components/ImageUploadField";
import styles from "./AdminProductionManager.module.css";

export type AdminProductionRecord = {
  id: number;
  title: string;
  slug: string | null;
  status: "DRAFT" | "PUBLISHED" | "UPCOMING";
  metaTitle: string | null;
  description: string;
  keywordsString: string;
  abstract: string;
  directorialNote: string;
  coverImage: string | null;
  poster: string | null;
  duration: number | null;
  launchedOn: string | null;
  endedOn: string | null;
  publishDate: string | null;
  expiryDate: string | null;
  isFeatured: boolean;
  inSitemap: boolean;
  ratingAverage: number;
  ratingCount: number;
  theatreId: number | null;
  theatre: { id: number; title: string } | null;
  related: {
    makers: number;
    cast: number;
    crew: number;
    schedules: number;
    shows: number;
    bookings: number;
  };
};

type TheatreOption = { id: number; title: string };
type ModalState = { type: "create" } | { type: "edit"; play: AdminProductionRecord } | null;

function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function prettyDate(value: string | null) {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

async function responsePayload(response: Response): Promise<{ error?: string; message?: string }> {
  try {
    return (await response.json()) as { error?: string; message?: string };
  } catch {
    return {};
  }
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ProductionForm({
  play,
  theatres,
  onClose,
  onSaved,
}: {
  play?: AdminProductionRecord;
  theatres: TheatreOption[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const prefix = play ? `production-${play.id}` : "production-new";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(play ? `/api/admin/plays/${play.id}` : "/api/admin/plays", {
        method: play ? "PATCH" : "POST",
        body: new FormData(event.currentTarget),
      });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Could not save the production.");
      onSaved(payload.message || (play ? "Production updated." : "Production added."));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save the production.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>01</span>
          <div>
            <h3>Production identity</h3>
            <p>Core archive details and the presenting theatre.</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <label className={styles.fieldWide} htmlFor={`${prefix}-title`}>
            <span>Production title *</span>
            <input id={`${prefix}-title`} name="title" defaultValue={play?.title ?? ""} required maxLength={220} />
          </label>
          <label htmlFor={`${prefix}-theatre`}>
            <span>Theatre / venue</span>
            <select id={`${prefix}-theatre`} name="theatreId" defaultValue={play?.theatreId ?? ""}>
              <option value="">Standalone production</option>
              {theatres.map((theatre) => (
                <option value={theatre.id} key={theatre.id}>{theatre.title}</option>
              ))}
            </select>
          </label>
          <label htmlFor={`${prefix}-status`}>
            <span>Archive status</span>
            <select id={`${prefix}-status`} name="status" defaultValue={play?.status ?? "DRAFT"}>
              <option value="DRAFT">Draft</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </label>
          <label className={styles.fieldWide} htmlFor={`${prefix}-meta-title`}>
            <span>SEO title</span>
            <input id={`${prefix}-meta-title`} name="metaTitle" defaultValue={play?.metaTitle ?? ""} maxLength={220} placeholder="Optional search-engine title" />
          </label>
          <label className={styles.fieldWide} htmlFor={`${prefix}-keywords`}>
            <span>Search keywords</span>
            <input id={`${prefix}-keywords`} name="keywordsString" defaultValue={play?.keywordsString ?? ""} maxLength={1000} placeholder="drama, comedy, Kathmandu…" />
          </label>
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>02</span>
          <div>
            <h3>Dates & runtime</h3>
            <p>Stage run, publishing window and performance length.</p>
          </div>
        </div>
        <div className={styles.formGridThree}>
          <label htmlFor={`${prefix}-launch`}>
            <span>Launch date</span>
            <input id={`${prefix}-launch`} type="date" name="launchedOn" defaultValue={dateInputValue(play?.launchedOn ?? null)} />
          </label>
          <label htmlFor={`${prefix}-end`}>
            <span>End date</span>
            <input id={`${prefix}-end`} type="date" name="endedOn" defaultValue={dateInputValue(play?.endedOn ?? null)} />
          </label>
          <label htmlFor={`${prefix}-duration`}>
            <span>Duration (minutes)</span>
            <input id={`${prefix}-duration`} type="number" name="duration" min={1} max={1440} defaultValue={play?.duration ?? ""} placeholder="90" />
          </label>
          <label htmlFor={`${prefix}-publish`}>
            <span>Publish date</span>
            <input id={`${prefix}-publish`} type="date" name="publishDate" defaultValue={dateInputValue(play?.publishDate ?? null)} />
          </label>
          <label htmlFor={`${prefix}-expiry`}>
            <span>Expiry date</span>
            <input id={`${prefix}-expiry`} type="date" name="expiryDate" defaultValue={dateInputValue(play?.expiryDate ?? null)} />
          </label>
        </div>
      </div>

      <div className={`${styles.formSection} ${styles.uploadTheme}`}>
        <div className={styles.sectionHeading}>
          <span>03</span>
          <div>
            <h3>Production artwork</h3>
            <p>Upload a poster or use an existing image URL.</p>
          </div>
        </div>
        <ImageUploadField
          key={play?.id ?? "new-poster"}
          label="Poster / cover image"
          name="coverImage"
          defaultValue={play?.coverImage ?? ""}
          folder="productions"
          aspect="banner"
          helpText="Use a clean, high-resolution production poster."
        />
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>04</span>
          <div>
            <h3>Archive copy</h3>
            <p>Public description, synopsis and director&apos;s note.</p>
          </div>
        </div>
        <div className={styles.textareaStack}>
          <label htmlFor={`${prefix}-description`}>
            <span>Description</span>
            <textarea id={`${prefix}-description`} name="description" rows={5} defaultValue={play?.description ?? ""} />
          </label>
          <label htmlFor={`${prefix}-abstract`}>
            <span>Abstract / synopsis</span>
            <textarea id={`${prefix}-abstract`} name="abstract" rows={5} defaultValue={play?.abstract ?? ""} />
          </label>
          <label htmlFor={`${prefix}-note`}>
            <span>Directorial note</span>
            <textarea id={`${prefix}-note`} name="directorialNote" rows={5} defaultValue={play?.directorialNote ?? ""} />
          </label>
        </div>
      </div>

      <div className={styles.switches}>
        <label>
          <input type="checkbox" name="isFeatured" defaultChecked={play?.isFeatured ?? false} />
          <span><strong>Featured production</strong><small>Highlight this work across TheatreHub.</small></span>
        </label>
        <label>
          <input type="checkbox" name="inSitemap" defaultChecked={play?.inSitemap ?? true} />
          <span><strong>Include in sitemap</strong><small>Allow search engines to discover the public page.</small></span>
        </label>
      </div>

      {error && <div className={styles.formError} role="alert">{error}</div>}
      <div className={styles.formActions}>
        <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={saving}>Cancel</button>
        <button type="submit" className={styles.primaryButton} disabled={saving}>
          {saving ? "Saving…" : play ? "Save changes" : "Add production"}
        </button>
      </div>
    </form>
  );
}

export function AdminProductionManager({
  plays,
  theatres,
  totalPlays,
}: {
  plays: AdminProductionRecord[];
  theatres: TheatreOption[];
  totalPlays: number;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [deleting, setDeleting] = useState<AdminProductionRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const visiblePlays = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return plays.filter((play) => {
      const matchesStatus = status === "ALL" || play.status === status;
      const haystack = `${play.title} ${play.theatre?.title ?? ""} ${play.id}`.toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [plays, query, status]);

  function saved(message: string) {
    const wasCreate = modal?.type === "create";
    setModal(null);
    setNotice(message);
    if (wasCreate) router.push("/admin/plays");
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/admin/plays/${deleting.id}`, { method: "DELETE" });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Could not delete the production.");
      setDeleting(null);
      setNotice(payload.message || "Production deleted.");
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete the production.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className={styles.manager}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Archive management</span>
          <h2>Production records</h2>
          <p>Add, update and manage all {totalPlays} productions from one place.</p>
        </div>
        <button className={styles.addButton} type="button" onClick={() => { setNotice(""); setModal({ type: "create" }); }}>
          <span aria-hidden="true">+</span> Add production
        </button>
      </div>

      {notice && (
        <div className={styles.notice} role="status">
          <span aria-hidden="true">✓</span>{notice}
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button>
        </div>
      )}

      <div className={styles.filters}>
        <label className={styles.searchBox}>
          <SearchIcon />
          <span className={styles.srOnly}>Search this page</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, theatre or ID…" />
        </label>
        <label className={styles.statusFilter}>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ALL">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="DRAFT">Draft</option>
          </select>
        </label>
        <span className={styles.resultCount}>{visiblePlays.length} on this page</span>
      </div>

      {visiblePlays.length ? (
        <div className={styles.grid}>
          {visiblePlays.map((play) => (
            <article className={styles.card} key={play.id}>
              <div className={styles.poster}>
                {play.poster ? <img src={play.poster} alt={`${play.title} poster`} loading="lazy" /> : <span>THEATREHUB<br />PRODUCTION</span>}
                <div className={styles.posterTop}>
                  <span className={`${styles.status} ${styles[`status${play.status}`]}`}>{play.status}</span>
                  {play.isFeatured && <span className={styles.featured}>Featured</span>}
                </div>
              </div>
              <div className={styles.cardBody}>
                <span className={styles.recordId}>PRODUCTION #{play.id}</span>
                <h3>{play.title}</h3>
                <p className={styles.venue}>{play.theatre?.title ?? "Standalone production"}</p>
                <div className={styles.facts}>
                  <span><small>Launch</small><strong>{prettyDate(play.launchedOn)}</strong></span>
                  <span><small>Runtime</small><strong>{play.duration ? `${play.duration} min` : "Not provided"}</strong></span>
                  <span><small>Rating</small><strong>{play.ratingCount ? `★ ${play.ratingAverage.toFixed(1)}` : "No ratings"}</strong></span>
                </div>
                <div className={styles.relatedLine}>
                  {play.related.cast + play.related.makers + play.related.crew} credits · {play.related.shows} shows
                </div>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.editButton} onClick={() => { setNotice(""); setModal({ type: "edit", play }); }}>Edit details</button>
                  {play.slug ? <Link href={`/play/${play.slug}/`} target="_blank" rel="noopener noreferrer">View ↗</Link> : <span>No public page</span>}
                  <button type="button" className={styles.deleteButton} onClick={() => { setDeleteError(""); setDeleting(play); }}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <span aria-hidden="true">⌕</span>
          <h3>{plays.length ? "No matching productions" : "No productions yet"}</h3>
          <p>{plays.length ? "Change the search or status filter." : "Add the first production to TheatreHub's archive."}</p>
          {!plays.length && <button type="button" className={styles.addButton} onClick={() => setModal({ type: "create" })}>+ Add production</button>}
        </div>
      )}

      {modal && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="production-dialog-title">
            <header className={styles.modalHeader}>
              <div>
                <span>{modal.type === "edit" ? `PRODUCTION #${modal.play.id}` : "NEW ARCHIVE ENTRY"}</span>
                <h2 id="production-dialog-title">{modal.type === "edit" ? "Edit production" : "Add production"}</h2>
                <p>{modal.type === "edit" ? "Update the archive record and public production page." : "Create a complete production record for TheatreHub."}</p>
              </div>
              <button type="button" onClick={() => setModal(null)} aria-label="Close production form">×</button>
            </header>
            <ProductionForm
              key={modal.type === "edit" ? modal.play.id : "create"}
              play={modal.type === "edit" ? modal.play : undefined}
              theatres={theatres}
              onClose={() => setModal(null)}
              onSaved={saved}
            />
          </section>
        </div>
      )}

      {deleting && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (!isDeleting && event.target === event.currentTarget) setDeleting(null); }}>
          <section className={`${styles.modal} ${styles.deleteModal}`} role="alertdialog" aria-modal="true" aria-labelledby="delete-production-title" aria-describedby="delete-production-description">
            <div className={styles.dangerIcon} aria-hidden="true">!</div>
            <span className={styles.dangerEyebrow}>Permanent action</span>
            <h2 id="delete-production-title">Delete “{deleting.title}”?</h2>
            <p id="delete-production-description">This removes the public production and its connected archive data. This action cannot be undone.</p>
            <div className={styles.deleteImpact}>
              <span><strong>{deleting.related.makers + deleting.related.cast + deleting.related.crew}</strong> credits</span>
              <span><strong>{deleting.related.schedules}</strong> schedules</span>
              <span><strong>{deleting.related.shows}</strong> shows</span>
              <span><strong>{deleting.related.bookings}</strong> bookings</span>
            </div>
            {deleteError && <div className={styles.formError} role="alert">{deleteError}</div>}
            <div className={styles.deleteActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setDeleting(null)} disabled={isDeleting}>Keep production</button>
              <button type="button" className={styles.confirmDeleteButton} onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "Deleting…" : "Delete permanently"}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
