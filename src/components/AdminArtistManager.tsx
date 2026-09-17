"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ImageUploadField } from "@/components/ImageUploadField";
import shared from "./AdminProductionManager.module.css";
import styles from "./AdminArtistManager.module.css";

export type AdminArtistRecord = {
  id: number;
  name: string;
  slug: string | null;
  status: "DRAFT" | "PUBLISHED" | "UPCOMING";
  metaTitle: string | null;
  description: string;
  keywordsString: string;
  profilePic: string | null;
  photoUrl: string;
  email: string;
  mobile: string;
  dob: string | null;
  activeSince: string | null;
  linkWebsite: string;
  linkFacebook: string;
  linkTwitter: string;
  linkInstagram: string;
  bio: string;
  address: string;
  publishDate: string | null;
  expiryDate: string | null;
  inSitemap: boolean;
  owner: { username: string; email: string } | null;
  related: { maker: number; cast: number; crew: number; total: number };
};

type ModalState = { type: "create" } | { type: "edit"; artist: AdminArtistRecord } | null;

function dateInputValue(value: string | null) { return value ? value.slice(0, 10) : ""; }

async function responsePayload(response: Response): Promise<{ error?: string; message?: string }> {
  try { return await response.json() as { error?: string; message?: string }; } catch { return {}; }
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
}

