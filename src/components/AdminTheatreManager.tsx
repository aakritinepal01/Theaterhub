"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ImageUploadField } from "@/components/ImageUploadField";
import shared from "./AdminProductionManager.module.css";
import styles from "./AdminTheatreManager.module.css";

export type AdminTheatreRecord = {
  id: number;
  title: string;
  slug: string | null;
  status: "DRAFT" | "PUBLISHED" | "UPCOMING";
  metaTitle: string | null;
  description: string;
  keywordsString: string;
  about: string;
  profilePic: string | null;
  coverImage: string | null;
  coverUrl: string;
  logoUrl: string;
  establishedOn: string | null;
  closedOn: string | null;
  publishDate: string | null;
  expiryDate: string | null;
  inSitemap: boolean;
  email: string;
  phone: string;
  address: string;
  linkWebsite: string;
  linkFacebook: string;
  linkTwitter: string;
  linkInstagram: string;
  updated: string | null;
  owner: { username: string; email: string } | null;
  related: { plays: number; schedules: number; shows: number; bookings: number };
};

type ModalState = { type: "create" } | { type: "edit"; theatre: AdminTheatreRecord } | null;

function dateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function prettyDate(value: string | null) {
  if (!value) return "Not updated";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

async function responsePayload(response: Response): Promise<{ error?: string; message?: string }> {
  try {
    return (await response.json()) as { error?: string; message?: string };
  } catch {
    return {};
  }
}

function TheatreForm({
  theatre,
  onClose,
  onSaved,
}: {
  theatre?: AdminTheatreRecord;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const prefix = theatre ? `theatre-${theatre.id}` : "theatre-new";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(theatre ? `/api/admin/theatres/${theatre.id}` : "/api/admin/theatres", {
        method: theatre ? "PATCH" : "POST",
        body: new FormData(event.currentTarget),
      });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Could not save the theatre.");
      onSaved(payload.message || (theatre ? "Theatre updated." : "Theatre added."));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save the theatre.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={shared.form} onSubmit={submit}>
      <div className={shared.formSection}>
        <div className={shared.sectionHeading}>
          <span>01</span><div><h3>Venue identity</h3><p>Name, public URL and publishing state.</p></div>
        </div>
        <div className={shared.formGrid}>
          <label className={shared.fieldWide} htmlFor={`${prefix}-title`}><span>Theatre / venue name *</span><input id={`${prefix}-title`} name="title" defaultValue={theatre?.title ?? ""} required maxLength={220} /></label>
          <label htmlFor={`${prefix}-slug`}><span>URL slug</span><input id={`${prefix}-slug`} name="slug" defaultValue={theatre?.slug ?? ""} maxLength={200} placeholder="Auto-generated when blank" /></label>
          <label htmlFor={`${prefix}-status`}><span>Publishing status</span><select id={`${prefix}-status`} name="status" defaultValue={theatre?.status ?? "DRAFT"}><option value="DRAFT">Draft</option><option value="UPCOMING">Upcoming</option><option value="PUBLISHED">Published</option></select></label>
          <label className={shared.fieldWide} htmlFor={`${prefix}-meta-title`}><span>SEO title</span><input id={`${prefix}-meta-title`} name="metaTitle" defaultValue={theatre?.metaTitle ?? ""} maxLength={220} /></label>
          <label className={shared.fieldWide} htmlFor={`${prefix}-keywords`}><span>Search keywords</span><input id={`${prefix}-keywords`} name="keywordsString" defaultValue={theatre?.keywordsString ?? ""} maxLength={1000} placeholder="theatre, Kathmandu, performance venue…" /></label>
        </div>
      </div>

      <div className={shared.formSection}>
        <div className={shared.sectionHeading}>
          <span>02</span><div><h3>Location & contact</h3><p>Public contact information shown on the venue page.</p></div>
        </div>
        <div className={shared.formGrid}>
          <label className={shared.fieldWide} htmlFor={`${prefix}-address`}><span>Address / location</span><input id={`${prefix}-address`} name="address" defaultValue={theatre?.address ?? ""} maxLength={1000} /></label>
          <label htmlFor={`${prefix}-email`}><span>Email</span><input id={`${prefix}-email`} type="email" name="email" defaultValue={theatre?.email ?? ""} maxLength={320} /></label>
          <label htmlFor={`${prefix}-phone`}><span>Phone</span><input id={`${prefix}-phone`} name="phone" defaultValue={theatre?.phone ?? ""} maxLength={80} /></label>
          <label className={shared.fieldWide} htmlFor={`${prefix}-website`}><span>Website</span><input id={`${prefix}-website`} name="linkWebsite" defaultValue={theatre?.linkWebsite ?? ""} maxLength={2048} placeholder="https://…" /></label>
        </div>
      </div>

      <div className={shared.formSection}>
        <div className={shared.sectionHeading}>
          <span>03</span><div><h3>Dates & visibility</h3><p>Venue history and public publishing window.</p></div>
        </div>
        <div className={shared.formGridThree}>
          <label htmlFor={`${prefix}-established`}><span>Established</span><input id={`${prefix}-established`} type="date" name="establishedOn" defaultValue={dateValue(theatre?.establishedOn)} /></label>
          <label htmlFor={`${prefix}-closed`}><span>Closed</span><input id={`${prefix}-closed`} type="date" name="closedOn" defaultValue={dateValue(theatre?.closedOn)} /></label>
          <label htmlFor={`${prefix}-publish`}><span>Publish date</span><input id={`${prefix}-publish`} type="date" name="publishDate" defaultValue={dateValue(theatre?.publishDate)} /></label>
          <label htmlFor={`${prefix}-expiry`}><span>Expiry date</span><input id={`${prefix}-expiry`} type="date" name="expiryDate" defaultValue={dateValue(theatre?.expiryDate)} /></label>
        </div>
      </div>

      <div className={`${shared.formSection} ${shared.uploadTheme}`}>
        <div className={shared.sectionHeading}>
          <span>04</span><div><h3>Venue artwork</h3><p>Official logo and cover image for the public profile.</p></div>
        </div>
        <div className={styles.imageGrid}>
          <ImageUploadField key={`${theatre?.id ?? "new"}-logo`} label="Venue logo" name="profilePic" defaultValue={theatre?.profilePic ?? ""} folder="theatres/logos" aspect="avatar" />
          <ImageUploadField key={`${theatre?.id ?? "new"}-cover`} label="Cover image" name="coverImage" defaultValue={theatre?.coverImage ?? ""} folder="theatres/covers" aspect="banner" />
        </div>
      </div>

      <div className={shared.formSection}>
        <div className={shared.sectionHeading}>
          <span>05</span><div><h3>Profile copy</h3><p>Venue summary and detailed public introduction.</p></div>
        </div>
        <div className={shared.textareaStack}>
          <label htmlFor={`${prefix}-description`}><span>Short description</span><textarea id={`${prefix}-description`} name="description" rows={3} defaultValue={theatre?.description ?? ""} /></label>
          <label htmlFor={`${prefix}-about`}><span>About the venue</span><textarea id={`${prefix}-about`} name="about" rows={6} defaultValue={theatre?.about ?? ""} /></label>
        </div>
      </div>

      <div className={shared.formSection}>
        <div className={shared.sectionHeading}>
          <span>06</span><div><h3>Social profiles</h3><p>Optional public links for the venue.</p></div>
        </div>
        <div className={shared.formGrid}>
          <label htmlFor={`${prefix}-facebook`}><span>Facebook</span><input id={`${prefix}-facebook`} name="linkFacebook" defaultValue={theatre?.linkFacebook ?? ""} maxLength={2048} /></label>
          <label htmlFor={`${prefix}-instagram`}><span>Instagram</span><input id={`${prefix}-instagram`} name="linkInstagram" defaultValue={theatre?.linkInstagram ?? ""} maxLength={2048} /></label>
          <label className={shared.fieldWide} htmlFor={`${prefix}-twitter`}><span>X / Twitter</span><input id={`${prefix}-twitter`} name="linkTwitter" defaultValue={theatre?.linkTwitter ?? ""} maxLength={2048} /></label>
        </div>
      </div>

      <div className={shared.switches}>
        <label><input type="checkbox" name="inSitemap" defaultChecked={theatre?.inSitemap ?? true} /><span><strong>Include in sitemap</strong><small>Allow search engines to discover this venue.</small></span></label>
      </div>

      {error && <div className={shared.formError} role="alert">{error}</div>}
      <div className={shared.formActions}>
        <button type="button" className={shared.secondaryButton} onClick={onClose} disabled={saving}>Cancel</button>
        <button type="submit" className={shared.primaryButton} disabled={saving}>{saving ? "Saving…" : theatre ? "Save changes" : "Add theatre"}</button>
      </div>
    </form>
  );
}

export function AdminTheatreManager({ theatres, totalTheatres }: { theatres: AdminTheatreRecord[]; totalTheatres: number }) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [deleting, setDeleting] = useState<AdminTheatreRecord | null>(null);
  const [deletingNow, setDeletingNow] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function saved(message: string) {
    const created = modal?.type === "create";
    setModal(null);
    setNotice(message);
    if (created) router.push("/admin/theatres");
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletingNow(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/theatres/${deleting.id}`, { method: "DELETE" });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Could not delete the theatre.");
      setDeleting(null);
      setNotice(payload.message || "Theatre deleted.");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete the theatre.");
    } finally {
      setDeletingNow(false);
    }
  }

  return (
    <section className={styles.theme}>
      <div className={shared.toolbar}>
        <div><span className={shared.eyebrow}>Venue management</span><h2>Theatre records</h2><p>Add, edit and manage all {totalTheatres} registered venues.</p></div>
        <button type="button" className={shared.addButton} onClick={() => { setNotice(""); setModal({ type: "create" }); }}><span aria-hidden="true">+</span> Add theatre</button>
      </div>

      {notice && <div className={shared.notice} role="status"><span aria-hidden="true">✓</span>{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

      {theatres.length ? (
        <div className="adm-theatre-grid">
          {theatres.map((theatre) => (
            <article className="adm-theatre-card" key={theatre.id}>
              <div className="adm-theatre-cover">
                <img src={theatre.coverUrl} alt={`${theatre.title} cover`} loading="lazy" />
                <span className={`adm-theatre-status ${theatre.owner ? "is-claimed" : "is-unclaimed"}`}>{theatre.owner ? "Claimed" : "Unclaimed"}</span>
              </div>
              <div className="adm-theatre-card-body">
                <div className="adm-theatre-card-heading"><div><h2>{theatre.title}</h2><span>Venue ID #{theatre.id}</span></div></div>
                <div className="adm-theatre-logo-strip"><img src={theatre.logoUrl} alt={`${theatre.title} logo`} loading="lazy" /><span>{theatre.profilePic ? "Official venue logo" : "Venue image fallback"}</span></div>
                <p className="adm-theatre-address">{theatre.address || "No location listed"}</p>
                {(theatre.description || theatre.about) && <p className="adm-theatre-description">{theatre.description || theatre.about}</p>}
                <div className="adm-theatre-details"><span><strong>{theatre.related.plays}</strong> plays</span><span><strong>{theatre.related.shows}</strong> shows</span><span><strong>{theatre.status.toLowerCase()}</strong></span></div>
                {(theatre.email || theatre.phone || theatre.linkWebsite) && <div className="adm-theatre-contact">{theatre.email && <span>{theatre.email}</span>}{theatre.phone && <span>{theatre.phone}</span>}{theatre.linkWebsite && <span>Website listed</span>}</div>}
                <div className="adm-theatre-owner"><span className="adm-theatre-owner-mark">{theatre.owner ? theatre.owner.username.slice(0, 1).toUpperCase() : "!"}</span><span>{theatre.owner ? theatre.owner.email : "No owner assigned"}</span></div>
                <div className={styles.cardMeta}><small>Updated {prettyDate(theatre.updated)}</small>{!theatre.owner && <Link href={`/admin/create-user?theatreName=${encodeURIComponent(theatre.title)}`}>Link owner</Link>}</div>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.editButton} onClick={() => { setNotice(""); setModal({ type: "edit", theatre }); }}>Edit</button>
                  <Link href={`/admin/theatres/${theatre.id}`}>Details →</Link>
                  <button type="button" className={styles.deleteButton} onClick={() => { setError(""); setDeleting(theatre); }}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={shared.empty}><span aria-hidden="true">⌕</span><h3>No venues found</h3><p>Clear the filters or add a new theatre record.</p><button type="button" className={shared.addButton} onClick={() => setModal({ type: "create" })}>+ Add theatre</button></div>
      )}

      {modal && (
        <div className={`${shared.overlay} ${styles.centeredOverlay}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section className={`${shared.modal} ${styles.venueModal}`} role="dialog" aria-modal="true" aria-labelledby="theatre-dialog-title">
            <header className={shared.modalHeader}>
              <div><span>{modal.type === "edit" ? `VENUE #${modal.theatre.id}` : "NEW VENUE RECORD"}</span><h2 id="theatre-dialog-title">{modal.type === "edit" ? "Edit theatre" : "Add theatre"}</h2><p>{modal.type === "edit" ? "Update the venue record and public theatre page." : "Create a complete venue profile for TheatreHub."}</p></div>
              <button type="button" onClick={() => setModal(null)} aria-label="Close theatre form">×</button>
            </header>
            <TheatreForm key={modal.type === "edit" ? modal.theatre.id : "create"} theatre={modal.type === "edit" ? modal.theatre : undefined} onClose={() => setModal(null)} onSaved={saved} />
          </section>
        </div>
      )}

      {deleting && (
        <div className={`${shared.overlay} ${styles.centeredOverlay}`} role="presentation" onMouseDown={(event) => { if (!deletingNow && event.target === event.currentTarget) setDeleting(null); }}>
          <section className={`${shared.modal} ${shared.deleteModal}`} role="alertdialog" aria-modal="true" aria-labelledby="delete-theatre-title" aria-describedby="delete-theatre-description">
            <div className={shared.dangerIcon} aria-hidden="true">!</div><span className={shared.dangerEyebrow}>Permanent action</span>
            <h2 id="delete-theatre-title">Delete “{deleting.title}”?</h2>
            <p id="delete-theatre-description">The venue, schedules, shows and bookings will be removed. Productions are preserved as standalone archive records, and the owner account is not deleted.</p>
            <div className={shared.deleteImpact}><span><strong>{deleting.related.plays}</strong> productions kept</span><span><strong>{deleting.related.schedules}</strong> schedules removed</span><span><strong>{deleting.related.shows}</strong> shows removed</span><span><strong>{deleting.related.bookings}</strong> bookings removed</span></div>
            {error && <div className={shared.formError} role="alert">{error}</div>}
            <div className={shared.deleteActions}><button type="button" className={shared.secondaryButton} onClick={() => setDeleting(null)} disabled={deletingNow}>Keep theatre</button><button type="button" className={shared.confirmDeleteButton} onClick={confirmDelete} disabled={deletingNow}>{deletingNow ? "Deleting…" : "Delete permanently"}</button></div>
          </section>
        </div>
      )}
    </section>
  );
}

