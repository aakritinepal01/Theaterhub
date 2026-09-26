"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ImageUploadField } from "@/components/ImageUploadField";
import { FESTIVAL_SERIES, type FestivalPlacement, type FestivalPublishStatus } from "@/lib/festivals";
import styles from "./AdminProductionManager.module.css";

export type AdminFestivalRecord = {
  id: number;
  title: string;
  slug: string;
  status: FestivalPublishStatus;
  description: string;
  content: string;
  featuredImage: string | null;
  image: string | null;
  publishDate: string | null;
  seriesSlug: string;
  seriesTitle: string;
  placement: FestivalPlacement;
};

type ModalState =
  | { type: "create" }
  | { type: "edit"; festival: AdminFestivalRecord }
  | null;

function dateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function prettyDate(value: string | null) {
  if (!value) return "Date pending";
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

async function payload(response: Response): Promise<{ error?: string; message?: string }> {
  try {
    return (await response.json()) as { error?: string; message?: string };
  } catch {
    return {};
  }
}

function FestivalForm({
  festival,
  onClose,
  onSaved,
}: {
  festival?: AdminFestivalRecord;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const prefix = festival ? `festival-${festival.id}` : "festival-new";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        festival ? `/api/admin/festivals/${festival.id}` : "/api/admin/festivals",
        { method: festival ? "PATCH" : "POST", body: new FormData(event.currentTarget) },
      );
      const result = await payload(response);
      if (!response.ok) throw new Error(result.error || "Could not save this festival story.");
      onSaved(result.message || "Festival story saved.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save this festival story.");
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
            <h3>Festival identity</h3>
            <p>Choose the series, public placement and publishing status.</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <label className={styles.fieldWide} htmlFor={`${prefix}-title`}>
            <span>Story title *</span>
            <input id={`${prefix}-title`} name="title" defaultValue={festival?.title ?? ""} required maxLength={220} />
          </label>
          <label htmlFor={`${prefix}-series`}>
            <span>Festival series *</span>
            <select id={`${prefix}-series`} name="seriesSlug" defaultValue={festival?.seriesSlug ?? FESTIVAL_SERIES[0].slug}>
              {FESTIVAL_SERIES.map((series) => (
                <option value={series.slug} key={series.slug}>{series.title}</option>
              ))}
            </select>
          </label>
          <label htmlFor={`${prefix}-placement`}>
            <span>Page placement *</span>
            <select id={`${prefix}-placement`} name="placement" defaultValue={festival?.placement ?? "LIVE"}>
              <option value="LIVE">Live Stage</option>
              <option value="ARCHIVE">Archive</option>
            </select>
          </label>
          <label htmlFor={`${prefix}-status`}>
            <span>Publish status *</span>
            <select id={`${prefix}-status`} name="status" defaultValue={festival?.status ?? "PUBLISHED"}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </label>
          <label htmlFor={`${prefix}-date`}>
            <span>Publish date *</span>
            <input id={`${prefix}-date`} type="date" name="publishDate" defaultValue={dateInputValue(festival?.publishDate)} required />
          </label>
        </div>
      </div>

      <div className={`${styles.formSection} ${styles.uploadTheme}`}>
        <div className={styles.sectionHeading}>
          <span>02</span>
          <div>
            <h3>Festival artwork</h3>
            <p>Upload the poster or lead image used on Live Stage and Archive cards.</p>
          </div>
        </div>
        <ImageUploadField
          key={festival?.id ?? "new-festival-image"}
          label="Festival poster / cover image"
          name="featuredImage"
          defaultValue={festival?.featuredImage ?? ""}
          folder="festivals"
          aspect="banner"
          helpText="A portrait poster or clean 16:9 festival image works best."
        />
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>03</span>
          <div>
            <h3>Public story</h3>
            <p>Add the card summary and the complete article content.</p>
          </div>
        </div>
        <div className={styles.textareaStack}>
          <label htmlFor={`${prefix}-description`}>
            <span>Short summary *</span>
            <textarea id={`${prefix}-description`} name="description" rows={4} maxLength={1000} defaultValue={festival?.description ?? ""} required />
          </label>
          <label htmlFor={`${prefix}-content`}>
            <span>Full festival story *</span>
            <textarea id={`${prefix}-content`} name="content" rows={12} defaultValue={festival?.content ?? ""} required />
          </label>
        </div>
      </div>

      {error && <div className={styles.formError} role="alert">{error}</div>}
      <div className={styles.formActions}>
        <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={saving}>Cancel</button>
        <button type="submit" className={styles.primaryButton} disabled={saving}>
          {saving ? "Saving…" : festival ? "Save changes" : "Add festival story"}
        </button>
      </div>
    </form>
  );
}

