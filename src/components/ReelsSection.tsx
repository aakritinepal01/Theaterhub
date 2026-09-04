"use client";

import { useEffect, useRef, useState } from "react";

const reels = [
  { id: "reel-1", src: "/reels/1.mp4", title: "TheaterHub" },
  { id: "reel-2", src: "/reels/2.mp4", title: "TheaterHub" },
  { id: "reel-3", src: "/reels/3.mp4", title: "TheaterHub" },
  { id: "reel-4", src: "/reels/4.mp4", title: "TheaterHub" },
  { id: "reel-5", src: "/reels/5.mp4", title: "TheaterHub" },
  { id: "reel-6", src: "/reels/6.mp4", title: "TheaterHub" },
  { id: "reel-7", src: "/reels/7.mp4", title: "TheaterHub" },
  { id: "reel-8", src: "/reels/8.mp4", title: "TheaterHub" },
  { id: "reel-9", src: "/reels/9.mp4", title: "TheaterHub" },
];

function ReelBrand() {
  return (
    <span className="reel-brand" aria-label="TheaterHub">
      <img src="/brand-logo-dark.png" alt="" />
      <span>Theater<strong>Hub</strong></span>
    </span>
  );
}

function ReelCover({ src, title }: { src: string; title: string }) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  return (
    <>
      {thumbnail ? (
        <img className="landing-reel-cover" src={thumbnail} alt="" />
      ) : (
        <span className="landing-reel-cover-fallback" aria-hidden="true">TheaterHub</span>
      )}
      <video
        className="landing-reel-thumbnail-source"
        src={src}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onLoadedData={(event) => {
          const video = event.currentTarget;
          video.pause();
          video.currentTime = Math.min(0.5, Math.max(0, video.duration - 0.01));
        }}
        onSeeked={(event) => {
          const video = event.currentTarget;
          video.pause();
          if (!video.videoWidth || !video.videoHeight) return;
          const canvas = document.createElement("canvas");
          canvas.width = Math.min(video.videoWidth, 540);
          canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);
          canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
          setThumbnail(canvas.toDataURL("image/jpeg", 0.82));
        }}
      />
      <span className="sr-only">{title}</span>
    </>
  );
}

export function ReelsSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const feed = feedRef.current;
    const modalVideos = videoRefs.current;
    const activateReel = (index: number) => {
      modalVideos.forEach((video, videoIndex) => {
        if (!video) return;
        if (videoIndex === index) {
          video.muted = false;
          void video.play().catch(() => {
            video.muted = true;
            void video.play();
          });
        } else {
          video.pause();
          video.muted = true;
        }
      });
    };

    feed?.children[activeIndex]?.scrollIntoView();
    activateReel(activeIndex);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.75);
        if (!visibleEntry) return;
        const index = Number((visibleEntry.target as HTMLElement).dataset.reelIndex);
        activateReel(index);
      },
      { root: feed, threshold: 0.75 },
    );

    Array.from(feed?.children ?? []).forEach((item) => observer.observe(item));
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setActiveIndex(null);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      observer.disconnect();
      modalVideos.forEach((video) => {
        video?.pause();
        if (video) video.muted = true;
      });
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeIndex]);

  return (
    <section className="landing-reels" aria-labelledby="landing-reels-title">
      <div className="site-container">
        <div className="landing-reels-heading">
          <div>
            <h2 id="landing-reels-title">Theatre Reels</h2>
          </div>
        </div>
        <div className="landing-reels-grid">
          {reels.slice(0, 6).map((reel, index) => (
            <button className="landing-reel-card" key={reel.id} onClick={() => setActiveIndex(index)} type="button" aria-label={`Watch ${reel.title}`}>
              <ReelCover src={reel.src} title={reel.title} />
              <span className="landing-reel-label">Featured Reel</span>
              <span className="landing-reel-title"><ReelBrand /></span>
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <div className="reel-modal" role="dialog" aria-modal="true" aria-label="Theatre reels">
          <button className="reel-modal-close" onClick={() => setActiveIndex(null)} type="button" aria-label="Close reels">×</button>
          <div className="reel-modal-feed" ref={feedRef}>
            {reels.map((reel, index) => (
              <article className="reel-modal-item" data-reel-index={index} key={reel.id}>
                <div className="reel-player-card">
                  <video
                    ref={(video) => { videoRefs.current[index] = video; }}
                    src={reel.src}
                    muted
                    playsInline
                    loop
                    preload={index === activeIndex ? "auto" : "metadata"}
                    onClick={(event) => {
                      const video = event.currentTarget;
                      if (video.paused) void video.play();
                      else video.pause();
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== " " && event.key !== "Enter") return;
                      event.preventDefault();
                      const video = event.currentTarget;
                      if (video.paused) void video.play();
                      else video.pause();
                    }}
                    tabIndex={0}
                    aria-label={`${reel.title}. Tap to play or pause.`}
                  />
                  <span className="reel-player-brand"><ReelBrand /></span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
