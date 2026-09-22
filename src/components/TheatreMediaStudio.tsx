"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MEDIA_ACCEPT, validatePostFiles } from "@/lib/theatre-media-validation";
import styles from "./TheatreMediaStudio.module.css";

export type StudioPost = { id: string; kind: string; caption: string; createdAt: string; assets: { id: string; url: string; mediaType: string }[] };
type Selection = { file: File; url: string };

export function TheatreMediaStudio({ posts, theatreName }: { posts: StudioPost[]; theatreName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("STORY");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/theatre/posts/${id}`, { method: "DELETE" });
      const result = await res.json().catch(() => null);
      if (!res.ok) { setMessage(result?.error || "Unable to delete post."); return; }
      setMessage("Post deleted.");
      router.refresh();
    } catch { setMessage("Unable to delete post. Check your connection."); }
    finally { setDeletingId(null); }
  }

  return <div className={`owner-media-page ${styles.studio}`}>
    <header className={styles.heading}>
      <div><span className={styles.eyebrow}>YOUR THEATRE, BEHIND THE SCENES</span><h1>Stories &amp; Reels</h1><p>Share a rehearsal, a stage moment or a new perspective.</p></div>
      <button className={styles.create} type="button" onClick={() => setOpen(true)}><span aria-hidden="true">+</span> Create post</button>
    </header>
    {message && <p className={styles.notice} role="status">{message}</p>}
    <div className={styles.tabs} aria-label="Your posts">
      <button type="button" aria-pressed={tab === "STORY"} onClick={() => setTab("STORY")}>Theater Stories <small>{posts.filter(post => post.kind === "STORY").length}</small></button>
      <button type="button" aria-pressed={tab === "REEL"} onClick={() => setTab("REEL")}>Theater Reels <small>{posts.filter(post => post.kind === "REEL").length}</small></button>
    </div>
    <div className={styles.grid} data-kind={tab}>
      <button className={styles.newCard} type="button" onClick={() => setOpen(true)}><span>+</span><strong>Add {tab === "STORY" ? "a story" : "a reel"}</strong><small>Camera or gallery</small></button>
      {posts.filter(post => post.kind === tab).map(post => <article className={styles.post} key={post.id}>
        <div className={styles.postMedia}>{post.assets.map(asset => asset.mediaType === "video" ? <video key={asset.id} src={asset.url} controls playsInline preload="metadata" /> : <img key={asset.id} src={asset.url} alt={post.caption || `${theatreName} story`} loading="lazy" />)}</div>
        <div className={styles.postCaption}>
          <strong>{post.caption || theatreName}</strong>
          <small>{new Date(post.createdAt).toLocaleDateString("en-NP", { timeZone: "Asia/Kathmandu", month: "short", day: "numeric", year: "numeric" })} · {post.assets.length} media</small>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => void deletePost(post.id)}
            disabled={deletingId === post.id}
            aria-label="Delete post"
          >
            {deletingId === post.id ? "Deleting…" : "Delete"}
          </button>
        </div>
      </article>)}
    </div>
    {!posts.some(post => post.kind === tab) && <p className={styles.empty}>Your {tab === "STORY" ? "stories" : "reels"} will appear here after you post.</p>}
    {open && <Composer initialKind={tab} theatreName={theatreName} onClose={() => setOpen(false)} onPosted={kind => { setTab(kind); setMessage("Saved! Your new post is available in Stories & Reels."); setOpen(false); }} />}
  </div>;
}

function Composer({ initialKind, theatreName, onClose, onPosted }: { initialKind: string; theatreName: string; onClose: () => void; onPosted: (kind: string) => void }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const preview = useRef<HTMLVideoElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const nativeCamera = useRef<HTMLInputElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const mounted = useRef(true);
  const cameraRequest = useRef(0);
  const selections = useRef<Selection[]>([]);
  const [files, setFiles] = useState<Selection[]>([]);
  const [kind, setKind] = useState(initialKind);
  const [caption, setCaption] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("Opening camera…");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function stopCamera() {
    cameraRequest.current++;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
  }

  async function startCamera() {
    stopCamera();
    const request = cameraRequest.current;
    setCameraReady(false);
    setCameraMessage("Opening camera…");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera preview is unavailable here. Use Open phone camera or choose from your gallery.");
      const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (!mounted.current || request !== cameraRequest.current) { next.getTracks().forEach(track => track.stop()); return; }
      stream.current = next;
      if (preview.current) { preview.current.srcObject = next; await preview.current.play(); }
      setCameraReady(true);
      setCameraMessage("");
    } catch (cause) {
      if (mounted.current && request === cameraRequest.current) setCameraMessage(cause instanceof Error && cause.name === "NotAllowedError" ? "Camera permission was denied. You can still select photos and videos from your gallery." : "Camera unavailable. Open your phone camera or choose photos and videos below.");
    }
  }

  useEffect(() => {
    mounted.current = true;
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    void startCamera();
    return () => {
      mounted.current = false;
      if (recorder.current?.state === "recording") recorder.current.stop();
      stopCamera();
      selections.current.forEach(item => URL.revokeObjectURL(item.url));
      document.body.style.overflow = overflow;
    };
    // Camera and object URLs belong to this mounted composer only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => {
    if (recording && seconds >= 120) recorder.current?.stop();
  }, [seconds, recording]);

  function addFiles(incoming: File[]) {
    const validation = validatePostFiles([...selections.current.map(item => item.file), ...incoming]);
    if (validation) { setError(validation); return; }
    const next = [...selections.current, ...incoming.map(file => ({ file, url: URL.createObjectURL(file) }))];
    selections.current = next;
    setFiles(next);
    setError("");
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(selections.current[index].url);
    selections.current = selections.current.filter((_, i) => i !== index);
    setFiles(selections.current);
  }

  function takePhoto() {
    const video = preview.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(blob => { if (blob && mounted.current) addFiles([new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })]); }, "image/jpeg", .9);
  }

  async function recordVideo() {
    if (recording) { setBusy(true); recorder.current?.stop(); return; }
    if (!stream.current || typeof MediaRecorder === "undefined") { nativeCamera.current?.click(); return; }
    setBusy(true);
    try {
      // Request microphone only when the user chooses to record a video.
      try {
        const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted.current || !stream.current) { audio.getTracks().forEach(track => track.stop()); return; }
        stream.current.getAudioTracks().forEach(track => { track.stop(); stream.current?.removeTrack(track); });
        audio.getAudioTracks().forEach(track => stream.current?.addTrack(track));
      } catch { setCameraMessage("Microphone unavailable. Recording without sound."); }
      if (!mounted.current || !stream.current) return;
      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm", "video/mp4"].find(type => MediaRecorder.isTypeSupported(type));
      const next = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
      recorder.current = next;
      const chunks: Blob[] = [];
      let bytes = 0;
      next.ondataavailable = event => {
        if (event.data.size) { chunks.push(event.data); bytes += event.data.size; }
        if (bytes >= 48 * 1024 * 1024 && next.state === "recording") next.stop();
      };
      next.onstop = () => {
        stream.current?.getAudioTracks().forEach(track => { track.stop(); stream.current?.removeTrack(track); });
        if (!mounted.current) return;
        setRecording(false);
        setBusy(false);
        const type = next.mimeType.split(";")[0];
        addFiles([new File(chunks, `video-${Date.now()}.${type === "video/mp4" ? "mp4" : "webm"}`, { type })]);
      };
      next.onerror = () => { if (mounted.current) { setError("Recording failed. Try choosing a video from your gallery."); setRecording(false); setBusy(false); } };
      next.start(1000);
      setSeconds(0);
      setRecording(true);
    } catch { setError("This device cannot record here. Use your phone camera or gallery."); }
    finally { if (mounted.current) setBusy(false); }
  }

  async function post() {
    if (busy || recording || !files.length) return;
    const data = new FormData();
    data.set("kind", kind);
    data.set("caption", caption);
    files.forEach(item => data.append("files", item.file));
    setBusy(true); setError(""); setProgress(0);
    stopCamera(); setCameraReady(false); setCameraMessage("Your selected media is ready to post.");
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/theatre/posts");
        xhr.timeout = 180000;
        xhr.upload.onprogress = event => { if (event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100)); };
        xhr.onload = () => {
          let result: { ok?: boolean; error?: string } = {};
          try { result = JSON.parse(xhr.responseText); } catch { /* Use a readable fallback for non-JSON errors. */ }
          if (xhr.status >= 200 && xhr.status < 300 && result.ok) resolve();
          else reject(new Error(result.error || "Unable to post. Please try again."));
        };
        xhr.onerror = () => reject(new Error("Connection lost. Your selected files are kept here. Please try again."));
        xhr.ontimeout = () => reject(new Error("Upload timed out. Please check your connection and try again."));
        xhr.send(data);
      });
      router.refresh();
      onPosted(kind);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to post."); }
    finally { if (mounted.current) setBusy(false); }
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="create-theatre-post" onCancel={event => { event.preventDefault(); if (!busy && !recording) onClose(); }}>
    <header className={styles.modalHeader}><div><small>{theatreName}</small><h2 id="create-theatre-post">Create a moment</h2></div><button type="button" aria-label="Close composer" onClick={onClose} disabled={busy || recording}>×</button></header>
    <div className={styles.composer}>
      <div>
        <div className={styles.camera}>
          <video ref={preview} autoPlay muted playsInline aria-label="Live camera preview" />
          {!cameraReady && <div className={styles.cameraFallback}><span aria-hidden="true">◎</span><p>{cameraMessage}</p></div>}
          {recording && <strong className={styles.recording}>● REC {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</strong>}
        </div>
        {cameraReady && cameraMessage && <p className={styles.hint}>{cameraMessage}</p>}
        <div className={styles.captureControls}>
          <button type="button" onClick={takePhoto} disabled={!cameraReady || busy || recording}>Take photo</button>
          <button type="button" onClick={() => void recordVideo()} disabled={!cameraReady || busy}>{recording ? "Stop recording" : "Record video"}</button>
        </div>
        <div className={styles.modeSwitch} aria-label="Post type">
          <button type="button" aria-pressed={kind === "STORY"} disabled={busy || recording} onClick={() => setKind("STORY")}>STORIES</button>
          <button type="button" aria-pressed={kind === "REEL"} disabled={busy || recording} onClick={() => setKind("REEL")}>REELS</button>
        </div>
      </div>
      <div className={styles.details}>
        <h3>{kind === "STORY" ? "Theater Story" : "Theater Reel"}</h3>
        <p>Pick the moments you want to share with your audience.</p>
        <input ref={gallery} type="file" accept={MEDIA_ACCEPT} multiple hidden onChange={event => { addFiles(Array.from(event.target.files || [])); event.target.value = ""; }} />
        <input ref={nativeCamera} type="file" accept="image/*,video/*" capture="environment" hidden onChange={event => { addFiles(Array.from(event.target.files || [])); event.target.value = ""; }} />
        <button className={styles.gallery} type="button" disabled={busy || recording} onClick={() => gallery.current?.click()}>+ Select photos / videos</button>
        {!cameraReady && <button type="button" className={styles.textButton} disabled={busy} onClick={() => nativeCamera.current?.click()}>Open phone camera</button>}
        <small className={styles.hint}>Up to 10 files · Photos 10 MB · Videos 50 MB</small>
        <div className={styles.selected}>
          {files.map((item, index) => <div key={item.url}>
            {item.file.type.startsWith("video/") ? <video src={item.url} controls playsInline preload="metadata" /> : <img src={item.url} alt={`Selected photo ${index + 1}`} />}
            <button type="button" aria-label={`Remove file ${index + 1}`} disabled={busy || recording} onClick={() => removeFile(index)}>×</button>
          </div>)}
        </div>
        <label className={styles.caption}>Caption<textarea value={caption} onChange={event => setCaption(event.target.value)} maxLength={1000} rows={3} placeholder="Tell the story behind this moment…" disabled={busy} /><small>{caption.length}/1,000</small></label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        {busy && <p role="status">{progress < 100 ? `Uploading… ${progress}%` : "Processing your post…"}</p>}
        <button className={styles.publish} type="button" onClick={() => void post()} disabled={busy || recording || !files.length}>{busy ? "Please wait…" : `Post ${kind === "STORY" ? "story" : "reel"}`}</button>
        <small className={styles.hint}>Your post will be saved to your theatre’s Stories &amp; Reels.</small>
      </div>
    </div>
  </dialog>;
}