export function AdminTheatreRecordActions({ theatre }: { theatre: AdminTheatreRecord }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingNow, setDeletingNow] = useState(false);
  const [error, setError] = useState("");

  function saved() {
    setEditing(false);
    router.refresh();
  }

  async function confirmDelete() {
    setDeletingNow(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/theatres/${theatre.id}`, { method: "DELETE" });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Could not delete the theatre.");
      router.push("/admin/theatres");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete the theatre.");
      setDeletingNow(false);
    }
  }

  return (
    <div className={`${styles.theme} ${styles.detailActions}`}>
      <button type="button" className={styles.detailEditButton} onClick={() => setEditing(true)}>Edit venue</button>
      <button type="button" className={styles.detailDeleteButton} onClick={() => { setError(""); setDeleting(true); }}>Delete</button>

      {editing && (
        <div className={`${shared.overlay} ${styles.centeredOverlay}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false); }}>
          <section className={`${shared.modal} ${styles.venueModal}`} role="dialog" aria-modal="true" aria-labelledby="record-theatre-dialog-title">
            <header className={shared.modalHeader}>
              <div><span>VENUE #{theatre.id}</span><h2 id="record-theatre-dialog-title">Edit theatre</h2><p>Update the venue record and public theatre page.</p></div>
              <button type="button" onClick={() => setEditing(false)} aria-label="Close theatre form">×</button>
            </header>
            <TheatreForm theatre={theatre} onClose={() => setEditing(false)} onSaved={saved} />
          </section>
        </div>
      )}

      {deleting && (
        <div className={`${shared.overlay} ${styles.centeredOverlay}`} role="presentation" onMouseDown={(event) => { if (!deletingNow && event.target === event.currentTarget) setDeleting(false); }}>
          <section className={`${shared.modal} ${shared.deleteModal}`} role="alertdialog" aria-modal="true" aria-labelledby="record-delete-theatre-title" aria-describedby="record-delete-theatre-description">
            <div className={shared.dangerIcon} aria-hidden="true">!</div><span className={shared.dangerEyebrow}>Permanent action</span>
            <h2 id="record-delete-theatre-title">Delete “{theatre.title}”?</h2>
            <p id="record-delete-theatre-description">The venue, schedules, shows and bookings will be removed. Productions are preserved as standalone records, and the owner account is not deleted.</p>
            <div className={shared.deleteImpact}><span><strong>{theatre.related.plays}</strong> productions kept</span><span><strong>{theatre.related.schedules}</strong> schedules removed</span><span><strong>{theatre.related.shows}</strong> shows removed</span><span><strong>{theatre.related.bookings}</strong> bookings removed</span></div>
            {error && <div className={shared.formError} role="alert">{error}</div>}
            <div className={shared.deleteActions}><button type="button" className={shared.secondaryButton} onClick={() => setDeleting(false)} disabled={deletingNow}>Keep theatre</button><button type="button" className={shared.confirmDeleteButton} onClick={confirmDelete} disabled={deletingNow}>{deletingNow ? "Deleting…" : "Delete permanently"}</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
