import { currentUser, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  approveReviewSubmission,
  deleteReviewSubmission,
  getReviewModerationStats,
  listReviewSubmissionsForAdmin,
} from "@/lib/reviews";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getPlayPhoto } from "@/lib/content";

const SECTION_META: Record<
  string,
  { title: string; subtitle: string; description: string; icon: React.ReactNode }
> = {
  plays: {
    title: "Play Productions",
    subtitle: "Stage Archive & Catalog",
    description: "Database of registered theatre plays, cast credits, status, ratings and production posters",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="m10 9 5 3-5 3V9Z" />
      </svg>
    ),
  },
  profiles: {
    title: "Artist Profiles",
    subtitle: "Performers & Stage Makers",
    description: "Directory of verified actors, directors, writers, crew members, and theatre artists",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  schedules: {
    title: "Show Schedules",
    subtitle: "Performance Calendars & Tickets",
    description: "Active stage performance dates, daily showtimes, venue assignments and booking links",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </svg>
    ),
  },
  posts: {
    title: "Editorial Articles",
    subtitle: "News & Reviews",
    description: "Theatre journalism, reviews, festival coverage, spotlight interviews and feature stories",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </svg>
    ),
  },
  reviews: {
    title: "Review Moderation",
    subtitle: "Audience Reviews",
    description: "Approve or delete audience-submitted stage reviews before they appear publicly",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
      </svg>
    ),
  },
  entries: {
    title: "Form Inbox",
    subtitle: "Submissions & Inquiries",
    description: "Visitor feedback messages, booking inquiries and venue listing contact entries",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4zM4 14h4l2 3h4l2-3h4" />
      </svg>
    ),
  },
};

