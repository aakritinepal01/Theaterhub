import { currentUser, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  approveReviewSubmission,
  deleteReviewSubmission,
  getReviewModerationStats,
  listReviewSubmissionsForAdmin,
} from "@/lib/reviews";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileAdminSidebarToggle } from "@/components/MobileAdminSidebarToggle";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getPlayPhoto, plainText } from "@/lib/content";

const SECTION_META: Record<
  string,
  { title: string; subtitle: string; description: string; icon: React.ReactNode }
> = {
  plays: {
    title: "Play Productions",
    subtitle: "Stage Archive & Catalog",
    description: "Database of registered theatre plays, cast credits, status, ratings and production posters",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5.5 5.5h21v21h-21z" fill="currentColor" opacity="0.08" />
        <path d="M6 6c4.5 1.8 7 5.3 7 10.1S10.8 24.2 6 26M26 6c-4.5 1.8-7 5.3-7 10.1s2.2 8.1 7 9.9" />
        <path d="M13 11.5h6M12.5 22.5h7M14 17.8c1.3 1.1 2.7 1.1 4 0" />
        <circle cx="14" cy="15" r=".7" fill="currentColor" stroke="none" />
        <circle cx="18" cy="15" r=".7" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  profiles: {
    title: "Artist Profiles",
    subtitle: "Performers & Stage Makers",
    description: "Directory of verified actors, directors, writers, crew members, and theatre artists",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="13" cy="10" r="5.2" fill="currentColor" opacity="0.1" />
        <path d="M4.5 27c.8-6.2 3.6-9.1 8.5-9.1s7.7 2.9 8.5 9.1" />
        <circle cx="13" cy="10" r="5.2" />
        <circle cx="24.2" cy="21.8" r="4.3" fill="currentColor" opacity="0.12" />
        <path d="m22.2 21.8 1.3 1.3 2.7-3" />
      </svg>
    ),
  },
  schedules: {
    title: "Show Schedules",
    subtitle: "Performance Calendars & Tickets",
    description: "Active stage performance dates, daily showtimes, venue assignments and booking links",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4.5" y="6.5" width="23" height="21" rx="3" fill="currentColor" opacity="0.08" />
        <path d="M10 4v5M22 4v5M4.5 12h23" />
        <path d="M9 16.5h3M15 16.5h3M21 16.5h2M9 21h3M15 21h3" />
        <circle cx="23" cy="23" r="5" fill="currentColor" opacity="0.14" />
        <path d="M23 20.5V23l1.8 1.2" />
      </svg>
    ),
  },
  posts: {
    title: "Editorial Articles",
    subtitle: "News & Reviews",
    description: "Theatre journalism, reviews, festival coverage, spotlight interviews and feature stories",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 5.5h18a2 2 0 0 1 2 2v19H8a2 2 0 0 1-2-2z" fill="currentColor" opacity="0.08" />
        <path d="M6 5.5h18a2 2 0 0 1 2 2v19H8a2 2 0 0 1-2-2zM10 10h12M10 14h12" />
        <rect x="10" y="18" width="5" height="5" rx=".8" fill="currentColor" opacity="0.14" />
        <path d="M18 18h4M18 21h4M10 26.5V28" />
      </svg>
    ),
  },
  reviews: {
    title: "Review Moderation",
    subtitle: "Audience Reviews",
    description: "Approve or delete audience-submitted stage reviews before they appear publicly",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 6.5h22v16H13l-6 4v-4H5z" fill="currentColor" opacity="0.08" />
        <path d="M5 6.5h22v16H13l-6 4v-4H5z" />
        <path d="m16 10.5 1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.5-3 1.5.6-3.2-2.4-2.3 3.3-.5z" fill="currentColor" opacity="0.2" />
      </svg>
    ),
  },
  entries: {
    title: "Form Inbox",
    subtitle: "Submissions & Inquiries",
    description: "Visitor feedback messages, booking inquiries and venue listing contact entries",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 9h22v17H5z" fill="currentColor" opacity="0.08" />
        <path d="M5 9h22v17H5zM5 11l11 8 11-8" />
        <path d="M9 5.5h14M11.5 3h9" />
        <circle cx="25.5" cy="7" r="3.5" fill="currentColor" opacity="0.16" />
        <path d="M25.5 5.5v3M24 7h3" />
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
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await currentUser();
  if (!user || (!user.isStaff && !user.isSuperuser)) redirect("/login");
  if (!user.isPasswordChanged) redirect("/set-new-password");

  const { section } = await params;
  const query = await searchParams;
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
          <form action="/api/auth/logout" method="post" className="adm-inner-logout-form">
            <button type="submit" className="adm-inner-logout-btn" title="Log out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 5H5v14h5" /><path d="M14 8l4 4-4 4M18 12H9" /></svg>
              <span>Log out</span>
            </button>
          </form>
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
            <MobileAdminSidebarToggle />
            <ThemeToggle showLabel={false} />
            <Link href="/admin" className="adm-control-btn">
              ← Overview
            </Link>
          </div>
        </header>

        <div className="adm-inner-content">
          {/* Page Header Banner */}
          <div className="adm-inner-page-header">
            <div className={`adm-inner-page-icon is-${section}`}>{meta.icon}</div>
            <div>
              <span className="adm-inner-page-kicker" style={{ fontSize: "11px", fontWeight: 800, color: "var(--adm-amber)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{meta.subtitle}</span>
              <h1>{meta.title}</h1>
              <p>{meta.description}</p>
            </div>
          </div>

          {/* Render specific detailed layout per section */}
          {section === "plays" && <PlaysSection requestedPage={query.page} />}
          {section === "profiles" && <ProfilesSection requestedPage={query.page} />}
          {section === "schedules" && <SchedulesSection requestedPage={query.page} />}
          {section === "posts" && <PostsSection requestedPage={query.page} />}
          {section === "reviews" && <ReviewsSection requestedPage={query.page} />}
          {section === "entries" && <EntriesSection />}
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════
   1. PLAYS / PRODUCTIONS DETAILED SECTION
   ══════════════════════════════════════════════════════════ */
  const ADMIN_PLAYS_PAGE_SIZE = 15;

async function PlaysSection({ requestedPage }: { requestedPage?: string }) {
  const rawPage = Number(requestedPage);
  const requested = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const [totalPlays, activePlays, ratingStats] = await Promise.all([
    prisma.play.count(),
    prisma.play.count({ where: { status: "PUBLISHED" } }),
    prisma.play.aggregate({ _avg: { ratingAverage: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalPlays / ADMIN_PLAYS_PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const plays = await prisma.play.findMany({
    include: { theatre: { select: { title: true } } },
    orderBy: [{ launchedOn: "desc" }, { title: "asc" }],
    skip: (page - 1) * ADMIN_PLAYS_PAGE_SIZE,
    take: ADMIN_PLAYS_PAGE_SIZE,
  });
  const firstRecord = totalPlays ? (page - 1) * ADMIN_PLAYS_PAGE_SIZE + 1 : 0;
  const lastRecord = Math.min(page * ADMIN_PLAYS_PAGE_SIZE, totalPlays);
  const pageHref = (nextPage: number) =>
    `/admin/plays${nextPage > 1 ? `?page=${nextPage}` : ""}`;

  return (
    <div>
      {/* Quick Stats Strip */}
      <div className="adm-inner-stats">
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{totalPlays}</span>
          <span className="adm-inner-stat-lbl">Total Plays</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-emerald)" }}>
            {activePlays}
          </span>
          <span className="adm-inner-stat-lbl">Active Stage</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-amber)" }}>
            ★ {(ratingStats._avg.ratingAverage || 0).toFixed(1)}
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

      {totalPages > 1 && (
        <nav className="adm-production-pagination" aria-label="Production pages">
          <p>
            Showing <strong>{firstRecord}&ndash;{lastRecord}</strong> of <strong>{totalPlays}</strong> productions
          </p>
          <div className="adm-production-pagination-controls">
            {page > 1 ? (
              <Link className="adm-production-page-btn" href={pageHref(page - 1)}>
                <span aria-hidden="true">←</span> Previous
              </Link>
            ) : (
              <span className="adm-production-page-btn is-disabled" aria-disabled="true">
                <span aria-hidden="true">←</span> Previous
              </span>
            )}

            <div className="adm-production-page-numbers">
              {(() => {
                let start = Math.max(1, page - 1);
                if (start + 2 > totalPages) start = Math.max(1, totalPages - 2);
                return Array.from({ length: Math.min(3, totalPages) }, (_, index) => start + index).map(
                  (pageNumber) =>
                    pageNumber === page ? (
                      <span
                        className="adm-production-page-num is-active"
                        aria-current="page"
                        key={pageNumber}
                      >
                        {pageNumber}
                      </span>
                    ) : (
                      <Link
                        className="adm-production-page-num"
                        href={pageHref(pageNumber)}
                        key={pageNumber}
                      >
                        {pageNumber}
                      </Link>
                    ),
                );
              })()}
            </div>

            {page < totalPages ? (
              <Link className="adm-production-page-btn" href={pageHref(page + 1)}>
                Next <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span className="adm-production-page-btn is-disabled" aria-disabled="true">
                Next <span aria-hidden="true">→</span>
              </span>
            )}
          </div>
          <span className="adm-production-page-status">Page {page} of {totalPages}</span>
        </nav>
      )}

      {/* Plays Table */}
      <div className="adm-inner-table-card adm-productions-table-card">
        <div className="adm-inner-table-head-row">
          <span className="adm-inner-table-title">{totalPlays} Production Records in Archive</span>
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
  const ADMIN_PROFILES_PAGE_SIZE = 15;

async function ProfilesSection({ requestedPage }: { requestedPage?: string }) {
  const rawPage = Number(requestedPage);
  const requested = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [totalProfiles, profilesWithBiography] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { bio: { not: "" } } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalProfiles / ADMIN_PROFILES_PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const profiles = await prisma.profile.findMany({
    orderBy: { name: "asc" },
    skip: (page - 1) * ADMIN_PROFILES_PAGE_SIZE,
    take: ADMIN_PROFILES_PAGE_SIZE,
  });
  const firstRecord = totalProfiles ? (page - 1) * ADMIN_PROFILES_PAGE_SIZE + 1 : 0;
  const lastRecord = Math.min(page * ADMIN_PROFILES_PAGE_SIZE, totalProfiles);
  const pageHref = (nextPage: number) =>
    `/admin/profiles${nextPage > 1 ? `?page=${nextPage}` : ""}`;

  return (
    <div>
      {/* Quick Stats Strip */}
      <div className="adm-inner-stats">
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{totalProfiles}</span>
          <span className="adm-inner-stat-lbl">Total Artist Profiles</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-violet)" }}>
            {profilesWithBiography}
          </span>
          <span className="adm-inner-stat-lbl">With Biography</span>
        </div>
      </div>

      {/* Profiles Cards Grid */}
      <div className="adm-subsystems-grid adm-artist-grid">
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

      {totalPages > 1 && (
        <nav className="adm-production-pagination adm-artist-pagination" aria-label="Artist profile pages">
          <p>
            Showing <strong>{firstRecord}&ndash;{lastRecord}</strong> of <strong>{totalProfiles}</strong> artists
          </p>
          <div className="adm-production-pagination-controls">
            {page > 1 ? (
              <Link className="adm-production-page-btn" href={pageHref(page - 1)}>
                <span aria-hidden="true">←</span> Previous
              </Link>
            ) : (
              <span className="adm-production-page-btn is-disabled" aria-disabled="true">
                <span aria-hidden="true">←</span> Previous
              </span>
            )}

            <div className="adm-production-page-numbers">
              {(() => {
                let start = Math.max(1, page - 1);
                if (start + 2 > totalPages) start = Math.max(1, totalPages - 2);
                return Array.from({ length: Math.min(3, totalPages) }, (_, index) => start + index).map(
                  (pageNumber) =>
                    pageNumber === page ? (
                      <span className="adm-production-page-num is-active" aria-current="page" key={pageNumber}>
                        {pageNumber}
                      </span>
                    ) : (
                      <Link className="adm-production-page-num" href={pageHref(pageNumber)} key={pageNumber}>
                        {pageNumber}
                      </Link>
                    ),
                );
              })()}
            </div>

            {page < totalPages ? (
              <Link className="adm-production-page-btn" href={pageHref(page + 1)}>
                Next <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span className="adm-production-page-btn is-disabled" aria-disabled="true">
                Next <span aria-hidden="true">→</span>
              </span>
            )}
          </div>
          <span className="adm-production-page-status">Page {page} of {totalPages}</span>
        </nav>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3. SHOW SCHEDULES DETAILED SECTION
   ══════════════════════════════════════════════════════════ */
  const ADMIN_SCHEDULES_PAGE_SIZE = 15;

async function SchedulesSection({ requestedPage }: { requestedPage?: string }) {
  const rawPage = Number(requestedPage);
  const requested = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [totalSchedules, activeSchedules] = await Promise.all([
    prisma.showsMeta.count(),
    prisma.showsMeta.count({ where: { endDate: { gte: today } } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalSchedules / ADMIN_SCHEDULES_PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const schedules = await prisma.showsMeta.findMany({
    include: { play: true, theatre: true, excludeDates: true, extraShows: true },
    orderBy: [{ startDate: "desc" }, { id: "desc" }],
    skip: (page - 1) * ADMIN_SCHEDULES_PAGE_SIZE,
    take: ADMIN_SCHEDULES_PAGE_SIZE,
  });
  const firstRecord = totalSchedules ? (page - 1) * ADMIN_SCHEDULES_PAGE_SIZE + 1 : 0;
  const lastRecord = Math.min(page * ADMIN_SCHEDULES_PAGE_SIZE, totalSchedules);
  const pageHref = (nextPage: number) =>
    `/admin/schedules${nextPage > 1 ? `?page=${nextPage}` : ""}`;

  return (
    <div>
      <div className="adm-inner-stats">
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{totalSchedules}</span>
          <span className="adm-inner-stat-lbl">Total Schedules</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-blue)" }}>
            {activeSchedules}
          </span>
          <span className="adm-inner-stat-lbl">Active & Upcoming</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-muted)" }}>
            {totalSchedules - activeSchedules}
          </span>
          <span className="adm-inner-stat-lbl">Past Schedules</span>
        </div>
      </div>

      <div className="adm-schedule-directory-head">
        <div>
          <span>PERFORMANCE CALENDAR</span>
          <h2>Show schedule archive</h2>
        </div>
        <strong>{totalSchedules} schedule{totalSchedules === 1 ? "" : "s"}</strong>
      </div>

      <div className="adm-schedule-grid">
        {schedules.map((schedule) => {
          const isActive = schedule.endDate >= today;
          const weeklySlots = [
            ["Sun", schedule.sunday],
            ["Mon", schedule.monday],
            ["Tue", schedule.tuesday],
            ["Wed", schedule.wednesday],
            ["Thu", schedule.thursday],
            ["Fri", schedule.friday],
            ["Sat", schedule.saturday],
          ].filter((slot) => slot[1]);

          return (
            <article className="adm-schedule-card" key={schedule.id}>
              <div className="adm-schedule-card-accent" aria-hidden="true" />
              <div className="adm-schedule-card-head">
                <span className="adm-schedule-id">SCHEDULE #{schedule.id}</span>
                <span className={`adm-schedule-status ${isActive ? "is-active" : "is-ended"}`}>
                  <span aria-hidden="true" />
                  {isActive ? "Active" : "Ended"}
                </span>
              </div>

              <h3>{schedule.play.title}</h3>
              <p className="adm-schedule-venue">
                <span aria-hidden="true">⌂</span> {schedule.theatre.title}
              </p>

              <div className="adm-schedule-date-range">
                <div>
                  <small>ST</small>
                  <strong>{schedule.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>
                </div>
                <span aria-hidden="true">→</span>
                <div>
                  <small>ED</small>
                  <strong>{schedule.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>
                </div>
              </div>

              <div className="adm-schedule-slot-block">
                <small>WEEKLY SHOWTIMES</small>
                <div className="adm-schedule-slots">
                  {weeklySlots.length ? (
                    weeklySlots.map(([day, time]) => (
                      <span key={day}><strong>{day}</strong>{time}</span>
                    ))
                  ) : (
                    <span className="is-empty">No recurring showtimes</span>
                  )}
                </div>
              </div>

              <div className="adm-schedule-card-foot">
                <div>
                  <span>{schedule.excludeDates.length} excluded</span>
                  <span>{schedule.extraShows.length} extra</span>
                </div>
                {schedule.play.slug ? (
                  <Link href={`/play/${schedule.play.slug}/`} target="_blank" rel="noopener noreferrer">
                    View production <span aria-hidden="true">↗</span>
                  </Link>
                ) : (
                  <span className="adm-inner-cell-muted">No public page</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!schedules.length && (
        <div className="adm-inner-empty adm-schedule-empty">
          <p>No show performance schedules created yet.</p>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="adm-production-pagination adm-schedule-pagination" aria-label="Show schedule pages">
          <p>
            Showing <strong>{firstRecord}&ndash;{lastRecord}</strong> of <strong>{totalSchedules}</strong> schedules
          </p>
          <div className="adm-production-pagination-controls">
            {page > 1 ? (
              <Link className="adm-production-page-btn" href={pageHref(page - 1)}>
                <span aria-hidden="true">←</span> Previous
              </Link>
            ) : (
              <span className="adm-production-page-btn is-disabled" aria-disabled="true">
                <span aria-hidden="true">←</span> Previous
              </span>
            )}

            <div className="adm-production-page-numbers">
              {(() => {
                let start = Math.max(1, page - 1);
                if (start + 2 > totalPages) start = Math.max(1, totalPages - 2);
                return Array.from({ length: Math.min(3, totalPages) }, (_, index) => start + index).map(
                  (pageNumber) =>
                    pageNumber === page ? (
                      <span className="adm-production-page-num is-active" aria-current="page" key={pageNumber}>
                        {pageNumber}
                      </span>
                    ) : (
                      <Link className="adm-production-page-num" href={pageHref(pageNumber)} key={pageNumber}>
                        {pageNumber}
                      </Link>
                    ),
                );
              })()}
            </div>

            {page < totalPages ? (
              <Link className="adm-production-page-btn" href={pageHref(page + 1)}>
                Next <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span className="adm-production-page-btn is-disabled" aria-disabled="true">
                Next <span aria-hidden="true">→</span>
              </span>
            )}
          </div>
          <span className="adm-production-page-status">Page {page} of {totalPages}</span>
        </nav>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   4. EDITORIAL POSTS DETAILED SECTION
   ══════════════════════════════════════════════════════════ */
const ADMIN_POSTS_PAGE_SIZE = 8;

async function PostsSection({ requestedPage }: { requestedPage?: string }) {
  const rawPage = Number(requestedPage);
  const requested = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [totalArticles, publishedArticles, engagement] = await Promise.all([
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.aggregate({ _sum: { commentsCount: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalArticles / ADMIN_POSTS_PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const posts = await prisma.blogPost.findMany({
    include: {
      user: { select: { username: true, firstName: true } },
      _count: { select: { categories: true } },
    },
    orderBy: [{ created: "desc" }, { title: "asc" }],
    skip: (page - 1) * ADMIN_POSTS_PAGE_SIZE,
    take: ADMIN_POSTS_PAGE_SIZE,
  });
  const firstRecord = totalArticles ? (page - 1) * ADMIN_POSTS_PAGE_SIZE + 1 : 0;
  const lastRecord = Math.min(page * ADMIN_POSTS_PAGE_SIZE, totalArticles);
  const pageHref = (nextPage: number) =>
    `/admin/posts${nextPage > 1 ? `?page=${nextPage}` : ""}`;

  return (
    <div>
      <div className="adm-inner-stats adm-editorial-stats">
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{totalArticles}</span>
          <span className="adm-inner-stat-lbl">Total Articles</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-teal)" }}>{publishedArticles}</span>
          <span className="adm-inner-stat-lbl">Published</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-muted)" }}>{totalArticles - publishedArticles}</span>
          <span className="adm-inner-stat-lbl">Drafts</span>
        </div>
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num">{engagement._sum.commentsCount || 0}</span>
          <span className="adm-inner-stat-lbl">Comments</span>
        </div>
      </div>

      <div className="adm-editorial-directory-head">
        <div>
          <span>STORY DESK</span>
          <h2>Editorial archive</h2>
        </div>
        <strong>{totalArticles} article{totalArticles === 1 ? "" : "s"}</strong>
      </div>

      <div className="adm-editorial-grid">
        {posts.map((post) => {
          const excerpt = plainText(post.description || post.content).slice(0, 170);
          const articleDate = post.publishDate || post.created;
          const isPublished = post.status === "PUBLISHED";

          return (
            <article className="adm-editorial-card" key={post.id}>
              <div className="adm-editorial-image">
                {post.featuredImage ? (
                  <img src={post.featuredImage} alt={`${post.title} featured image`} loading="lazy" />
                ) : (
                  <div className="adm-editorial-image-fallback">
                    <span>TH</span>
                    <strong>EDITORIAL</strong>
                  </div>
                )}
                <span className={`adm-editorial-status ${isPublished ? "is-published" : "is-draft"}`}>
                  {isPublished ? "Published" : "Draft"}
                </span>
                <span className="adm-editorial-id">#{post.id}</span>
              </div>

              <div className="adm-editorial-body">
                <div className="adm-editorial-meta">
                  <span>By {post.user?.firstName || post.user?.username || "Staff"}</span>
                  <time>{articleDate ? articleDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Date pending"}</time>
                </div>

                <h3>{post.title}</h3>
                <p>{excerpt ? `${excerpt}${excerpt.length === 170 ? "…" : ""}` : "No editorial summary has been added yet."}</p>

                <div className="adm-editorial-insights">
                  <span><strong>{post._count.categories}</strong> categories</span>
                  <span><strong>{post.commentsCount}</strong> comments</span>
                  <span><strong>{post.ratingAverage ? post.ratingAverage.toFixed(1) : "—"}</strong> rating</span>
                </div>

                <div className="adm-editorial-footer">
                  <span>/{post.slug}</span>
                  <Link href={`/blog/${post.slug}/`} target="_blank" rel="noopener noreferrer">
                    View article <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!posts.length && (
        <div className="adm-inner-empty adm-editorial-empty">
          <p>No editorial articles have been created yet.</p>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="adm-production-pagination adm-editorial-pagination" aria-label="Editorial article pages">
          <p>
            Showing <strong>{firstRecord}&ndash;{lastRecord}</strong> of <strong>{totalArticles}</strong> articles
          </p>
          <div className="adm-production-pagination-controls">
            {page > 1 ? (
              <Link className="adm-production-page-btn" href={pageHref(page - 1)}>
                <span aria-hidden="true">←</span> Previous
              </Link>
            ) : (
              <span className="adm-production-page-btn is-disabled" aria-disabled="true">
                <span aria-hidden="true">←</span> Previous
              </span>
            )}

            <div className="adm-production-page-numbers">
              {(() => {
                let start = Math.max(1, page - 1);
                if (start + 2 > totalPages) start = Math.max(1, totalPages - 2);
                return Array.from({ length: Math.min(3, totalPages) }, (_, index) => start + index).map(
                  (pageNumber) =>
                    pageNumber === page ? (
                      <span className="adm-production-page-num is-active" aria-current="page" key={pageNumber}>
                        {pageNumber}
                      </span>
                    ) : (
                      <Link className="adm-production-page-num" href={pageHref(pageNumber)} key={pageNumber}>
                        {pageNumber}
                      </Link>
                    ),
                );
              })()}
            </div>

            {page < totalPages ? (
              <Link className="adm-production-page-btn" href={pageHref(page + 1)}>
                Next <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span className="adm-production-page-btn is-disabled" aria-disabled="true">
                Next <span aria-hidden="true">→</span>
              </span>
            )}
          </div>
          <span className="adm-production-page-status">Page {page} of {totalPages}</span>
        </nav>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   5. AUDIENCE REVIEW MODERATION SECTION
   ══════════════════════════════════════════════════════════ */
const ADMIN_REVIEWS_PAGE_SIZE = 6;

async function ReviewsSection({ requestedPage }: { requestedPage?: string }) {
  const rawPage = Number(requestedPage);
  const requested = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const stats = await getReviewModerationStats();
  const totalPages = Math.max(1, Math.ceil(stats.total / ADMIN_REVIEWS_PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const reviews = await listReviewSubmissionsForAdmin(
    ADMIN_REVIEWS_PAGE_SIZE,
    (page - 1) * ADMIN_REVIEWS_PAGE_SIZE,
  );
  const firstRecord = stats.total ? (page - 1) * ADMIN_REVIEWS_PAGE_SIZE + 1 : 0;
  const lastRecord = Math.min(page * ADMIN_REVIEWS_PAGE_SIZE, stats.total);
  const approvalRate = stats.total ? Math.round((stats.approved / stats.total) * 100) : 0;
  const pageHref = (nextPage: number) =>
    `/admin/reviews${nextPage > 1 ? `?page=${nextPage}` : ""}`;

  return (
    <div>
      <div className="adm-inner-stats adm-review-stats">
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
        <div className="adm-inner-stat-divider" />
        <div className="adm-inner-stat-item">
          <span className="adm-inner-stat-num" style={{ color: "var(--adm-blue)" }}>
            {approvalRate}%
          </span>
          <span className="adm-inner-stat-lbl">Approval Rate</span>
        </div>
      </div>

      <div className="adm-review-directory-head">
        <div>
          <span>MODERATION QUEUE</span>
          <h2>Audience review submissions</h2>
        </div>
        <strong>{stats.pending ? `${stats.pending} awaiting action` : "Queue is clear"}</strong>
      </div>

      {reviews.length ? (
        <div className="adm-review-grid is-moderation-grid">
          {reviews.map((review) => {
            const isPending = review.status === "PENDING";

            return (
              <article className={`adm-review-card ${isPending ? "is-pending-card" : "is-approved-card"}`} key={review.id}>
                <div className="adm-review-card-top">
                  <div className="adm-review-status-group">
                    <span className={`adm-review-status ${isPending ? "is-pending" : "is-approved"}`}>
                      <span aria-hidden="true" />
                      {isPending ? "Pending approval" : "Approved"}
                    </span>
                    <small>Submission #{review.id}</small>
                  </div>
                  <time>{formatAdminDate(review.createdAt)}</time>
                </div>

                <div className="adm-review-play-overview">
                  <div className="adm-review-play-image">
                    {review.playImage ? (
                      <img src={review.playImage} alt={`${review.playTitle} poster`} loading="lazy" />
                    ) : (
                      <span aria-hidden="true">★</span>
                    )}
                  </div>
                  <div>
                    <small>PRODUCTION REVIEW</small>
                    <h3>{review.playTitle}</h3>
                    <p>{review.theatreName}</p>
                  </div>
                  <div className="adm-review-rating">
                    <strong>{review.rating.toFixed(1)}</strong>
                    <span>out of 5</span>
                  </div>
                </div>

                <div className="adm-review-reviewer-row">
                  <div className="adm-review-reviewer">
                    {review.reviewerAvatar ? (
                      <img src={review.reviewerAvatar} alt="" loading="lazy" />
                    ) : (
                      <span>{review.reviewerName.slice(0, 1).toUpperCase()}</span>
                    )}
                    <div>
                      <strong>{review.reviewerName}</strong>
                      <small>{review.reviewerRole}</small>
                    </div>
                  </div>
                  <span>{review.performanceDate ? `Watched ${formatAdminDate(review.performanceDate)}` : "Date not provided"}</span>
                </div>

                <div className="adm-review-copy">
                  <div>
                    <span>{review.verdictTag}</span>
                    <span>{review.recommendation}</span>
                  </div>
                  <h4>{review.reviewTitle}</h4>
                  <p className="adm-review-excerpt">{review.excerpt}</p>
                </div>

                <div className="adm-review-score-grid">
                  <span>Acting <strong>{review.acting.toFixed(1)}</strong></span>
                  <span>Direction <strong>{review.direction.toFixed(1)}</strong></span>
                  <span>Stage <strong>{review.stageDesign.toFixed(1)}</strong></span>
                  <span>Script <strong>{review.script.toFixed(1)}</strong></span>
                </div>

                {review.keyQuote && <blockquote className="adm-review-quote">“{review.keyQuote}”</blockquote>}

                <details className="adm-review-details">
                  <summary>Read full critique <span aria-hidden="true">＋</span></summary>
                  <p>{review.content}</p>
                  {review.viewingContext && <small>Viewing context: {review.viewingContext}</small>}
                </details>

                <div className="adm-review-actions">
                  {isPending && (
                    <form action={approveReviewAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <button type="submit" className="adm-review-action is-approve">
                        Approve review <span aria-hidden="true">✓</span>
                      </button>
                    </form>
                  )}
                  {review.status === "APPROVED" && (
                    <Link href={`/reviews/${review.playSlug}/`} target="_blank" rel="noopener noreferrer" className="adm-review-action is-view">
                      View public <span aria-hidden="true">↗</span>
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
        <div className="adm-inner-empty adm-review-empty">
          <p>No audience reviews submitted yet.</p>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="adm-production-pagination adm-review-pagination" aria-label="Review submission pages">
          <p>
            Showing <strong>{firstRecord}&ndash;{lastRecord}</strong> of <strong>{stats.total}</strong> reviews
          </p>
          <div className="adm-production-pagination-controls">
            {page > 1 ? (
              <Link className="adm-production-page-btn" href={pageHref(page - 1)}>
                <span aria-hidden="true">←</span> Previous
              </Link>
            ) : (
              <span className="adm-production-page-btn is-disabled" aria-disabled="true">
                <span aria-hidden="true">←</span> Previous
              </span>
            )}

            <div className="adm-production-page-numbers">
              {(() => {
                let start = Math.max(1, page - 1);
                if (start + 2 > totalPages) start = Math.max(1, totalPages - 2);
                return Array.from({ length: Math.min(3, totalPages) }, (_, index) => start + index).map(
                  (pageNumber) =>
                    pageNumber === page ? (
                      <span className="adm-production-page-num is-active" aria-current="page" key={pageNumber}>
                        {pageNumber}
                      </span>
                    ) : (
                      <Link className="adm-production-page-num" href={pageHref(pageNumber)} key={pageNumber}>
                        {pageNumber}
                      </Link>
                    ),
                );
              })()}
            </div>

            {page < totalPages ? (
              <Link className="adm-production-page-btn" href={pageHref(page + 1)}>
                Next <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span className="adm-production-page-btn is-disabled" aria-disabled="true">
                Next <span aria-hidden="true">→</span>
              </span>
            )}
          </div>
          <span className="adm-production-page-status">Page {page} of {totalPages}</span>
        </nav>
      )}
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
