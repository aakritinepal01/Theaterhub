"use client";

import { useState, useMemo, type ChangeEvent, type FormEvent } from "react";
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

type ScoreKey = keyof ReviewItem["scores"];
type RecommendationOption = "Strongly recommend" | "Worth watching" | "Mixed experience";

const SCORE_INPUTS: { key: ScoreKey; label: string; note: string }[] = [
  { key: "acting", label: "Acting", note: "Ensemble, voice, physicality" },
  { key: "direction", label: "Direction", note: "Pacing, blocking, vision" },
  { key: "stageDesign", label: "Stage Design", note: "Set, light, costume, sound" },
  { key: "script", label: "Script", note: "Dialog, structure, theme" },
];

const RECOMMENDATION_OPTIONS: RecommendationOption[] = [
  "Strongly recommend",
  "Worth watching",
  "Mixed experience",
];

const DEFAULT_SUBMIT_SCORES: ReviewItem["scores"] = {
  acting: 5,
  direction: 5,
  stageDesign: 5,
  script: 5,
};

function getReviewImage(review: ReviewItem, index: number): string {
  if (review.playImage) return review.playImage;
  return THEATRE_FALLBACKS[index % THEATRE_FALLBACKS.length];
}

function getTheatreLogo(name: string): string {
  const value = name.toLowerCase();
  if (value.includes("mandala")) return "/uploads/theatre_logo/mandala-logo.png";
  if (value.includes("shilpee")) return "/uploads/theatre_logo/shilpee-logo.jpg";
  if (value.includes("kausi")) return "/uploads/theatre_logo/kausi-theatre-logo.png";
  if (value.includes("village")) return "/uploads/theatre_logo/theatre-village_logo.jpg";
  if (value.includes("sarwanam")) return "/uploads/theatre_logo/sarwanam-logo.png";
  if (value.includes("pokhara")) return "/uploads/theatre_logo/pokhara_theatre.jpg";
  return "/brand-logo.png";
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
  const reviewsList = initialReviews;
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"highest" | "latest" | "popular">("highest");
  
  // Modal states
  const [activeModalReview, setActiveModalReview] = useState<ReviewItem | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Submit form state
  const [newPlayTitle, setNewPlayTitle] = useState("");
  const [newTheatreName, setNewTheatreName] = useState("Mandala Theatre Nepal");
  const [newCustomTheatreName, setNewCustomTheatreName] = useState("");
  const [newPerformanceDate, setNewPerformanceDate] = useState("");
  const [newSeatContext, setNewSeatContext] = useState("");
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newReviewerRole, setNewReviewerRole] = useState("Audience Member");
  const [newScores, setNewScores] = useState<ReviewItem["scores"]>({ ...DEFAULT_SUBMIT_SCORES });
  const [newRecommendation, setNewRecommendation] = useState<RecommendationOption>("Strongly recommend");
  const [newTitle, setNewTitle] = useState("");
  const [newKeyQuote, setNewKeyQuote] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newWhatWorked, setNewWhatWorked] = useState("");
  const [newWhatCouldImprove, setNewWhatCouldImprove] = useState("");

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

  const newOverallRating = useMemo(() => {
    const values = Object.values(newScores);
    return Number((values.reduce((total, score) => total + score, 0) / values.length).toFixed(1));
  }, [newScores]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedPlayTitle = newPlayTitle.trim();
    const selectedTheatreName = newTheatreName === "Other"
      ? newCustomTheatreName.trim()
      : newTheatreName.trim();
    const trimmedReviewerName = newReviewerName.trim();
    const trimmedTitle = newTitle.trim();
    const trimmedKeyQuote = newKeyQuote.trim();
    const trimmedSummary = newSummary.trim();
    const trimmedContent = newContent.trim();
    const trimmedSeatContext = newSeatContext.trim();
    const trimmedWhatWorked = newWhatWorked.trim();
    const trimmedWhatCouldImprove = newWhatCouldImprove.trim();

    if (!trimmedPlayTitle || !selectedTheatreName || !trimmedReviewerName || !trimmedTitle || !trimmedSummary || !trimmedContent) return;

    setSubmitError("");
    setIsSubmittingReview(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playTitle: trimmedPlayTitle,
          theatreName: selectedTheatreName,
          performanceDate: newPerformanceDate,
          viewingContext: trimmedSeatContext,
          reviewerName: trimmedReviewerName,
          reviewerRole: newReviewerRole,
          scores: newScores,
          title: trimmedTitle,
          keyQuote: trimmedKeyQuote,
          summary: trimmedSummary,
          critique: trimmedContent,
          whatWorked: trimmedWhatWorked,
          whatCouldImprove: trimmedWhatCouldImprove,
          recommendation: newRecommendation,
        }),
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setSubmitError(result?.error || "Unable to submit review right now.");
        return;
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(false);
        setNewPlayTitle("");
        setNewTheatreName("Mandala Theatre Nepal");
        setNewCustomTheatreName("");
        setNewPerformanceDate("");
        setNewSeatContext("");
        setNewReviewerName("");
        setNewReviewerRole("Audience Member");
        setNewScores({ ...DEFAULT_SUBMIT_SCORES });
        setNewRecommendation("Strongly recommend");
        setNewTitle("");
        setNewKeyQuote("");
        setNewSummary("");
        setNewContent("");
        setNewWhatWorked("");
        setNewWhatCouldImprove("");
      }, 1800);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
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
                <div className="spotlight-venue">
                  <img src={getTheatreLogo(spotlightReview.theatreName)} alt="" aria-hidden="true" />
                  {spotlightReview.theatreName}
                </div>
                <h3 className="spotlight-review-headline">&ldquo;{spotlightReview.title}&rdquo;</h3>
                <p className="spotlight-mini-note">{spotlightReview.excerpt}</p>

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

                  <Link
                    href={`/reviews/${spotlightReview.playSlug}/`}
                    className="read-full-btn"
                    aria-label={`Read full review for ${spotlightReview.playTitle}`}
                  >
                    Read Full Review →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 3. REVIEW LIBRARY: FILTERS + GRID ── */}
        <section className="reviews-library-layout" aria-label="Review library">
          <aside className="reviews-controls-bar" aria-label="Review filters">
            <div className="section-heading-row reviews-library-toolbar">
              <div>
                <span className="section-kicker">The review library</span>
                <h2>Explore every critique</h2>
              </div>
              <span className="results-count">Showing {filteredReviews.length} of {reviewsList.length}</span>
            </div>
            <div className="reviews-library-filter-bar">
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
                    placeholder="Search by play, critic or theatre..."
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
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setSortBy(e.target.value as "highest" | "latest" | "popular")
                    }
                    className="reviews-sort-select"
                  >
                    <option value="highest">⭐ Highest Rated</option>
                    <option value="latest">📅 Latest Reviews</option>
                    <option value="popular">🔥 Performance Score</option>
                  </select>
                  <button
                    type="button"
                    className="about-btn about-btn-primary reviews-write-btn"
                    onClick={() => {
                      setSubmitError("");
                      setShowSubmitModal(true);
                    }}
                  >
                    ✍️ Write Review
                  </button>
                </div>
              </div>

              <span className="reviews-filter-label">Browse by</span>
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
            </div>
          </aside>

          <div className="reviews-library-results">
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
                          <span className="review-card-venue">
                            <img src={getTheatreLogo(rev.theatreName)} alt="" aria-hidden="true" />
                            {rev.theatreName}
                          </span>
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

                          <Link
                            href={`/reviews/${rev.playSlug}/`}
                            className="review-read-btn"
                          >
                            Read Critique →
                          </Link>
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
          </div>
        </section>

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
            onClick={() => {
              setSubmitError("");
              setShowSubmitModal(true);
            }}
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
              aria-label="Close submit review form"
            >
              ✕
            </button>

            <div className="submit-modal-header">
              <span className="submit-modal-kicker">Audience review desk</span>
              <h2 id="submit-modal-title">Submit a Review</h2>
              <p>Share the production context, scorecard, and critique for Nepal theatre productions.</p>
              <div className="submit-meta-strip" aria-label="Review form sections">
                <span>Production</span>
                <span>Scorecard</span>
                <span>Critique</span>
              </div>
            </div>

            {submitSuccess ? (
              <div className="submit-success-state">
                <div className="success-icon">🎉</div>
                <h3>Review Submitted!</h3>
                <p>Your critique is waiting for admin approval.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="review-submit-form">
                <fieldset className="review-form-section">
                  <legend>Production Details</legend>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="play-title-input">Play Title *</label>
                      <input
                        id="play-title-input"
                        type="text"
                        required
                        placeholder="e.g. Degree Kaila, Sirumarani, Hamlet"
                        value={newPlayTitle}
                        onChange={(e) => setNewPlayTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="theatre-name-input">Theatre Venue *</label>
                      <select
                        id="theatre-name-input"
                        required
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
                        <option value="Other">Other Theatre</option>
                      </select>
                    </div>
                  </div>

                  {newTheatreName === "Other" && (
                    <div className="form-group">
                      <label htmlFor="custom-theatre-name-input">Theatre Name *</label>
                      <input
                        id="custom-theatre-name-input"
                        type="text"
                        required
                        placeholder="Enter the theatre or venue name"
                        value={newCustomTheatreName}
                        onChange={(e) => setNewCustomTheatreName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="performance-date-input">Performance Date</label>
                      <input
                        id="performance-date-input"
                        type="date"
                        value={newPerformanceDate}
                        onChange={(e) => setNewPerformanceDate(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="seat-context-input">Seat / Viewing Context</label>
                      <input
                        id="seat-context-input"
                        type="text"
                        placeholder="e.g. Balcony left, opening night, matinee"
                        value={newSeatContext}
                        onChange={(e) => setNewSeatContext(e.target.value)}
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="review-form-section">
                  <legend>Reviewer Details</legend>

                  <div className="form-row-2">
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

                    <div className="form-group">
                      <label htmlFor="reviewer-role-input">Reviewer Perspective</label>
                      <select
                        id="reviewer-role-input"
                        value={newReviewerRole}
                        onChange={(e) => setNewReviewerRole(e.target.value)}
                      >
                        <option value="Audience Member">Audience Member</option>
                        <option value="Theatre Student">Theatre Student</option>
                        <option value="Drama Practitioner">Drama Practitioner</option>
                        <option value="Cultural Writer">Cultural Writer</option>
                        <option value="Stage Critic">Stage Critic</option>
                      </select>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="review-form-section">
                  <legend>Score Breakdown</legend>

                  <div className="score-summary-row">
                    <span>Overall Rating</span>
                    <strong>{newOverallRating.toFixed(1)} / 5.0</strong>
                  </div>

                  <div className="score-breakdown-grid">
                    {SCORE_INPUTS.map((scoreInput) => (
                      <div className="score-slider-row" key={scoreInput.key}>
                        <label htmlFor={`score-${scoreInput.key}`}>
                          <span>
                            <strong>{scoreInput.label}</strong>
                            <small>{scoreInput.note}</small>
                          </span>
                          <b>{newScores[scoreInput.key].toFixed(1)}</b>
                        </label>
                        <input
                          id={`score-${scoreInput.key}`}
                          className="score-range-input"
                          type="range"
                          min="1"
                          max="5"
                          step="0.1"
                          value={newScores[scoreInput.key]}
                          onChange={(e) =>
                            setNewScores((prev) => ({
                              ...prev,
                              [scoreInput.key]: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="review-form-section">
                  <legend>Written Critique</legend>

                  <div className="form-group">
                    <label htmlFor="review-title-input">Review Headline *</label>
                    <input
                      id="review-title-input"
                      type="text"
                      required
                      placeholder="e.g. A tightly paced performance with a memorable ensemble"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-key-quote-input">One-Line Verdict</label>
                    <input
                      id="review-key-quote-input"
                      type="text"
                      placeholder="A short quote readers can remember"
                      value={newKeyQuote}
                      onChange={(e) => setNewKeyQuote(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-summary-input">Short Summary *</label>
                    <textarea
                      id="review-summary-input"
                      required
                      rows={3}
                      placeholder="Summarize the performance, tone, and audience impact."
                      value={newSummary}
                      onChange={(e) => setNewSummary(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-content-input">Detailed Critique *</label>
                    <textarea
                      id="review-content-input"
                      required
                      rows={7}
                      className="textarea-tall"
                      placeholder="Discuss acting, direction, staging, rhythm, sound, script, and emotional impact."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="review-worked-input">What Worked Best</label>
                      <textarea
                        id="review-worked-input"
                        rows={3}
                        placeholder="Mention a scene, actor, design choice, or directorial detail."
                        value={newWhatWorked}
                        onChange={(e) => setNewWhatWorked(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="review-improve-input">Could Be Stronger</label>
                      <textarea
                        id="review-improve-input"
                        rows={3}
                        placeholder="Add constructive notes about pacing, clarity, staging, or script."
                        value={newWhatCouldImprove}
                        onChange={(e) => setNewWhatCouldImprove(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Recommendation</label>
                    <div className="recommendation-options" role="radiogroup" aria-label="Recommendation">
                      {RECOMMENDATION_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="radio"
                          aria-checked={newRecommendation === option}
                          className={`recommend-chip ${newRecommendation === option ? "is-selected" : ""}`}
                          onClick={() => setNewRecommendation(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </fieldset>

                {submitError && (
                  <p className="review-submit-error" role="alert">
                    {submitError}
                  </p>
                )}

                <div className="form-actions">
                  <button type="submit" className="about-btn about-btn-primary" disabled={isSubmittingReview}>
                    {isSubmittingReview ? "Submitting..." : "Send for Approval"}
                  </button>
                  <button
                    type="button"
                    className="about-btn about-btn-ghost"
                    onClick={() => setShowSubmitModal(false)}
                    disabled={isSubmittingReview}
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
