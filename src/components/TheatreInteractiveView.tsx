"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";

export type TheatreCardData = {
  id: number;
  title: string;
  slug: string;
  address: string | null;
  coverImage: string | null;
  profilePic: string | null;
  phone: string | null;
  email: string | null;
  linkWebsite: string | null;
  linkFacebook: string | null;
  linkInstagram: string | null;
  establishedYear: number | null;
  description: string;
  playsCount: number;
  showsCount: number;
  nextShow?: {
    playTitle: string;
    playSlug: string;
    showtimeFormatted: string;
    dateFormatted: string;
  } | null;
};

export function TheatreInteractiveView({
  theatres,
}: {
  theatres: TheatreCardData[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCity, setActiveCity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"plays" | "name" | "year">("plays");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const PAGE_SIZE = 9;
  const gridRef = useRef<HTMLDivElement>(null);

  // Derive city and region from address
  const getCity = (address: string | null) => {
    if (!address) return "Kathmandu";
    const low = address.toLowerCase();
    if (low.includes("pokhara")) return "Pokhara";
    if (low.includes("biratnagar")) return "Biratnagar";
    if (low.includes("dharan")) return "Dharan";
    if (low.includes("itahari")) return "Itahari";
    if (low.includes("jhapa") || low.includes("damak")) return "Jhapa";
    if (low.includes("ilam") || low.includes("chulachuli")) return "Ilam";
    if (low.includes("morang") || low.includes("belbari") || low.includes("jhorahat")) return "Morang";
    if (low.includes("lalitpur") || low.includes("patan")) return "Lalitpur";
    if (low.includes("bhaktapur")) return "Bhaktapur";
    if (low.includes("kirtipur")) return "Kirtipur";
    return "Kathmandu";
  };

  const getRegion = (address: string | null) => {
    if (!address) return "kathmandu-valley";
    const low = address.toLowerCase();
    if (low.includes("pokhara") || low.includes("gandaki")) return "pokhara";
    if (
      low.includes("biratnagar") ||
      low.includes("dharan") ||
      low.includes("itahari") ||
      low.includes("jhapa") ||
      low.includes("damak") ||
      low.includes("ilam") ||
      low.includes("chulachuli") ||
      low.includes("morang") ||
      low.includes("belbari") ||
      low.includes("jhorahat") ||
      low.includes("sunsari") ||
      low.includes("koshi")
    ) {
      return "eastern-nepal";
    }
    return "kathmandu-valley";
  };

  const regionCounts = useMemo(() => {
    const counts = { all: theatres.length, ktm: 0, pokhara: 0, eastern: 0 };
    for (const t of theatres) {
      const reg = getRegion(t.address);
      if (reg === "kathmandu-valley") counts.ktm++;
      else if (reg === "pokhara") counts.pokhara++;
      else if (reg === "eastern-nepal") counts.eastern++;
    }
    return counts;
  }, [theatres]);

  const filteredTheatres = useMemo(() => {
    return theatres
      .filter((t) => {
        const region = getRegion(t.address);
        const matchesCity =
          activeCity === "all" ||
          (activeCity === "kathmandu-valley" && region === "kathmandu-valley") ||
          (activeCity === "pokhara" && region === "pokhara") ||
          (activeCity === "eastern-nepal" && region === "eastern-nepal");

        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          t.title.toLowerCase().includes(q) ||
          (t.address && t.address.toLowerCase().includes(q)) ||
          t.description.toLowerCase().includes(q);

        return matchesCity && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === "plays") return b.playsCount - a.playsCount;
        if (sortBy === "year") return (a.establishedYear || 9999) - (b.establishedYear || 9999);
        return a.title.localeCompare(b.title);
      });
  }, [theatres, activeCity, searchQuery, sortBy]);


  // Featured venue (top play count)
  const spotlightVenue = useMemo(() => {
    return theatres.reduce((prev, curr) => (curr.playsCount > prev.playsCount ? curr : prev), theatres[0]);
  }, [theatres]);

  // Exclude spotlight venue from the cards grid when spotlight banner is active
  const allDisplayTheatres = useMemo(() => {
    if (spotlightVenue && !searchQuery && activeCity === "all") {
      return filteredTheatres.filter((t) => t.id !== spotlightVenue.id);
    }
    return filteredTheatres;
  }, [filteredTheatres, spotlightVenue, searchQuery, activeCity]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(allDisplayTheatres.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayTheatres = allDisplayTheatres.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = useCallback((p: number) => {
    const next = Math.max(1, Math.min(p, totalPages));
    if (next === currentPage) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(next);
      setIsAnimating(false);
    }, 220);
  }, [currentPage, totalPages]);

  return (
    <div className="theatre-directory-root">
      {/* ── Spotlight Venue Banner ── */}
      {spotlightVenue && !searchQuery && activeCity === "all" && (
        <section className="theatre-spotlight-banner">
          <div className="theatre-spotlight-inner">
            <div className="theatre-spotlight-img-wrap">
              <img
                src={spotlightVenue.coverImage || ""}
                alt={spotlightVenue.title}
                className="theatre-spotlight-img"
              />
              <div className="theatre-spotlight-overlay" />
            </div>
            <div className="theatre-spotlight-content">
              <div className="theatre-spotlight-head">
                <div className="theatre-spotlight-badge">
                  <span>⭐ Premier Stage Hub</span>
                  {spotlightVenue.establishedYear && (
                    <span>Est. {spotlightVenue.establishedYear}</span>
                  )}
                </div>
                <h2 className="theatre-spotlight-title">{spotlightVenue.title}</h2>
                {spotlightVenue.address && (
                  <p className="theatre-spotlight-loc">📍 {spotlightVenue.address.replace(/\r?\n/g, ", ")}</p>
                )}
              </div>
              <p className="theatre-spotlight-desc">{spotlightVenue.description}</p>

              
              <div className="theatre-spotlight-metrics">
                <div className="theatre-metric-item">
                  <strong>{spotlightVenue.playsCount}</strong>
                  <span>Plays Staged</span>
                </div>
                <div className="theatre-metric-item">
                  <strong>{spotlightVenue.showsCount}+</strong>
                  <span>Recorded Shows</span>
                </div>
                <div className="theatre-metric-item">
                  <strong>Active</strong>
                  <span>Stage Season</span>
                </div>
              </div>

              <div className="theatre-spotlight-actions">
                <Link href={`/theatre/${spotlightVenue.slug}/`} className="button">
                  Explore Stage &amp; Schedule →
                </Link>
                {spotlightVenue.linkWebsite && (
                  <a
                    href={spotlightVenue.linkWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="theatre-link-btn"
                  >
                    🌐 Official Website
                  </a>
                )}
                {spotlightVenue.phone && (
                  <a href={`tel:${spotlightVenue.phone}`} className="theatre-link-btn">
                    📞 {spotlightVenue.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Search & Filter Controls ── */}
      <section className="theatre-controls-bar">
        {/* City Filter Pills (Left side) */}
        <div className="theatre-city-tabs" role="tablist">
          <button
            type="button"
            className={`theatre-city-chip ${activeCity === "all" ? "is-active" : ""}`}
            onClick={() => { setActiveCity("all"); setCurrentPage(1); }}
          >
            All Venues ({regionCounts.all})
          </button>
          <button
            type="button"
            className={`theatre-city-chip ${activeCity === "kathmandu-valley" ? "is-active" : ""}`}
            onClick={() => { setActiveCity("kathmandu-valley"); setCurrentPage(1); }}
          >
            📍 KTM ({regionCounts.ktm})
          </button>
          <button
            type="button"
            className={`theatre-city-chip ${activeCity === "pokhara" ? "is-active" : ""}`}
            onClick={() => { setActiveCity("pokhara"); setCurrentPage(1); }}
          >
            🏔️ Pokhara ({regionCounts.pokhara})
          </button>
          <button
            type="button"
            className={`theatre-city-chip ${activeCity === "eastern-nepal" ? "is-active" : ""}`}
            onClick={() => { setActiveCity("eastern-nepal"); setCurrentPage(1); }}
          >
            🌾 Eastern Nepal ({regionCounts.eastern})
          </button>
        </div>

        {/* Sort selector */}
        <div className="theatre-sort-wrap">
          <label htmlFor="theatre-sort-select">Sort by:</label>
          <select
            id="theatre-sort-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as "plays" | "name" | "year"); setCurrentPage(1); }}
            className="theatre-sort-select"
          >
            <option value="plays">Most Plays Staged</option>
            <option value="name">Alphabetical (A-Z)</option>
            <option value="year">Oldest Established</option>
          </select>
        </div>

        {/* Search Box (Far Right side) */}
        <div className="theatre-search-box">
          <svg className="theatre-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search theatres..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="theatre-input-search"
          />
          {searchQuery && (
            <button
              type="button"
              className="theatre-clear-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* ── Venues Grid ── */}
      {displayTheatres.length > 0 ? (
        <div
          ref={gridRef}
          className="theatre-cards-grid"
          style={{
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating ? "translateY(12px)" : "translateY(0)",
            transition: "opacity 0.22s ease, transform 0.22s ease",
          }}
        >
          {displayTheatres.map((theatre) => {
            // Resolve logo URL from profilePic field
            const logoSrc = theatre.profilePic
              ? (theatre.profilePic.startsWith("http") ? theatre.profilePic : `/uploads/${theatre.profilePic.replace(/^\/?(?:uploads\/)?/, "")}`)
              : "/brand-logo.png";

            return (
            <article className="theatre-rich-card" key={theatre.id}>
              {/* Card Image Banner with Logo Badge */}
              <div className="theatre-rich-img-wrap">
                <img
                  src={theatre.coverImage || ""}
                  alt={theatre.title}
                  className="theatre-rich-cover"
                  loading="lazy"
                />
                <div className="theatre-rich-overlay" />

                {/* Theatre Logo Avatar - bottom left */}
                <div className="theatre-rich-avatar">
                  <img
                    src={logoSrc}
                    alt={`${theatre.title} logo`}
                    onError={(e) => { (e.target as HTMLImageElement).src = "/brand-logo.png"; }}
                  />
                </div>

                {/* Top Badges */}
                <div className="theatre-rich-top-badges">
                  {theatre.nextShow ? (
                    <span className="theatre-tag-live">● Live Shows</span>
                  ) : (
                    <span className="theatre-tag-venue">Stage Venue</span>
                  )}
                  {theatre.establishedYear && (
                    <span className="theatre-tag-year">Est. {theatre.establishedYear}</span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="theatre-rich-body">
                <div className="theatre-rich-header">
                  <span className="theatre-rich-city">📍 {getCity(theatre.address)}</span>
                  <div className="theatre-rich-counts">
                    <span title="Plays staged">🎭 {theatre.playsCount} Plays</span>
                    {theatre.showsCount > 0 && (
                      <span title="Lifetime shows">🎟️ {theatre.showsCount} Shows</span>
                    )}
                  </div>
                </div>

                <h3 className="theatre-rich-title">
                  <Link href={`/theatre/${theatre.slug}/`}>{theatre.title}</Link>
                </h3>

                {theatre.address && (
                  <p className="theatre-rich-address">{theatre.address.replace(/\r?\n/g, ", ")}</p>
                )}

                <p className="theatre-rich-desc">{theatre.description}</p>

                {/* Next show highlight if active */}
                {theatre.nextShow && (
                  <div className="theatre-next-show-pill">
                    <span className="theatre-next-tag">Next Performance</span>
                    <Link href={`/play/${theatre.nextShow.playSlug}/`} className="theatre-next-play-title">
                      {theatre.nextShow.playTitle}
                    </Link>
                    <span className="theatre-next-time-text">
                      {theatre.nextShow.dateFormatted} · {theatre.nextShow.showtimeFormatted}
                    </span>
                  </div>
                )}

                {/* Contact & Social Links */}
                <div className="theatre-rich-links">
                  {theatre.linkWebsite && (
                    <a
                      href={theatre.linkWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theatre-icon-link"
                      title="Visit Website"
                    >
                      🌐 Website
                    </a>
                  )}
                  {theatre.phone && (
                    <a
                      href={`tel:${theatre.phone}`}
                      className="theatre-icon-link"
                      title={`Call ${theatre.phone}`}
                    >
                      📞 Call
                    </a>
                  )}
                  {theatre.linkFacebook && (
                    <a
                      href={theatre.linkFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theatre-icon-link"
                      title="Facebook Page"
                    >
                      📘 Facebook
                    </a>
                  )}
                  {theatre.linkInstagram && (
                    <a
                      href={theatre.linkInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theatre-icon-link"
                      title="Instagram Page"
                    >
                      📷 Instagram
                    </a>
                  )}
                </div>

                {/* Footer Action */}
                <div className="theatre-rich-foot">
                  <Link href={`/theatre/${theatre.slug}/`} className="theatre-view-btn">
                    View Theatre Schedule &amp; Details <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      ) : (
        <div className="theatre-empty-state">
          <div className="theatre-empty-icon">🏛️</div>
          <h3>No theatre spaces found</h3>
          <p>Try searching for a different name or clear your city filter.</p>
          <button
            type="button"
            className="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCity("all");
              setCurrentPage(1);
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="theatre-pagination">
          <button
            className="theatre-page-btn"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
          >
            ← Prev
          </button>

          <div className="theatre-page-numbers">
            {(() => {
              let start = Math.max(1, safePage - 1);
              if (start + 2 > totalPages) {
                start = Math.max(1, totalPages - 2);
              }
              const visiblePages = Array.from(
                { length: Math.min(3, totalPages) },
                (_, i) => start + i
              );
              return visiblePages.map((p) => (
                <button
                  key={p}
                  className={`theatre-page-num ${p === safePage ? "is-active" : ""}`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ));
            })()}
          </div>

          <button
            className="theatre-page-btn"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
