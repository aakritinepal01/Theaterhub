"use client";

import type { ContentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./ProductionEditor.module.css";
import { ImageUploadField } from "@/components/ImageUploadField";
import { ProductionCreditsFields } from "@/components/ProductionCreditsFields";

type Play = {
  id: number;
  title: string;
  description: string;
  abstract: string;
  directorialNote: string;
  coverImage: string | null;
  duration: number | null;
  launchedOn: Date | string | null;
  endedOn: Date | string | null;
  status: ContentStatus;
  isFeatured: boolean;
  cast: { profile: { name: string } }[];
  crew: { profile: { name: string } }[];
};

export function ProfileForm({ theatre }: { theatre: Record<string, unknown> }) {
  const router = useRouter();
  const [state, setState] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("Saving…");
    const response = await fetch("/api/theatre", {
      method: "PATCH",
      body: new FormData(event.currentTarget),
    });
    setState(
      response.ok
        ? "Profile saved."
        : (await response.json().catch(() => null))?.error || "Unable to save profile."
    );
    if (response.ok) router.refresh();
  }

  return (
    <form className="manage-form profile-form" onSubmit={submit}>
      <label>
        Theatre name
        <input name="title" defaultValue={String(theatre.title || "")} required />
      </label>
      <label>
        Publication status
        <select name="status" defaultValue={String(theatre.status || "PUBLISHED")}>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
      </label>
      <label>
        Public email
        <input type="email" name="email" defaultValue={String(theatre.email || "")} />
      </label>
      <label>
        Phone
        <input name="phone" defaultValue={String(theatre.phone || "")} />
      </label>
      <label>
        Address
        <input name="address" defaultValue={String(theatre.address || "")} />
      </label>
      <label>
        Website
        <input name="linkWebsite" defaultValue={String(theatre.linkWebsite || "")} />
      </label>
      <label>
        Facebook
        <input name="linkFacebook" defaultValue={String(theatre.linkFacebook || "")} />
      </label>
      <label>
        Twitter / X
        <input name="linkTwitter" defaultValue={String(theatre.linkTwitter || "")} />
      </label>
      <label>
        Instagram
        <input name="linkInstagram" defaultValue={String(theatre.linkInstagram || "")} />
      </label>
      <label>
        Established on
        <input type="date" name="establishedOn" defaultValue={dateValue(theatre.establishedOn)} />
      </label>
      <label>
        Closed on
        <input type="date" name="closedOn" defaultValue={dateValue(theatre.closedOn)} />
      </label>

      {/* Direct Image Upload Fields */}
      <ImageUploadField
        label="Profile picture (Avatar)"
        name="profilePic"
        defaultValue={String(theatre.profilePic || "")}
        aspect="avatar"
        folder="theatres"
      />

      <ImageUploadField
        label="Cover image (Banner)"
        name="coverImage"
        defaultValue={String(theatre.coverImage || "")}
        aspect="banner"
        folder="theatres"
      />

      <label>
        About
        <textarea name="about" defaultValue={String(theatre.about || "")} />
      </label>

      <button>Save theatre profile</button>
      <p role="status">{state}</p>
    </form>
  );
}