export function AdminFestivalManager({
  festivals,
  totalFestivals,
}: {
  festivals: AdminFestivalRecord[];
  totalFestivals: number;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [deleting, setDeleting] = useState<AdminFestivalRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [placement, setPlacement] = useState("ALL");

  const visibleFestivals = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return festivals.filter((festival) => {
      const matchesPlacement = placement === "ALL" || festival.placement === placement;
      const haystack = `${festival.title} ${festival.seriesTitle} ${festival.id}`.toLowerCase();
      return matchesPlacement && (!needle || haystack.includes(needle));
    });
  }, [festivals, placement, query]);

  function saved(message: string) {
    setModal(null);
    setNotice(message);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/admin/festivals/${deleting.id}`, { method: "DELETE" });
      const result = await payload(response);
      if (!response.ok) throw new Error(result.error || "Could not delete this festival story.");
      setDeleting(null);
      setNotice(result.message || "Festival story deleted.");
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete this festival story.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className={styles.manager}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Festival publishing</span>
          <h2>Live Stage &amp; Archive</h2>
          <p>Add, update and place all {totalFestivals} festival stories from one desk.</p>
        </div>
        <button className={styles.addButton} type="button" onClick={() => { setNotice(""); setModal({ type: "create" }); }}>
          <span aria-hidden="true">+</span> Add festival
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
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
          <span className={styles.srOnly}>Search festival stories</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, series or ID…" />
        </label>
        <label className={styles.statusFilter}>
          <span>Placement</span>
          <select value={placement} onChange={(event) => setPlacement(event.target.value)}>
            <option value="ALL">All placements</option>
            <option value="LIVE">Live Stage</option>
            <option value="ARCHIVE">Archive</option>
          </select>
        </label>
        <span className={styles.resultCount}>{visibleFestivals.length} on this page</span>
      </div>

      {visibleFestivals.length ? (
        <div className={styles.grid}>
          {visibleFestivals.map((festival) => (
            <article className={styles.card} key={festival.id}>
              <div className={styles.poster}>
                {festival.image ? <img src={festival.image} alt={`${festival.title} cover`} loading="lazy" /> : <span>THEATREHUB<br />FESTIVAL</span>}
                <div className={styles.posterTop}>
                  <span className={`${styles.status} ${styles[`status${festival.status}`]}`}>{festival.status}</span>
                  <span className={styles.featured}>{festival.placement === "LIVE" ? "Live Stage" : "Archive"}</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <span className={styles.recordId}>FESTIVAL STORY #{festival.id}</span>
                <h3>{festival.title}</h3>
                <p className={styles.venue}>{festival.seriesTitle}</p>
                <div className={styles.facts}>
                  <span><small>Published</small><strong>{prettyDate(festival.publishDate)}</strong></span>
                  <span><small>Placement</small><strong>{festival.placement === "LIVE" ? "Live Stage" : "Archive"}</strong></span>
                  <span><small>Status</small><strong>{festival.status === "PUBLISHED" ? "Public" : "Draft"}</strong></span>
                </div>
                <div className={styles.relatedLine}>{festival.description}</div>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.editButton} onClick={() => { setNotice(""); setModal({ type: "edit", festival }); }}>Edit details</button>
                  {festival.status === "PUBLISHED" ? <Link href={`/blog/${festival.slug}/`} target="_blank" rel="noopener noreferrer">View ↗</Link> : <span>Not public</span>}
                  <button type="button" className={styles.deleteButton} onClick={() => { setDeleteError(""); setDeleting(festival); }}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <span aria-hidden="true">F</span>
          <h3>{festivals.length ? "No matching festival stories" : "No festival stories yet"}</h3>
          <p>{festivals.length ? "Change the search or placement filter." : "Add the first Live Stage or Archive entry."}</p>
          {!festivals.length && <button type="button" className={styles.addButton} onClick={() => setModal({ type: "create" })}>+ Add festival</button>}
        </div>
      )}

      {modal && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="festival-dialog-title">
            <header className={styles.modalHeader}>
              <div>
                <span>{modal.type === "edit" ? `FESTIVAL STORY #${modal.festival.id}` : "NEW FESTIVAL ENTRY"}</span>
                <h2 id="festival-dialog-title">{modal.type === "edit" ? "Edit festival story" : "Add festival story"}</h2>
                <p>Manage the public Festival page, Live Stage and Archive placement.</p>
              </div>
              <button type="button" onClick={() => setModal(null)} aria-label="Close festival form">×</button>
            </header>
            <FestivalForm
              key={modal.type === "edit" ? modal.festival.id : "create"}
              festival={modal.type === "edit" ? modal.festival : undefined}
              onClose={() => setModal(null)}
              onSaved={saved}
            />
          </section>
        </div>
      )}

      {deleting && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (!isDeleting && event.target === event.currentTarget) setDeleting(null); }}>
          <section className={`${styles.modal} ${styles.deleteModal}`} role="alertdialog" aria-modal="true" aria-labelledby="delete-festival-title">
            <div className={styles.dangerIcon} aria-hidden="true">!</div>
            <span className={styles.dangerEyebrow}>Permanent action</span>
            <h2 id="delete-festival-title">Delete “{deleting.title}”?</h2>
            <p>This removes the festival story from the public page and article archive. This action cannot be undone.</p>
            {deleteError && <div className={styles.formError} role="alert">{deleteError}</div>}
            <div className={styles.deleteActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setDeleting(null)} disabled={isDeleting}>Keep story</button>
              <button type="button" className={styles.confirmDeleteButton} onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "Deleting…" : "Delete permanently"}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