function reviewIdFromForm(formData: FormData) {
  const id = Number(formData.get("reviewId"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function approveReviewAction(formData: FormData) {
  "use server";

  await requireStaff();
  const id = reviewIdFromForm(formData);
  if (!id) return;

  await approveReviewSubmission(id);
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/reviews/[slug]", "page");
}

async function deleteReviewAction(formData: FormData) {
  "use server";

  await requireStaff();
  const id = reviewIdFromForm(formData);
  if (!id) return;

  await deleteReviewSubmission(id);
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/reviews/[slug]", "page");
}

function formatAdminDate(value: Date | null) {
  if (!value) return "Not provided";
  return value.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function Section({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const user = await currentUser();
  if (!user || (!user.isStaff && !user.isSuperuser)) redirect("/login");
  if (!user.isPasswordChanged) redirect("/set-new-password");

  const { section } = await params;
  if (section === "theatres") redirect("/admin/theatres");

  const meta = SECTION_META[section];
  if (!meta) notFound();

  // Counts for sidebar nav
  const [totalTheatres, totalPlays, totalProfiles, totalSchedules, totalPosts, totalEntries, reviewStats] = await Promise.all([
    prisma.theatre.count(),
    prisma.play.count(),
    prisma.profile.count(),
    prisma.showsMeta.count(),
    prisma.blogPost.count(),
    prisma.formEntry.count(),
    getReviewModerationStats(),
  ]);

  return (
    <main className="adm-inner-shell">
      {/* Sidebar */}
      <aside className="adm-inner-dock">
        <div className="adm-inner-brand">
          <Link href="/" className="adm-inner-brand-link">
            <img src="/brand-logo-light.png" alt="TheaterHub" className="adm-inner-brand-img" />
            <div>
              <strong>TheaterHub</strong>
              <small>STUDIO CONSOLE</small>
            </div>
          </Link>
        </div>

        <nav className="adm-inner-nav">
          <div className="adm-inner-nav-group">
            <span className="adm-inner-nav-label">WORKSPACE</span>
            <Link href="/admin" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <span>Overview</span>
            </Link>
            <Link href="/admin/theatres" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>
              <span>Theatres</span>
              <span className="adm-inner-nav-pill">{totalTheatres}</span>
            </Link>
            <Link href="/admin/plays" className={`adm-inner-nav-item${section === "plays" ? " is-active" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></svg>
              <span>Productions</span>
              <span className="adm-inner-nav-pill">{totalPlays}</span>
            </Link>
            <Link href="/admin/schedules" className={`adm-inner-nav-item${section === "schedules" ? " is-active" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>
              <span>Schedules</span>
              <span className="adm-inner-nav-pill">{totalSchedules}</span>
            </Link>
            <Link href="/admin/profiles" className={`adm-inner-nav-item${section === "profiles" ? " is-active" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 1 0 7.75"/></svg>
              <span>Artists</span>
              <span className="adm-inner-nav-pill">{totalProfiles}</span>
            </Link>
            <Link href="/admin/posts" className={`adm-inner-nav-item${section === "posts" ? " is-active" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>
              <span>Editorial</span>
              <span className="adm-inner-nav-pill">{totalPosts}</span>
            </Link>
            <Link href="/admin/reviews" className={`adm-inner-nav-item${section === "reviews" ? " is-active" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>
              <span>Reviews</span>
              <span className={`adm-inner-nav-pill${reviewStats.pending > 0 ? " is-alert" : ""}`}>
                {reviewStats.pending > 0 ? reviewStats.pending : reviewStats.total}
              </span>
            </Link>
          </div>

          <div className="adm-inner-nav-group">
            <span className="adm-inner-nav-label">TOOLS</span>
            <Link href="/admin/create-user" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Create User</span>
            </Link>
            <Link href="/admin/entries" className={`adm-inner-nav-item${section === "entries" ? " is-active" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4zM4 14h4l2 3h4l2-3h4"/></svg>
              <span>Form Inbox</span>
              <span className="adm-inner-nav-pill">{totalEntries}</span>
            </Link>
          </div>
        </nav>

        <div className="adm-inner-dock-foot">
          <span className="adm-inner-user-dot">{user.username.slice(0, 1).toUpperCase()}</span>
          <div className="adm-inner-user-info">
            <strong>{user.firstName || user.username}</strong>
            <small>{user.isSuperuser ? "Superadmin" : "Staff"}</small>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="adm-inner-main">
        <header className="adm-inner-topbar">
          <div className="adm-inner-breadcrumb">
            <Link href="/admin" className="adm-inner-bc-link">Console</Link>
            <span className="adm-inner-bc-sep">/</span>
            <strong>{meta.title}</strong>
          </div>
          <div className="adm-inner-topbar-right">
            <ThemeToggle showLabel={false} />
            <Link href="/admin" className="adm-control-btn">
              ← Overview
            </Link>
          </div>
        </header>

        <div className="adm-inner-content">
          {/* Page Header Banner */}
          <div className="adm-inner-page-header">
            <div className="adm-inner-page-icon">{meta.icon}</div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--adm-amber)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{meta.subtitle}</span>
              <h1>{meta.title}</h1>
              <p>{meta.description}</p>
            </div>
          </div>

          {/* Render specific detailed layout per section */}
          {section === "plays" && <PlaysSection />}
          {section === "profiles" && <ProfilesSection />}
          {section === "schedules" && <SchedulesSection />}
          {section === "posts" && <PostsSection />}
          {section === "reviews" && <ReviewsSection />}
          {section === "entries" && <EntriesSection />}
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════
   1. PLAYS / PRODUCTIONS DETAILED SECTION
   ══════════════════════════════════════════════════════════ */
async function PlaysSection() {
  const plays = await prisma.play.findMany({
    include: { theatre: { select: { title: true } } },
    orderBy: [{ launchedOn: "desc" }, { title: "asc" }],
  });

  return (
    <div>
      {/* Quick Stats Strip */}
      <div className="adm-inner-stats">
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{plays.length}</span>
          <span className="adm-inner-stat-lbl">Total Plays</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-emerald)" }}>
            {plays.filter((p) => p.status?.toLowerCase() === "running" || p.status?.toLowerCase() === "published").length}
          </span>
          <span className="adm-inner-stat-lbl">Active Stage</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-amber)" }}>
            ★ {(plays.reduce((acc, p) => acc + (p.ratingAverage || 0), 0) / (plays.length || 1)).toFixed(1)}
          </span>
          <span className="adm-inner-stat-lbl">Avg Rating</span>
        </div>
      </div>

      <div className="adm-production-grid">
        {plays.map((play) => {
          const poster = getPlayPhoto(play);

          return (
          <article className="adm-production-card" key={play.id}>
            <div className="adm-production-poster">
              {poster ? (
                <img src={poster} alt={`${play.title} poster`} loading="lazy" />
              ) : (
                <span>PRODUCTION</span>
              )}
              <span className={`adm-production-status ${play.status === "PUBLISHED" ? "is-published" : "is-draft"}`}>
                {play.status || "PUBLISHED"}
              </span>
            </div>
            <div className="adm-production-body">
              <div className="adm-production-kicker">PRODUCTION #{play.id}</div>
              <h2>{play.title}</h2>
              <p className="adm-production-venue">{play.theatre ? play.theatre.title : "Standalone production"}</p>
              <div className="adm-production-facts">
                <span><small>Launched</small><strong>{play.launchedOn ? play.launchedOn.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Not provided"}</strong></span>
                <span><small>Rating</small><strong className={play.ratingAverage ? "is-rated" : ""}>{play.ratingAverage ? `★ ${play.ratingAverage.toFixed(1)}` : "No ratings"}</strong></span>
              </div>
              <div className="adm-production-footer">
                <span>{play.slug ? "Public page ready" : "No public slug"}</span>
                {play.slug ? (
                  <Link href={`/play/${play.slug}/`} target="_blank" rel="noopener noreferrer">View production <span aria-hidden="true">→</span></Link>
                ) : (
                  <span className="adm-inner-cell-muted">Unavailable</span>
                )}
              </div>
            </div>
          </article>
          );
        })}
      </div>
      {!plays.length && (
        <div className="adm-inner-empty adm-production-empty">
          <p>No play productions registered in database.</p>
        </div>
      )}

      {/* Plays Table */}
      <div className="adm-inner-table-card adm-productions-table-card">
        <div className="adm-inner-table-head-row">
          <span className="adm-inner-table-title">{plays.length} Production Records in Archive</span>
        </div>
        <div className="adm-inner-table-wrap">
          <table className="adm-inner-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>ID</th>
                <th>Production Title & Venue</th>
                <th>Status</th>
                <th>Launch Date</th>
                <th>Rating</th>
                <th style={{ textAlign: "right" }}>Public Link</th>
              </tr>
            </thead>
            <tbody>
              {plays.map((play) => (
                <tr key={play.id}>
                  <td>
                    <span className="adm-inner-id-badge">#{play.id}</span>
                  </td>
                  <td>
                    <div className="adm-inner-cell-primary">
                      {play.coverImage ? (
                        <img src={play.coverImage} alt="" style={{ width: "36px", height: "48px", objectFit: "cover", borderRadius: "6px" }} />
                      ) : (
                        <div className="adm-inner-record-avatar" style={{ width: "36px", height: "48px", borderRadius: "6px", background: "var(--adm-crimson-bg)", color: "var(--adm-crimson)" }}>
                          🎭
                        </div>
                      )}
                      <div>
                        <strong className="adm-inner-link-strong">{play.title}</strong>
                        <small className="adm-inner-cell-sub">{play.theatre ? `at ${play.theatre.title}` : "Standalone Production"}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="adm-inner-count-badge"
                      style={{
                        background: play.status === "PUBLISHED" ? "var(--adm-emerald-bg)" : "var(--adm-surface-subtle)",
                        color: play.status === "PUBLISHED" ? "var(--adm-emerald)" : "var(--adm-muted)",
                      }}
                    >
                      {play.status || "PUBLISHED"}
                    </span>
                  </td>
                  <td className="adm-inner-cell-muted">
                    {play.launchedOn ? play.launchedOn.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: play.ratingAverage ? "var(--adm-amber)" : "var(--adm-muted)" }}>
                      ★ {play.ratingAverage ? play.ratingAverage.toFixed(1) : "0.0"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {play.slug ? (
                      <Link href={`/play/${play.slug}/`} target="_blank" rel="noopener noreferrer" className="adm-inner-row-action">
                        View Play ↗
                      </Link>
                    ) : (
                      <span className="adm-inner-cell-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!plays.length && (
            <div className="adm-inner-empty">
              <p>No play productions registered in database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   2. ARTIST PROFILES DETAILED SECTION
   ══════════════════════════════════════════════════════════ */
async function ProfilesSection() {
  const profiles = await prisma.profile.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      {/* Quick Stats Strip */}
      <div className="adm-inner-stats">
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{profiles.length}</span>
          <span className="adm-inner-stat-lbl">Total Artist Profiles</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-violet)" }}>
            {profiles.filter((p) => p.bio).length}
          </span>
          <span className="adm-inner-stat-lbl">With Biography</span>
        </div>
      </div>

      {/* Profiles Cards Grid */}
      <div className="adm-subsystems-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {profiles.map((artist) => (
          <div key={artist.id} className="adm-app-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
              {artist.profilePic ? (
                <img src={artist.profilePic} alt="" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, var(--adm-violet) 0%, #6d28d9 100%)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "18px" }}>
                  {artist.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "var(--adm-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {artist.name}
                </h3>
                <small style={{ color: "var(--adm-muted)", fontSize: "11.5px" }}>Artist ID #{artist.id}</small>
              </div>
            </div>

            <p style={{ margin: "0 0 16px", fontSize: "12.5px", color: "var(--adm-muted)", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {artist.bio || "No public biography provided yet for this theatre artist."}
            </p>

            <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--adm-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--adm-subtle-text)" }}>/{artist.slug || artist.id}</span>
              {artist.slug ? (
                <Link href={`/profile/${artist.slug}/`} target="_blank" rel="noopener noreferrer" className="adm-inner-row-action">
                  View Profile ↗
                </Link>
              ) : (
                <span className="adm-inner-cell-muted">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!profiles.length && (
        <div className="adm-inner-table-card">
          <div className="adm-inner-empty">
            <p>No artist profiles registered yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3. SHOW SCHEDULES DETAILED SECTION
   ══════════════════════════════════════════════════════════ */
async function SchedulesSection() {
  const schedules = await prisma.showsMeta.findMany({
    include: { play: true, theatre: true, excludeDates: true, extraShows: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div>
      {/* Quick Stats Strip */}
      <div className="adm-inner-stats">
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{schedules.length}</span>
          <span className="adm-inner-stat-lbl">Total Show Schedules</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-blue)" }}>
            {schedules.filter((s) => new Date(s.endDate) >= new Date()).length}
          </span>
          <span className="adm-inner-stat-lbl">Active & Upcoming</span>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="adm-inner-table-card">
        <div className="adm-inner-table-head-row">
          <span className="adm-inner-table-title">{schedules.length} Active & Past Schedules</span>
        </div>
        <div className="adm-inner-table-wrap">
          <table className="adm-inner-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>ID</th>
                <th>Production Play</th>
                <th>Theatre Venue</th>
                <th>Schedule Date Range</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((sch) => {
                const isActive = new Date(sch.endDate) >= new Date();
                return (
                  <tr key={sch.id}>
                    <td>
                      <span className="adm-inner-id-badge">#{sch.id}</span>
                    </td>
                    <td>
                      {sch.play.slug ? (
                        <Link href={`/play/${sch.play.slug}/`} target="_blank" rel="noopener noreferrer" className="adm-inner-link-strong">
                          {sch.play.title} ↗
                        </Link>
                      ) : (
                        <strong className="adm-inner-link-strong">{sch.play.title}</strong>
                      )}
                    </td>
                    <td>
                      <span className="adm-inner-cell-muted">{sch.theatre.title}</span>
                    </td>
                    <td className="adm-inner-cell-muted">
                      {sch.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {sch.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        className="adm-inner-count-badge"
                        style={{
                          background: isActive ? "var(--adm-blue-bg)" : "var(--adm-surface-subtle)",
                          color: isActive ? "var(--adm-blue)" : "var(--adm-muted)",
                        }}
                      >
                        {isActive ? "Active Schedule" : "Ended"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!schedules.length && (
            <div className="adm-inner-empty">
              <p>No show performance schedules created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   4. EDITORIAL POSTS DETAILED SECTION
   ══════════════════════════════════════════════════════════ */
async function PostsSection() {
  const posts = await prisma.blogPost.findMany({
    include: { user: { select: { username: true, firstName: true } } },
    orderBy: [{ created: "desc" }, { title: "asc" }],
  });

  return (
    <div>
      {/* Quick Stats Strip */}
      <div className="adm-inner-stats">
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{posts.length}</span>
          <span className="adm-inner-stat-lbl">Total Articles</span>
        </div>
      </div>

      {/* Posts Cards Grid */}
      <div className="adm-subsystems-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {posts.map((post) => (
          <div key={post.id} className="adm-app-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span className="adm-inner-count-badge" style={{ background: "var(--adm-teal-bg)", color: "var(--adm-teal)" }}>
                Article #{post.id}
              </span>
              <time style={{ fontSize: "11.5px", color: "var(--adm-muted)", fontWeight: 600 }}>
                {post.created ? post.created.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
              </time>
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800, color: "var(--adm-text)", lineHeight: "1.35" }}>
              {post.title}
            </h3>

            {post.description && (
              <p style={{ margin: "0 0 16px", fontSize: "12.5px", color: "var(--adm-muted)", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {post.description}
              </p>
            )}

            <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--adm-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11.5px", color: "var(--adm-subtle-text)", fontWeight: 600 }}>By {post.user?.firstName || post.user?.username || "Staff"}</span>
              <Link href={`/blog/${post.slug}/`} target="_blank" rel="noopener noreferrer" className="adm-inner-row-action">
                Read Article ↗
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!posts.length && (
        <div className="adm-inner-table-card">
          <div className="adm-inner-empty">
            <p>No editorial articles published yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   5. FORM INBOX ENTRIES DETAILED SECTION
   ══════════════════════════════════════════════════════════ */
async function ReviewsSection() {
  const [reviews, stats] = await Promise.all([
    listReviewSubmissionsForAdmin(),
    getReviewModerationStats(),
  ]);

  return (
    <div>
      <div className="adm-inner-stats">
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{stats.total}</span>
          <span className="adm-inner-stat-lbl">Total Reviews</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-amber)" }}>
            {stats.pending}
          </span>
          <span className="adm-inner-stat-lbl">Pending Approval</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-emerald)" }}>
            {stats.approved}
          </span>
          <span className="adm-inner-stat-lbl">Approved Publicly</span>
        </div>
      </div>

      <div className="adm-inner-table-card">
        <div className="adm-inner-table-head-row">
          <span className="adm-inner-table-title">{reviews.length} Audience Review Submissions</span>
        </div>

        {reviews.length ? (
          <div className="adm-review-grid">
            {reviews.map((review) => {
              const isPending = review.status === "PENDING";

              return (
                <article className="adm-review-card" key={review.id}>
                  <div className="adm-review-card-top">
                    <span className={`adm-review-status ${isPending ? "is-pending" : "is-approved"}`}>
                      {isPending ? "Pending approval" : "Approved"}
                    </span>
                    <time>{formatAdminDate(review.createdAt)}</time>
                  </div>

                  <div className="adm-review-title-row">
                    <div>
                      <h3>{review.playTitle}</h3>
                      <p>{review.theatreName}</p>
                    </div>
                    <strong>{review.rating.toFixed(1)}</strong>
                  </div>

                  <div className="adm-review-meta">
                    <span>By {review.reviewerName}</span>
                    <span>{review.reviewerRole}</span>
                    <span>{review.performanceDate ? `Watched ${formatAdminDate(review.performanceDate)}` : "Performance date not provided"}</span>
                  </div>

                  <h4>{review.reviewTitle}</h4>
                  <p className="adm-review-excerpt">{review.excerpt}</p>

                  <div className="adm-review-score-grid">
                    <span>Acting <strong>{review.acting.toFixed(1)}</strong></span>
                    <span>Direction <strong>{review.direction.toFixed(1)}</strong></span>
                    <span>Stage <strong>{review.stageDesign.toFixed(1)}</strong></span>
                    <span>Script <strong>{review.script.toFixed(1)}</strong></span>
                  </div>

                  <details className="adm-review-details">
                    <summary>Read full critique</summary>
                    <p>{review.content}</p>
                    {review.viewingContext && <small>Viewing context: {review.viewingContext}</small>}
                  </details>

                  <div className="adm-review-actions">
                    {isPending && (
                      <form action={approveReviewAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <button type="submit" className="adm-review-action is-approve">
                          Approve
                        </button>
                      </form>
                    )}
                    {review.status === "APPROVED" && (
                      <Link href={`/reviews/${review.playSlug}/`} target="_blank" rel="noopener noreferrer" className="adm-review-action is-view">
                        View public
                      </Link>
                    )}
                    <form action={deleteReviewAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <button type="submit" className="adm-review-action is-delete">
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="adm-inner-empty">
            <p>No audience reviews submitted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

async function EntriesSection() {
  const entries = await prisma.formEntry.findMany({
    include: {
      values: {
        include: { field: { select: { label: true } } },
      },
    },
    orderBy: { entryTime: "desc" },
    take: 100,
  });

  return (
    <div>
      {/* Quick Stats Strip */}
      <div className="adm-inner-stats">
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{entries.length}</span>
          <span className="adm-inner-stat-lbl">Recent Submissions</span>
        </div>
      </div>

      {/* Entries Table */}
      <div className="adm-inner-table-card">
        <div className="adm-inner-table-head-row">
          <span className="adm-inner-table-title">{entries.length} Contact & Form Inquiries</span>
        </div>
        <div className="adm-inner-table-wrap">
          <table className="adm-inner-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Entry ID</th>
                <th>Submitted Timestamp</th>
                <th>Field Submissions</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className="adm-inner-id-badge">#{entry.id}</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: "13px", color: "var(--adm-text)" }}>
                      {entry.entryTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </strong>
                    <small className="adm-inner-cell-sub">
                      {entry.entryTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </small>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {entry.values.slice(0, 3).map((val) => (
                        <div key={val.id} style={{ fontSize: "12px" }}>
                          <strong style={{ color: "var(--adm-text)" }}>{val.field.label}: </strong>
                          <span style={{ color: "var(--adm-muted)" }}>{val.value}</span>
                        </div>
                      ))}
                      {!entry.values.length && <span style={{ fontSize: "12px", color: "var(--adm-muted)" }}>No payload fields</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="adm-inner-count-badge" style={{ background: "var(--adm-rose-bg)", color: "var(--adm-rose)" }}>
                      Received
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!entries.length && (
            <div className="adm-inner-empty">
              <p>No form inbox submissions received yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