export function PlayEditor({ play }: { play: Play }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function close() {
    if (busy) return;
    dialog.current?.close();
    setOpen(false);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const body = new FormData(event.currentTarget);
    if (String(body.get("coverImage") || "").startsWith("blob:")) {
      setState("Please wait for the poster upload to finish.");
      return;
    }
    setBusy(true);
    setState("");
    try {
    const response = await fetch(`/api/theatre/plays/${play.id}`, {
      method: "PATCH",
      body,
    });
    setState(
      response.ok ? "Saved." : (await response.json().catch(() => null))?.error || "Unable to save."
    );
    if (response.ok) router.refresh();
    } catch {
      setState("Connection lost. Please try saving again.");
    } finally { setBusy(false); }
  }

  async function remove() {
    if (busy) return;
    if (!confirm(`Delete ${play.title}?`)) return;
    setBusy(true);
    try {
    const response = await fetch(`/api/theatre/plays/${play.id}`, { method: "DELETE" });
    if (response.ok) { setOpen(false); router.refresh(); }
    else setState((await response.json().catch(() => null))?.error || "Unable to delete.");
    } catch {
      setState("Connection lost. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div className={styles.editor}>
      <button className={styles.trigger} type="button" onClick={() => { setState(""); setOpen(true); }} aria-label={`Edit ${play.title}`}>Edit</button>
      {open && (
        <dialog ref={dialog} className={styles.dialog} aria-labelledby={`production-editor-${play.id}`} onCancel={event => { event.preventDefault(); close(); }} onClose={() => setOpen(false)}>
        <header className={styles.header}>
          <div><span>PRODUCTION STUDIO</span><h2 id={`production-editor-${play.id}`}>Edit production</h2><p>{play.title}</p></div>
          <button type="button" onClick={close} disabled={busy} aria-label="Close editor">×</button>
        </header>
        <form className={styles.form} onSubmit={save} aria-busy={busy}>
          <div className={styles.intro}><h3>Production details</h3><p>Update the essentials, poster and story of your play.</p></div>
          <label>
            Title
            <input name="title" defaultValue={play.title} required autoFocus />
          </label>
          <label>
            Status
            <select name="status" defaultValue={play.status}>
              <option value="PUBLISHED">Published</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="DRAFT">Draft</option>
            </select>
          </label>

          <ImageUploadField
            label="Poster image"
            name="coverImage"
            defaultValue={play.coverImage || ""}
            aspect="avatar"
            folder="theatres/plays"
          />

          <label>
            Launched on
            <input type="date" name="launchedOn" defaultValue={dateValue(play.launchedOn)} />
          </label>
          <label>
            Ended on
            <input type="date" name="endedOn" defaultValue={dateValue(play.endedOn)} />
          </label>
          <label>
            Duration (minutes)
            <input type="number" min="1" name="duration" defaultValue={play.duration || ""} />
          </label>
          <label className={styles.wide}>
            Description
            <textarea name="description" defaultValue={play.description} />
          </label>
          <label className={styles.wide}>
            Abstract
            <textarea name="abstract" defaultValue={play.abstract} />
          </label>
          <label className={styles.wide}>
            Directorial note
            <textarea name="directorialNote" defaultValue={play.directorialNote} />
          </label>
          <ProductionCreditsFields onStage={play.cast.map(credit => credit.profile.name)} offStage={play.crew.map(credit => credit.profile.name)} />
          <label className={styles.featured}>
            <input type="checkbox" name="isFeatured" defaultChecked={play.isFeatured} /> Featured play
          </label>
          <footer className={styles.footer}>
            <p role="status">{state || "Review your details before saving."}</p>
            <div className={styles.actions}>
              <button type="button" className={styles.danger} onClick={remove} disabled={busy}>Delete production</button>
              <button type="button" onClick={close} disabled={busy}>Cancel</button>
              <button className={styles.primary} disabled={busy}>{busy ? "Please wait…" : "Save changes"}</button>
            </div>
          </footer>
        </form>
        </dialog>
      )}
    </div>
  );
}

type ManagedReel = { id: number; title: string; videoUrl: string; status: ContentStatus };
type ManagedStory = { id: number; title: string; imageUrl: string; caption: string; status: ContentStatus };

export function TheatreMediaManager({ reels, stories }: { reels: ManagedReel[]; stories: ManagedStory[] }) {
  const router = useRouter();
  const [state, setState] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>, endpoint: string) {
    event.preventDefault(); setState("Saving…");
    const response = await fetch(endpoint, { method: "POST", body: new FormData(event.currentTarget) });
    setState(response.ok ? "Published." : (await response.json().catch(() => null))?.error || "Unable to save.");
    if (response.ok) { event.currentTarget.reset(); router.refresh(); }
  }
  async function remove(endpoint: string) {
    if (!confirm("Remove this item from the homepage?")) return;
    const response = await fetch(endpoint, { method: "DELETE" });
    setState(response.ok ? "Removed." : "Unable to remove."); if (response.ok) router.refresh();
  }
  return <section className="owner-panel theatre-media-manager">
    <div className="owner-panel-head"><div><p>Homepage content</p><h2>Explore, Reels &amp; Stories</h2></div><span className="owner-small-empty">Use public image/video URLs</span></div>
    <div className="media-manager-grid">
      <form className="manage-form" onSubmit={(event) => submit(event, "/api/theatre/reels")}>
        <h3>Add theatre reel</h3><p className="manage-help">Paste a hosted MP4 URL (Cloudinary or another public video URL).</p>
        <label>Title<input name="title" placeholder="Opening night" required /></label>
        <label>Video URL<input name="videoUrl" type="url" placeholder="https://…/reel.mp4" required /></label>
        <label>Status<select name="status" defaultValue="PUBLISHED"><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select></label>
        <button>Add reel</button>
      </form>
      <form className="manage-form" onSubmit={(event) => submit(event, "/api/theatre/stories")}>
        <h3>Add TheatreHub story</h3><p className="manage-help">Stories appear under your theatre in the homepage story row.</p>
        <label>Title<input name="title" placeholder="Behind the scenes" required /></label>
        <label>Image URL<input name="imageUrl" type="url" placeholder="https://…/story.jpg" required /></label>
        <label>Caption<textarea name="caption" placeholder="Optional caption" /></label>
        <label>Status<select name="status" defaultValue="PUBLISHED"><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select></label>
        <button>Add story</button>
      </form>
    </div>
    <p role="status">{state}</p>
    <div className="owner-media-list">
      {reels.map((reel) => <div className="owner-media-row" key={`reel-${reel.id}`}><span>REEL</span><strong>{reel.title}</strong><small>{reel.status}</small><button type="button" className="danger" onClick={() => remove(`/api/theatre/reels/${reel.id}`)}>Remove</button></div>)}
      {stories.map((story) => <div className="owner-media-row" key={`story-${story.id}`}><span>STORY</span><strong>{story.title}</strong><small>{story.status}</small><button type="button" className="danger" onClick={() => remove(`/api/theatre/stories/${story.id}`)}>Remove</button></div>)}
      {!reels.length && !stories.length && <p className="owner-small-empty">No managed reels or stories yet.</p>}
    </div>
  </section>;
}

function dateValue(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf()) ? String(value) : date.toISOString().slice(0, 10);
}
