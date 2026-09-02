"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export type ReviewItem = {
  id: string | number;
  playTitle: string;
  playSlug: string;
  playImage: string | null;
  theatreName: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: string;
  rating: number; // e.g. 4.8 out of 5
  verdictTag: "Masterpiece" | "Must Watch" | "Highly Recommended" | "Poignant Drama" | "Visually Stunning" | "Audience Favorite";
  date: string;
  title: string;
  excerpt: string;
  content: string;
  keyQuote: string;
  scores: {
    acting: number;
    direction: number;
    stageDesign: number;
    script: number;
  };
  isSpotlight?: boolean;
};

// Fallback Unsplash Theatre Images
const THEATRE_FALLBACKS = [
  "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504804884814-d58d4c9b0a35?auto=format&fit=crop&w=800&q=80",
];

function getReviewImage(review: ReviewItem, index: number): string {
  if (review.playImage) return review.playImage;
  return THEATRE_FALLBACKS[index % THEATRE_FALLBACKS.length];
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4;
  const starClass = size === "sm" ? "star-icon-sm" : size === "lg" ? "star-icon-lg" : "star-icon-md";

  return (
    <div className={`star-rating-row size-${size}`} aria-label={`Rating ${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <span key={i} className={`star-filled ${starClass}`}>
              ★
            </span>
          );
        }
        if (i === fullStars && hasHalf) {
          return (
            <span key={i} className={`star-half ${starClass}`}>
              ★
            </span>
          );
        }
        return (
          <span key={i} className={`star-empty ${starClass}`}>
            ☆
          </span>
        );
      })}
      <span className="rating-score-num">{rating.toFixed(1)}</span>
    </div>
  );
}

export function ReviewsInteractiveView({ initialReviews }: { initialReviews: ReviewItem[] }) {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(initialReviews);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"highest" | "latest" | "popular">("highest");
  
  // Modal states
  const [activeModalReview, setActiveModalReview] = useState<ReviewItem | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Submit form state
  const [newPlayTitle, setNewPlayTitle] = useState("");
  const [newTheatreName, setNewTheatreName] = useState("Mandala Theatre Nepal");
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const spotlightReview = useMemo(() => {
    return reviewsList.find((r) => r.isSpotlight) || reviewsList[0];
  }, [reviewsList]);

  const filteredReviews = useMemo(() => {
    return reviewsList.filter((rev) => {
      // Category filter
      let matchesCat = true;
      if (selectedCategory === "masterpiece") matchesCat = rev.rating >= 4.7;
      else if (selectedCategory === "editors") matchesCat = !!rev.isSpotlight || rev.rating >= 4.5;
      else if (selectedCategory === "audience") matchesCat = rev.reviewerRole.toLowerCase().includes("audience") || rev.reviewerRole.toLowerCase().includes("viewer");

      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        rev.playTitle.toLowerCase().includes(q) ||
        rev.title.toLowerCase().includes(q) ||
        rev.reviewerName.toLowerCase().includes(q) ||
        rev.theatreName.toLowerCase().includes(q) ||
        rev.excerpt.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "latest") return new Date(b.date).getTime() - new Date(a.date).getTime();
      return b.scores.acting + b.scores.direction - (a.scores.acting + a.scores.direction);
    });
  }, [reviewsList, selectedCategory, searchQuery, sortBy]);

  const reviewSummary = useMemo(() => {
    const average = reviewsList.length
      ? reviewsList.reduce((total, review) => total + review.rating, 0) / reviewsList.length
      : 0;
    const venueCount = new Set(reviewsList.map((review) => review.theatreName)).size;

    return {
      average: average.toFixed(1),
      venueCount,
    };
  }, [reviewsList]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayTitle || !newReviewerName || !newTitle || !newContent) return;

    const newRevItem: ReviewItem = {
      id: Date.now(),
      playTitle: newPlayTitle,
      playSlug: newPlayTitle.toLowerCase().replace(/\s+/g, "-"),
      playImage: THEATRE_FALLBACKS[Math.floor(Math.random() * THEATRE_FALLBACKS.length)],
      theatreName: newTheatreName || "Stage Theatre Nepal",
      reviewerName: newReviewerName,
      reviewerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      reviewerRole: "Theatre Viewer",
      rating: newRating,
      verdictTag: newRating >= 4.7 ? "Masterpiece" : newRating >= 4.0 ? "Highly Recommended" : "Audience Favorite",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      title: newTitle,
      excerpt: newContent.slice(0, 160) + "...",
      content: newContent,
      keyQuote: `"${newTitle}"`,
      scores: {
        acting: Math.min(5, newRating + 0.1),
        direction: newRating,
        stageDesign: Math.max(3.5, newRating - 0.2),
        script: newRating,
      },
    };

    setReviewsList((prev) => [newRevItem, ...prev]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setShowSubmitModal(false);
      setSubmitSuccess(false);
      setNewPlayTitle("");
      setNewReviewerName("");
      setNewTitle("");
      setNewContent("");
    }, 1800);
  };

  return (
    <div className="reviews-view-wrapper">
      <div className="site-container">
        <section className="reviews-intro" aria-labelledby="reviews-page-title">
          <div className="reviews-intro-copy">
            <span className="reviews-eyebrow">TheatreHub editorial desk</span>
            <h1 id="reviews-page-title">Reviews that look beyond the curtain</h1>
            <p>
              Thoughtful criticism, audience reactions, and practical scorecards for the performances shaping Nepal&apos;s live theatre scene.
            </p>
          </div>
          <div className="reviews-summary-grid" aria-label="Review overview">
            <div className="reviews-summary-stat">
              <strong>{reviewsList.length}</strong>
              <span>Published reviews</span>
            </div>
            <div className="reviews-summary-stat reviews-summary-stat-accent">
              <strong>{reviewSummary.average}</strong>
              <span>Average audience score</span>
            </div>
            <div className="reviews-summary-stat">
              <strong>{reviewSummary.venueCount}</strong>
              <span>Venues covered</span>
            </div>
          </div>
        </section>

        {/* ── 2. SPOTLIGHT / EDITOR'S CHOICE REVIEW ── */}
        {spotlightReview && (
          <section id="featured-spotlight" className="reviews-spotlight-section">
            <div className="spotlight-header-label">
              <span className="spotlight-star">✨</span> Editor&apos;s Choice Critique
            </div>

            <div className="spotlight-card">
              <div className="spotlight-img-wrap">
                <img
                  src={getReviewImage(spotlightReview, 0)}
                  alt={spotlightReview.playTitle}
                  className="spotlight-img"
                />
                <div className="spotlight-tag-badge">{spotlightReview.verdictTag}</div>
              </div>

              <div className="spotlight-body">
                <div className="spotlight-top-meta">
                  <StarRating rating={spotlightReview.rating} size="lg" />
                  <span className="spotlight-date">{spotlightReview.date}</span>
                </div>

                <h2 className="spotlight-play-title">{spotlightReview.playTitle}</h2>
                <div className="spotlight-venue">🏛️ {spotlightReview.theatreName}</div>

                <h3 className="spotlight-review-headline">&ldquo;{spotlightReview.title}&rdquo;</h3>

                <blockquote className="spotlight-quote">
                  &ldquo;{spotlightReview.keyQuote}&rdquo;
                </blockquote>

                <p className="spotlight-excerpt">{spotlightReview.excerpt}</p>

                {/* Scorecard Breakdown */}
                <div className="spotlight-scorecard">
                  <div className="score-item">
                    <span className="score-label">🎭 Acting</span>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${(spotlightReview.scores.acting / 5) * 100}%` }} />
                    </div>
                    <span className="score-val">{spotlightReview.scores.acting}</span>
                  </div>

                  <div className="score-item">
                    <span className="score-label">🎬 Direction</span>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${(spotlightReview.scores.direction / 5) * 100}%` }} />
                    </div>
                    <span className="score-val">{spotlightReview.scores.direction}</span>
                  </div>

                  <div className="score-item">
                    <span className="score-label">🎨 Stage Design</span>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${(spotlightReview.scores.stageDesign / 5) * 100}%` }} />
                    </div>
                    <span className="score-val">{spotlightReview.scores.stageDesign}</span>
                  </div>

                  <div className="score-item">
                    <span className="score-label">📜 Script &amp; Dialog</span>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${(spotlightReview.scores.script / 5) * 100}%` }} />
                    </div>
                    <span className="score-val">{spotlightReview.scores.script}</span>
                  </div>
                </div>

                <div className="spotlight-footer">
                  <div className="reviewer-info">
                    <img
                      src={spotlightReview.reviewerAvatar}
                      alt={spotlightReview.reviewerName}
                      className="reviewer-avatar"
                    />
                    <div>
                      <strong>{spotlightReview.reviewerName}</strong>
                      <small>{spotlightReview.reviewerRole}</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="read-full-btn"
                    onClick={() => setActiveModalReview(spotlightReview)}
                  >
                    Read Full Review →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 3. CONTROLS BAR (SEARCH & TABS & SORT) ── */}
        <section className="reviews-controls-bar">
          <div className="section-heading-row">
            <div>
              <span className="section-kicker">The review library</span>
              <h2>Explore every critique</h2>
            </div>
            <span className="results-count">Showing {filteredReviews.length} of {reviewsList.length}</span>
          </div>
          <div className="controls-row">
            {/* Search Input */}
            <div className="reviews-search-wrap">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="reviews-search-input"
                placeholder="Search reviews by play, critic, theatre or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown & Submit Button */}
            <div className="reviews-sort-wrap">
              <label htmlFor="review-sort-select">Sort by:</label>
              <select
                id="review-sort-select"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="reviews-sort-select"
              >
                <option value="highest">⭐ Highest Rated</option>
                <option value="latest">📅 Latest Reviews</option>
                <option value="popular">🔥 Performance Score</option>
              </select>
              <button
                type="button"
                className="about-btn about-btn-primary"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                onClick={() => setShowSubmitModal(true)}
              >
                ✍️ Write Review
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="reviews-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === "all"}
              className={`reviews-tab-chip ${selectedCategory === "all" ? "is-active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All Reviews ({reviewsList.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === "masterpiece"}
              className={`reviews-tab-chip ${selectedCategory === "masterpiece" ? "is-active" : ""}`}
              onClick={() => setSelectedCategory("masterpiece")}
            >
              🏆 Masterpieces (4.7+)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === "editors"}
              className={`reviews-tab-chip ${selectedCategory === "editors" ? "is-active" : ""}`}
              onClick={() => setSelectedCategory("editors")}
            >
              ✨ Critic Choice
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === "audience"}
              className={`reviews-tab-chip ${selectedCategory === "audience" ? "is-active" : ""}`}
              onClick={() => setSelectedCategory("audience")}
            >
              🗣️ Audience Reviews
            </button>
          </div>
        </section>

        {/* ── 4. REVIEWS GRID ── */}
        {filteredReviews.length > 0 ? (
          <section className="reviews-grid-section">
            <div className="reviews-grid">
              {filteredReviews.map((rev, idx) => (
                <article key={rev.id} className="review-card">
                  <div className="review-card-img-wrap">
                    <img
                      src={getReviewImage(rev, idx)}
                      alt={rev.playTitle}
                      className="review-card-img"
                      loading="lazy"
                    />
                    <span className="review-card-verdict">{rev.verdictTag}</span>
                    <div className="review-card-rating-badge">
                      ★ {rev.rating.toFixed(1)}
                    </div>
                  </div>

                  <div className="review-card-content">
                    <div className="review-card-header">
                      <span className="review-card-venue">🏛️ {rev.theatreName}</span>
                      <span className="review-card-date">{rev.date}</span>
                    </div>

                    <h3 className="review-card-play-title">{rev.playTitle}</h3>
                    <h4 className="review-card-title">&ldquo;{rev.title}&rdquo;</h4>

                    <p className="review-card-excerpt">{rev.excerpt}</p>

                    {/* Mini score pills */}
                    <div className="review-mini-scores">
                      <span title="Acting">🎭 {rev.scores.acting}</span>
                      <span title="Direction">🎬 {rev.scores.direction}</span>
                      <span title="Stage Design">🎨 {rev.scores.stageDesign}</span>
                      <span title="Script">📜 {rev.scores.script}</span>
                    </div>

                    <div className="review-card-footer">
                      <div className="reviewer-mini">
                        <img
                          src={rev.reviewerAvatar}
                          alt={rev.reviewerName}
                          className="reviewer-mini-avatar"
                        />
                        <div className="reviewer-mini-text">
                          <strong>{rev.reviewerName}</strong>
                          <small>{rev.reviewerRole}</small>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="review-read-btn"
                        onClick={() => setActiveModalReview(rev)}
                      >
                        Read Critique →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="reviews-empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No reviews match your query</h3>
            <p>Try searching for a different play name, theatre, or clearing filters.</p>
            <button
              type="button"
              className="about-btn about-btn-primary"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ── 5. SUBMIT REVIEW CALLOUT BANNER ── */}
        <section className="reviews-cta-banner">
          <div className="cta-banner-content">
            <span className="cta-kicker">🎭 Share Your Experience</span>
            <h2>Attended a stage play recently in Nepal?</h2>
            <p>
              Help the theatre ecosystem grow by writing your constructive thoughts, critique, and star ratings for recent stage performances.
            </p>
          </div>
          <button
            type="button"
            className="about-btn about-btn-primary about-btn-lg"
            onClick={() => setShowSubmitModal(true)}
          >
            Submit a Review ✍️
          </button>
        </section>
      </div>

      {/* ── 6. FULL REVIEW DETAIL MODAL ── */}
      {activeModalReview && (
        <div className="review-modal-backdrop" onClick={() => setActiveModalReview(null)}>
          <div
            className="review-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="modal-play-title"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveModalReview(null)}
              aria-label="Close review modal"
            >
              ✕
            </button>

            <div className="modal-header-hero">
              <img
                src={getReviewImage(activeModalReview, 0)}
                alt={activeModalReview.playTitle}
                className="modal-cover-img"
              />
              <div className="modal-hero-overlay">
                <span className="modal-verdict-pill">{activeModalReview.verdictTag}</span>
                <h2 id="modal-play-title">{activeModalReview.playTitle}</h2>
                <div className="modal-venue-row">
                  <span>🏛️ {activeModalReview.theatreName}</span>
                  <span>•</span>
                  <span>📅 {activeModalReview.date}</span>
                </div>
              </div>
            </div>

            <div className="modal-body-scroll">
              <div className="modal-rating-row">
                <StarRating rating={activeModalReview.rating} size="lg" />
                <span className="modal-rating-text">{activeModalReview.rating.toFixed(1)} / 5.0 Rating</span>
              </div>

              <h3 className="modal-review-headline">&ldquo;{activeModalReview.title}&rdquo;</h3>

              <div className="modal-reviewer-bar">
                <img
                  src={activeModalReview.reviewerAvatar}
                  alt={activeModalReview.reviewerName}
                  className="modal-reviewer-avatar"
                />
                <div>
                  <strong>{activeModalReview.reviewerName}</strong>
                  <small>{activeModalReview.reviewerRole}</small>
                </div>
              </div>

              {/* Comprehensive Scorecard */}
              <div className="modal-detailed-scorecard">
                <h4>Artistic Breakdown</h4>
                <div className="modal-scores-grid">
                  <div className="modal-score-box">
                    <span>🎭 Acting Performance</span>
                    <strong>{activeModalReview.scores.acting} / 5.0</strong>
                  </div>
                  <div className="modal-score-box">
                    <span>🎬 Direction &amp; Vision</span>
                    <strong>{activeModalReview.scores.direction} / 5.0</strong>
                  </div>
                  <div className="modal-score-box">
                    <span>🎨 Stage &amp; Lighting Design</span>
                    <strong>{activeModalReview.scores.stageDesign} / 5.0</strong>
                  </div>
                  <div className="modal-score-box">
                    <span>📜 Playwright &amp; Script</span>
                    <strong>{activeModalReview.scores.script} / 5.0</strong>
                  </div>
                </div>
              </div>

              <blockquote className="modal-key-quote">
                &ldquo;{activeModalReview.keyQuote}&rdquo;
              </blockquote>

              <div className="modal-full-text">
                {activeModalReview.content.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className="modal-actions-footer">
                <Link
                  href={`/play/${activeModalReview.playSlug}/`}
                  className="about-btn about-btn-primary"
                  onClick={() => setActiveModalReview(null)}
                >
                  Explore Play Page →
                </Link>
                <button
                  type="button"
                  className="about-btn about-btn-ghost"
                  onClick={() => setActiveModalReview(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. WRITE A REVIEW FORM MODAL ── */}
      {showSubmitModal && (
        <div className="review-modal-backdrop" onClick={() => setShowSubmitModal(false)}>
          <div
            className="review-modal-card submit-form-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="submit-modal-title"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowSubmitModal(false)}
            >
              ✕
            </button>

            <div className="submit-modal-header">
              <h2 id="submit-modal-title">✍️ Submit Play Review &amp; Rating</h2>
              <p>Share your artistic critique and audience feedback for Nepal theatre productions.</p>
            </div>

            {submitSuccess ? (
              <div className="submit-success-state">
                <div className="success-icon">🎉</div>
                <h3>Review Published!</h3>
                <p>Thank you for contributing to Nepal&apos;s stage community!</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="review-submit-form">
                <div className="form-group">
                  <label htmlFor="play-title-input">Play Title *</label>
                  <input
                    id="play-title-input"
                    type="text"
                    required
                    placeholder="e.g. Degree Kaila, Sirumarani, Hamlet..."
                    value={newPlayTitle}
                    onChange={(e) => setNewPlayTitle(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="theatre-name-input">Theatre Venue</label>
                    <select
                      id="theatre-name-input"
                      value={newTheatreName}
                      onChange={(e) => setNewTheatreName(e.target.value)}
                    >
                      <option value="Mandala Theatre Nepal">Mandala Theatre Nepal</option>
                      <option value="Shilpee Theatre">Shilpee Theatre</option>
                      <option value="Kausi Theatre">Kausi Theatre</option>
                      <option value="Theatre Village">Theatre Village</option>
                      <option value="Sarwanam Theatre">Sarwanam Theatre</option>
                      <option value="Pokhara Theatre">Pokhara Theatre</option>
                      <option value="Rastriya Nachghar">Rastriya Nachghar</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reviewer-name-input">Your Name *</label>
                    <input
                      id="reviewer-name-input"
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={newReviewerName}
                      onChange={(e) => setNewReviewerName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Star Rating (1 to 5 Stars) *</label>
                  <div className="star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-pick-btn ${star <= newRating ? "is-selected" : ""}`}
                        onClick={() => setNewRating(star)}
                      >
                        ★
                      </button>
                    ))}
                    <span className="picker-score">{newRating}.0 Stars</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="review-title-input">Review Headline *</label>
                  <input
                    id="review-title-input"
                    type="text"
                    required
                    placeholder="e.g. A Breathtaking Masterpiece of Contemporary Acting"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="review-content-input">Detailed Critique &amp; Remarks *</label>
                  <textarea
                    id="review-content-input"
                    required
                    rows={5}
                    placeholder="Write your thoughts on acting, directorial choices, scenography, sound, and emotional impact..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="about-btn about-btn-primary">
                    Publish Review 🚀
                  </button>
                  <button
                    type="button"
                    className="about-btn about-btn-ghost"
                    onClick={() => setShowSubmitModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