function ArtistForm({ artist, onClose, onSaved }: { artist?: AdminArtistRecord; onClose: () => void; onSaved: (message: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const prefix = artist ? `artist-${artist.id}` : "artist-new";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(artist ? `/api/admin/artists/${artist.id}` : "/api/admin/artists", {
        method: artist ? "PATCH" : "POST",
        body: new FormData(event.currentTarget),
      });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Could not save the artist.");
      onSaved(payload.message || (artist ? "Artist updated." : "Artist added."));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save the artist.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={shared.form} onSubmit={submit}>
      <div className={shared.formSection}>
        <div className={shared.sectionHeading}><span>01</span><div><h3>Artist identity</h3><p>Public name, URL and publishing state.</p></div></div>
        <div className={shared.formGrid}>
          <label htmlFor={`${prefix}-name`}><span>Full name *</span><input id={`${prefix}-name`} name="name" defaultValue={artist?.name ?? ""} maxLength={220} required /></label>
          <label htmlFor={`${prefix}-slug`}><span>URL slug</span><input id={`${prefix}-slug`} name="slug" defaultValue={artist?.slug ?? ""} maxLength={200} placeholder="Generated automatically" /></label>
          <label htmlFor={`${prefix}-status`}><span>Publishing status</span><select id={`${prefix}-status`} name="status" defaultValue={artist?.status ?? "DRAFT"}><option value="DRAFT">Draft</option><option value="UPCOMING">Upcoming</option><option value="PUBLISHED">Published</option></select></label>
          <label htmlFor={`${prefix}-meta-title`}><span>SEO title</span><input id={`${prefix}-meta-title`} name="metaTitle" defaultValue={artist?.metaTitle ?? ""} maxLength={220} /></label>
          <label className={shared.fieldWide} htmlFor={`${prefix}-keywords`}><span>Search keywords</span><input id={`${prefix}-keywords`} name="keywordsString" defaultValue={artist?.keywordsString ?? ""} maxLength={1000} placeholder="actor, director, writer..." /></label>
        </div>
      </div>

      <div className={`${shared.formSection} ${shared.uploadTheme}`}>
        <div className={shared.sectionHeading}><span>02</span><div><h3>Profile portrait</h3><p>Upload a clear artist headshot or provide an image URL.</p></div></div>
        <ImageUploadField key={artist?.id ?? "new-artist-photo"} label="Artist photo" name="profilePic" defaultValue={artist?.profilePic ?? ""} folder="artists" aspect="avatar" helpText="Square portrait images work best." />
      </div>

      <div className={shared.formSection}>
        <div className={shared.sectionHeading}><span>03</span><div><h3>Personal & contact details</h3><p>Professional contact and background information.</p></div></div>
        <div className={shared.formGrid}>
          <label htmlFor={`${prefix}-email`}><span>Email address</span><input id={`${prefix}-email`} type="email" name="email" defaultValue={artist?.email ?? ""} /></label>
          <label htmlFor={`${prefix}-mobile`}><span>Phone number</span><input id={`${prefix}-mobile`} name="mobile" defaultValue={artist?.mobile ?? ""} /></label>
          <label htmlFor={`${prefix}-dob`}><span>Date of birth</span><input id={`${prefix}-dob`} type="date" name="dob" defaultValue={dateInputValue(artist?.dob ?? null)} /></label>
          <label htmlFor={`${prefix}-active`}><span>Active since</span><input id={`${prefix}-active`} type="date" name="activeSince" defaultValue={dateInputValue(artist?.activeSince ?? null)} /></label>
          <label className={shared.fieldWide} htmlFor={`${prefix}-address`}><span>Address / location</span><input id={`${prefix}-address`} name="address" defaultValue={artist?.address ?? ""} maxLength={1000} /></label>
        </div>
      </div>

      <div className={shared.formSection}>
        <div className={shared.sectionHeading}><span>04</span><div><h3>Biography & public copy</h3><p>Long biography and short search description.</p></div></div>
        <div className={shared.textareaStack}>
          <label htmlFor={`${prefix}-bio`}><span>Biography</span><textarea id={`${prefix}-bio`} name="bio" rows={7} defaultValue={artist?.bio ?? ""} /></label>
          <label htmlFor={`${prefix}-description`}><span>Short description</span><textarea id={`${prefix}-description`} name="description" rows={4} defaultValue={artist?.description ?? ""} /></label>
        </div>
      </div>

      <div className={shared.formSection}>
        <div className={shared.sectionHeading}><span>05</span><div><h3>Web & social links</h3><p>Full public URLs for the artist's online profiles.</p></div></div>
        <div className={styles.socialGrid}>
          <label htmlFor={`${prefix}-website`}><span>Website</span><input id={`${prefix}-website`} type="url" name="linkWebsite" defaultValue={artist?.linkWebsite ?? ""} placeholder="https://" /></label>
          <label htmlFor={`${prefix}-facebook`}><span>Facebook</span><input id={`${prefix}-facebook`} type="url" name="linkFacebook" defaultValue={artist?.linkFacebook ?? ""} placeholder="https://" /></label>
          <label htmlFor={`${prefix}-twitter`}><span>Twitter / X</span><input id={`${prefix}-twitter`} type="url" name="linkTwitter" defaultValue={artist?.linkTwitter ?? ""} placeholder="https://" /></label>
          <label htmlFor={`${prefix}-instagram`}><span>Instagram</span><input id={`${prefix}-instagram`} type="url" name="linkInstagram" defaultValue={artist?.linkInstagram ?? ""} placeholder="https://" /></label>
        </div>
      </div>

      <div className={shared.formSection}>
        <div className={shared.sectionHeading}><span>06</span><div><h3>Publishing window</h3><p>Control public availability and search discovery.</p></div></div>
        <div className={shared.formGrid}>
          <label htmlFor={`${prefix}-publish`}><span>Publish date</span><input id={`${prefix}-publish`} type="date" name="publishDate" defaultValue={dateInputValue(artist?.publishDate ?? null)} /></label>
          <label htmlFor={`${prefix}-expiry`}><span>Expiry date</span><input id={`${prefix}-expiry`} type="date" name="expiryDate" defaultValue={dateInputValue(artist?.expiryDate ?? null)} /></label>
        </div>
      </div>

      <div className={shared.switches}><label><input type="checkbox" name="inSitemap" defaultChecked={artist?.inSitemap ?? true} /><span><strong>Include in sitemap</strong><small>Allow search engines to discover this public profile.</small></span></label></div>
      {error && <div className={shared.formError} role="alert">{error}</div>}
      <div className={shared.formActions}><button type="button" className={shared.secondaryButton} onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className={shared.primaryButton} disabled={saving}>{saving ? "Saving..." : artist ? "Save artist" : "Add artist"}</button></div>
    </form>
  );
}

export function AdminArtistManager({ artists, totalArtists }: { artists: AdminArtistRecord[]; totalArtists: number }) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [deleting, setDeleting] = useState<AdminArtistRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const visibleArtists = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return artists.filter((artist) => {
      const haystack = `${artist.name} ${artist.email} ${artist.address} ${artist.id}`.toLowerCase();
      return (status === "ALL" || artist.status === status) && (!needle || haystack.includes(needle));
    });
  }, [artists, query, status]);

  function saved(message: string) {
    const wasCreate = modal?.type === "create";
    setModal(null);
    setNotice(message);
    if (wasCreate) router.push("/admin/profiles");
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/admin/artists/${deleting.id}`, { method: "DELETE" });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Could not delete the artist.");
      setDeleting(null);
      setNotice(payload.message || "Artist deleted.");
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete the artist.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className={`${shared.manager} ${styles.theme}`}>
      <div className={shared.toolbar}><div><span className={shared.eyebrow}>Profile management</span><h2>Artist directory</h2><p>Add, update or remove all {totalArtists} artist profiles and their public information.</p></div><button className={shared.addButton} type="button" onClick={() => { setNotice(""); setModal({ type: "create" }); }}><span aria-hidden="true">+</span> Add artist</button></div>
      {notice && <div className={shared.notice} role="status"><span aria-hidden="true">✓</span>{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}
      <div className={shared.filters}><label className={shared.searchBox}><SearchIcon /><span className={shared.srOnly}>Search this page</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, location or ID..." /></label><label className={shared.statusFilter}><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option><option value="PUBLISHED">Published</option><option value="UPCOMING">Upcoming</option><option value="DRAFT">Draft</option></select></label><span className={shared.resultCount}>{visibleArtists.length} on this page</span></div>

      {visibleArtists.length ? <div className={styles.artistGrid}>{visibleArtists.map((artist) => <article className={styles.artistCard} key={artist.id}><div className={styles.cardHead}><img className={styles.portrait} src={artist.photoUrl} alt="" loading="lazy" /><div className={styles.identity}><span>ARTIST #{artist.id}</span><h3>{artist.name}</h3><p>{artist.email || artist.address || "No contact details"}</p></div><span className={`${styles.status} ${styles[`status${artist.status}`]}`}>{artist.status}</span></div><p className={styles.bio}>{artist.bio || artist.description || "No public biography has been added yet."}</p><div className={styles.credits}><span><strong>{artist.related.maker}</strong>Maker</span><span><strong>{artist.related.cast}</strong>Cast</span><span><strong>{artist.related.crew}</strong>Crew</span></div><p className={styles.ownerLine}>{artist.owner ? `Linked account: ${artist.owner.email || artist.owner.username}` : "No linked account"}</p><div className={styles.cardActions}><button type="button" className={styles.editButton} onClick={() => { setNotice(""); setModal({ type: "edit", artist }); }}>Edit details</button>{artist.slug ? <Link href={`/profile/${artist.slug}/`} target="_blank" rel="noopener noreferrer">View ↗</Link> : <span /> }<button type="button" className={styles.deleteButton} onClick={() => { setDeleteError(""); setDeleting(artist); }}>Delete</button></div></article>)}</div> : <div className={shared.empty}><span aria-hidden="true">⌕</span><h3>{artists.length ? "No matching artists" : "No artists yet"}</h3><p>{artists.length ? "Change the search or status filter." : "Add the first artist profile."}</p>{!artists.length && <button type="button" className={shared.addButton} onClick={() => setModal({ type: "create" })}>+ Add artist</button>}</div>}

      {modal && <div className={`${shared.overlay} ${styles.centeredOverlay}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><section className={shared.modal} role="dialog" aria-modal="true" aria-labelledby="artist-dialog-title"><header className={shared.modalHeader}><div><span>{modal.type === "edit" ? `ARTIST #${modal.artist.id}` : "NEW ARTIST PROFILE"}</span><h2 id="artist-dialog-title">{modal.type === "edit" ? "Edit artist" : "Add artist"}</h2><p>Manage identity, biography, contact details, image, social links and publishing.</p></div><button type="button" onClick={() => setModal(null)} aria-label="Close artist form">×</button></header><ArtistForm key={modal.type === "edit" ? modal.artist.id : "create"} artist={modal.type === "edit" ? modal.artist : undefined} onClose={() => setModal(null)} onSaved={saved} /></section></div>}

      {deleting && <div className={`${shared.overlay} ${styles.centeredOverlay}`} role="presentation" onMouseDown={(event) => { if (!isDeleting && event.target === event.currentTarget) setDeleting(null); }}><section className={`${shared.modal} ${shared.deleteModal}`} role="alertdialog" aria-modal="true" aria-labelledby="delete-artist-title" aria-describedby="delete-artist-description"><div className={shared.dangerIcon} aria-hidden="true">!</div><span className={shared.dangerEyebrow}>Permanent action</span><h2 id="delete-artist-title">Delete “{deleting.name}”?</h2><p id="delete-artist-description">This removes the public artist profile and all connected production credits. Productions themselves remain intact.</p>{deleting.owner && <p className={styles.ownerWarning}>The linked login account ({deleting.owner.email || deleting.owner.username}) will be preserved.</p>}<div className={`${shared.deleteImpact} ${styles.deleteImpactThree}`}><span><strong>{deleting.related.maker}</strong> maker</span><span><strong>{deleting.related.cast}</strong> cast</span><span><strong>{deleting.related.crew}</strong> crew</span></div>{deleteError && <div className={shared.formError} role="alert">{deleteError}</div>}<div className={shared.deleteActions}><button type="button" className={shared.secondaryButton} onClick={() => setDeleting(null)} disabled={isDeleting}>Keep artist</button><button type="button" className={shared.confirmDeleteButton} onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete permanently"}</button></div></section></div>}
    </section>
  );
}
