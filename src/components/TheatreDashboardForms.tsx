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

function dateValue(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf()) ? String(value) : date.toISOString().slice(0, 10);
}
