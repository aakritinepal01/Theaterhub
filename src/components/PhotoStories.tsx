"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type PhotoStory = {
  id: number;
  title: string;
  image: string;
  href: string;
};

export type PhotoStoryGroup = { id: string; title: string; stories: PhotoStory[] };

export function PhotoStories({ groups }: { groups: PhotoStoryGroup[] }) {
  const stories = groups.flatMap((group) => group.stories);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeStories, setActiveStories] = useState<PhotoStory[] | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
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
    <section className="landing-photo-stories" aria-labelledby="photo-stories-title">
      <div className="site-container">
        <div className="landing-photo-stories-heading">
          <h2 id="photo-stories-title">Web Stories</h2>
        </div>
        <div className="landing-photo-story-list">
          {groups.map((group) => {
            return <button className="landing-photo-story" key={group.id} type="button" onClick={() => { setActiveStories(group.stories); setActiveIndex(0); }}>
              <span className="landing-photo-story-collage">{group.stories.map((story) => <img key={story.id} src={story.image} alt="" />)}</span>
              <span className="landing-photo-story-count">{group.stories.length} stories</span>
              <strong>{group.title}</strong>
            </button>;
          })}
        </div>
      </div>

      {activeStory && activeIndex !== null && activeStories && (
        <div className="photo-story-modal" role="dialog" aria-modal="true" aria-label={activeStory.title}>
          <div
            className="photo-story-viewer"
            onTouchStart={(event) => { touchStartY.current = event.touches[0]?.clientY ?? null; }}
            onTouchEnd={(event) => {
              if (touchStartY.current === null || !activeStories) return;
              const distance = (event.changedTouches[0]?.clientY ?? touchStartY.current) - touchStartY.current;
              touchStartY.current = null;
              if (Math.abs(distance) < 45) return;
              if (distance < 0 && activeIndex + 1 < activeStories.length) setActiveIndex(activeIndex + 1);
              if (distance > 0 && activeIndex > 0) setActiveIndex(activeIndex - 1);
            }}
          >
            <div className="photo-story-progress" aria-hidden="true">
              {activeStories.map((story, index) => (
                <span key={story.id} className={index < activeIndex ? "is-complete" : index === activeIndex ? "is-active" : ""} />
              ))}
            </div>
            <button className="photo-story-close" onClick={() => { setActiveIndex(null); setActiveStories(null); }} type="button" aria-label="Close story">×</button>
            <img className="photo-story-full-image" src={activeStory.image} alt={activeStory.title} />
            <div className="photo-story-shade" />
            <div className="photo-story-caption">
              <span>Theater<strong>Hub</strong></span>
              <h3>{activeStory.title}</h3>
              <Link href={activeStory.href}>View story →</Link>
            </div>
            {activeIndex > 0 && <button className="photo-story-nav photo-story-prev" type="button" aria-label="Previous story" onClick={() => setActiveIndex(activeIndex - 1)}>‹</button>}
            {activeIndex < activeStories.length - 1 && <button className="photo-story-nav photo-story-next" type="button" aria-label="Next story" onClick={() => setActiveIndex(activeIndex + 1)}>›</button>}
          </div>
        </div>
      )}
    </section>
  );
}
