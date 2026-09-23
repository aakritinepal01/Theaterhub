"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { TheatreMediaItem, TheatreMediaGroup } from "@/lib/theatre-post-groups";
export type PhotoStory = TheatreMediaItem;
export type PhotoStoryGroup = TheatreMediaGroup;
export function PhotoStories({ groups, variant = "stories" }: { groups: PhotoStoryGroup[]; variant?: "stories" | "reels" }) {
  const isReels = variant === "reels";
  const stories = groups.flatMap((group) => group.stories);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeStories, setActiveStories] = useState<PhotoStory[] | null>(null);
  const activeGroup = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastWheel = useRef(0);
  const swipeStory = (step: number) => {
    if (activeIndex === null || !activeStories) return;
    const nextIndex = activeIndex + step;
    if (nextIndex >= 0 && nextIndex < activeStories.length) {
      setActiveIndex(nextIndex);
      return;
    }
    let nextGroup = activeGroup.current + step;
    while (nextGroup >= 0 && nextGroup < groups.length) {
      const nextStories = groups[nextGroup].stories;
      if (nextStories.length) {
        activeGroup.current = nextGroup;
        setActiveStories(nextStories);
        setActiveIndex(step > 0 ? 0 : nextStories.length - 1);
        return;
      }
      nextGroup += step;
    }
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = activeStories?.[activeIndex]?.mediaType === "video" ? undefined : window.setTimeout(() => {
      if (!activeStories || activeIndex + 1 >= activeStories.length) {
        setActiveIndex(null);
        setActiveStories(null);
      } else {
        setActiveIndex(activeIndex + 1);
      }
    }, 6000);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight" && activeStories) setActiveIndex((activeIndex + 1) % activeStories.length);
      if (event.key === "ArrowLeft" && activeStories) setActiveIndex((activeIndex - 1 + activeStories.length) % activeStories.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, activeStories]);

  if (!groups.length || !stories.length) return null;

  const activeStory = activeIndex === null || !activeStories ? null : activeStories[activeIndex];

  return (
    <section className={isReels ? "landing-reels" : "landing-photo-stories"} aria-labelledby={`${variant}-title`}>
      <div className="site-container">
        <div className="landing-photo-stories-heading">
          <h2 id={`${variant}-title`}>{isReels ? "Theatre Reels" : "Theatre Stories"}</h2>
        </div>
        <div className={isReels ? "landing-reels-grid" : "landing-photo-story-list"}>
          {groups.slice(0, 6).map((group, groupIndex) => {
            return <button className={isReels ? "landing-reel-card" : "landing-photo-story"} key={group.id} type="button" onClick={() => { activeGroup.current = groupIndex; setActiveStories(group.stories); setActiveIndex(0); }}>
              <span className={isReels ? "theatre-reel-preview" : "landing-photo-story-collage"}>{group.stories.slice(0, isReels ? 1 : 3).map((story) => story.mediaType === "video" ? <video key={story.id} src={`${story.image}#t=0.1`} muted playsInline preload="metadata" aria-hidden="true" /> : <img key={story.id} src={story.image} alt="" loading="lazy" />)}</span>
              <span className={isReels ? "landing-reel-label" : "landing-photo-story-count"}>{group.stories.length} {variant}</span>
              <strong className={isReels ? "landing-reel-title" : undefined}>{group.title}</strong>
            </button>;
          })}
        </div>
      </div>

      {activeStory && activeIndex !== null && activeStories && (
        <div className="photo-story-modal" role="dialog" aria-modal="true" aria-label={activeStory.title}>
          <div
            className="photo-story-viewer"
            onTouchStart={(event) => {
              const touch = event.touches[0];
              touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
            }}
            onTouchCancel={() => { touchStart.current = null; }}
            onTouchEnd={(event) => {
              if (!touchStart.current) return;
              const touch = event.changedTouches[0];
              const dx = touch.clientX - touchStart.current.x;
              const dy = touch.clientY - touchStart.current.y;
              touchStart.current = null;
              if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy)) swipeStory(dx < 0 ? 1 : -1);
              else if (Math.abs(dy) >= 45 && Math.abs(dy) > Math.abs(dx)) {
                if (dy < 0 && activeIndex + 1 < activeStories.length) setActiveIndex(activeIndex + 1);
                if (dy > 0 && activeIndex > 0) setActiveIndex(activeIndex - 1);
              }
            }}
            onWheel={(event) => {
              if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 10) return;
              const now = performance.now();
              if (now - lastWheel.current < 500) return;
              lastWheel.current = now;
              swipeStory(event.deltaX > 0 ? 1 : -1);
            }}
          >
            <div className="photo-story-progress" aria-hidden="true">
              {activeStories.map((story, index) => (
                <span key={`${story.id}-${activeIndex}`} className={index < activeIndex ? "is-complete" : index === activeIndex && activeStory.mediaType !== "video" ? "is-active" : ""} />
              ))}
            </div>
            <button className="photo-story-close" onClick={() => { setActiveIndex(null); setActiveStories(null); }} type="button" aria-label="Close story">×</button>
            {activeStory.mediaType === "video" ? <video key={activeStory.id} className="photo-story-full-image theatre-story-video" src={activeStory.image} controls autoPlay muted playsInline onEnded={() => {
              if (activeIndex + 1 < activeStories.length) setActiveIndex(activeIndex + 1);
              else { setActiveIndex(null); setActiveStories(null); }
            }} /> : <img key={activeStory.id} className="photo-story-full-image" src={activeStory.image} alt={activeStory.title} />}
            <div className="photo-story-shade" />
            <div className="photo-story-caption">
              <span>{activeStory.theatreName}</span>
              <h3>{activeStory.title}</h3>
              <Link href={activeStory.href}>View theatre →</Link>
            </div>
            {activeIndex > 0 && <button className="photo-story-nav photo-story-prev" type="button" aria-label="Previous story" onClick={() => setActiveIndex(activeIndex - 1)}>‹</button>}
            {activeIndex < activeStories.length - 1 && <button className="photo-story-nav photo-story-next" type="button" aria-label="Next story" onClick={() => setActiveIndex(activeIndex + 1)}>›</button>}
          </div>
        </div>
      )}
    </section>
  );
}
