"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BentoBlogGrid, type BentoBlogPost } from "@/components/BentoBlogGrid";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";

export type BlogViewPost = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  excerpt: string;
  date: string;
  categories: string[];
  readTime: string;
};

export type CategoryFilter = {
  id: number;
  title: string;
  slug: string;
};

// Same fallback table as BentoBlogGrid — theatre-themed Unsplash images
const THEATRE_FALLBACKS: Record<number, string> = {
  1:  "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=800&q=80",
  3:  "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=800&q=80",
  5:  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  6:  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
  7:  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
  8:  "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=800&q=80",
  9:  "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=800&q=80",
  10: "https://images.unsplash.com/photo-1504804884814-d58d4c9b0a35?auto=format&fit=crop&w=800&q=80",
  11: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80",
  12: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=800&q=80",
};
const GENERIC_FALLBACKS = [
  "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
];

function getCardImage(post: BlogViewPost): string {
  if (post.image) return post.image;
  return THEATRE_FALLBACKS[post.id] ?? GENERIC_FALLBACKS[post.id % GENERIC_FALLBACKS.length];
}

export function BlogInteractiveView({
  posts,
  categories,
}: {
  posts: BlogViewPost[];
  categories: CategoryFilter[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const processedCategories = useMemo(() => {
    return categories.map((c) => ({
      ...c,
      displayTitle: c.title === "Press Release" ? "Newsletter" : c.title,
    }));
  }, [categories]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCat =
        selectedCategory === "all" ||
        post.categories.some((catName) => {
          const normalizedCat = catName.toLowerCase();
          const target = selectedCategory.toLowerCase();
          if (target === "newsletter" && (normalizedCat === "press release" || normalizedCat === "newsletter")) return true;
          return normalizedCat.includes(target) || target.includes(normalizedCat);
        });
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.categories.some((c) => c.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPosts: BentoBlogPost[] = useMemo(() =>
    filteredPosts.slice(0, 4).map((p) => ({
      id: p.id, title: p.title, slug: p.slug, image: p.image,
      excerpt: p.excerpt, date: p.date, categories: p.categories, readTime: p.readTime,
    })), [filteredPosts]);

  const archivePosts = useMemo(() => filteredPosts.slice(4), [filteredPosts]);

  return (
    <div className="blog-view-container">

      {/* ── Controls ── */}
      <section className="blog-controls-section">
        <div className="blog-search-bar">
          <svg className="blog-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search stories, reviews, newsletters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="blog-search-input"
          />
          {searchQuery && (
            <button type="button" className="blog-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search">✕</button>
          )}
        </div>

        <div className="blog-category-tabs" role="tablist">
          <button
            type="button" role="tab"
            aria-selected={selectedCategory === "all"}
            className={`blog-tab-chip ${selectedCategory === "all" ? "is-active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All Stories
          </button>
          {processedCategories.map((cat) => {
            const isNewsletter = cat.slug === "newsletter" || cat.displayTitle.toLowerCase() === "newsletter";
            const isActive = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                type="button" key={cat.id} role="tab"
                aria-selected={isActive}
                className={`blog-tab-chip ${isNewsletter ? "chip-newsletter" : ""} ${isActive ? "is-active" : ""}`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {isNewsletter ? "📬 Newsletter" : cat.displayTitle}
              </button>
            );
          })}
        </div>
      </section>

      {filteredPosts.length > 0 ? (
        <>
          {/* ── Featured Bento ── */}
          {featuredPosts.length > 0 && (
            <div className="blog-section-block">
              <BentoBlogGrid posts={featuredPosts} />
            </div>
          )}

          {/* ── Newsletter Banner ── */}
          <div className="blog-newsletter-wrapper">
            <NewsletterSubscribe />
          </div>

          {/* ── Archive Cards ── */}
          {archivePosts.length > 0 && (
            <section className="blog-archive-section">
              <div className="blog-section-title">
                <span className="blog-section-badge">More Stories</span>
                <h2>From the Archive</h2>
              </div>

              <div className="mag-card-grid">
                {archivePosts.map((post) => (
                  <Link key={post.id} className="mag-card" href={`/blog/${post.slug}/`}>
                    <div className="mag-card-img-wrap">
                      <img
                        src={getCardImage(post)}
                        alt={post.title}
                        className="mag-card-img"
                        loading="lazy"
                      />
                      <span className="mag-card-cat">
                        {post.categories[0] === "Press Release" ? "Newsletter" : post.categories[0] || "Story"}
                      </span>
                    </div>
                    <div className="mag-card-body">
                      <h3 className="mag-card-title">{post.title}</h3>
                      <p className="mag-card-excerpt">{post.excerpt}</p>
                      <div className="mag-card-foot">
                        <span className="mag-card-date">{post.date}</span>
                        <span className="mag-card-read">{post.readTime} →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="blog-empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No stories found</h3>
          <p>Try a different keyword or clear the category filter.</p>
          <button
            type="button" className="button"
            onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
