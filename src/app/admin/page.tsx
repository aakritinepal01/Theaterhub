import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReviewModerationStats } from "@/lib/reviews";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

type IconName = 
  | "theatre" 
  | "play" 
  | "people" 
  | "calendar" 
  | "article" 
  | "inbox" 
  | "user" 
  | "arrow" 
  | "plus" 
  | "external" 
  | "shield" 
  | "logout"
  | "sparkle"
  | "layers"
  | "check"
  | "bolt";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    theatre: (
      <>
        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </>
    ),
    play: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="m10 9 5 3-5 3V9Z" />
      </>
    ),
    people: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
    article: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    ),
    inbox: (
      <>
        <path d="M4 4h16v16H4zM4 14h4l2 3h4l2-3h4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
    external: (
      <>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
      </>
    ),
    layers: (
      <>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </>
    ),
    check: (
      <>
        <polyline points="20 6 9 17 4 12" />
      </>
    ),
    bolt: (
      <>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default async function Admin() {
  const user = await currentUser();
  if (!user || (!user.isStaff && !user.isSuperuser)) redirect("/login");
  if (!user.isPasswordChanged) redirect("/set-new-password");

  const [plays, profiles, theatres, schedules, posts, entries, claimed, users, reviewStats] = await Promise.all([
    prisma.play.count(),
    prisma.profile.count(),
    prisma.theatre.count(),
    prisma.showsMeta.count(),
    prisma.blogPost.count(),
    prisma.formEntry.count(),
    prisma.theatre.count({ where: { ownerId: { not: null } } }),
    prisma.user.count({ where: { isActive: true } }),
    getReviewModerationStats(),
  ]);

  const unclaimed = theatres - claimed;
  const totalPublicRecords = theatres + plays + profiles + posts + reviewStats.approved;
  const openWorkCount = reviewStats.pending + unclaimed + entries;
  const recentReviews: Array<{ id: string; reviewTitle: string | null; playTitle: string; reviewerName: string; status: string }> = [];
  const recentTheatres: Array<{ id: string; title: string; updated: Date | null; owner: { username: string } | null; _count: { plays: number } }> = [];
  const firstAction = reviewStats.pending > 0
    ? { href: "/admin/reviews", label: "Review submissions", icon: "sparkle" as const }
    : unclaimed > 0
      ? { href: "/admin/theatres?unclaimed=1", label: "Assign venue owners", icon: "theatre" as const }
      : entries > 0
        ? { href: "/admin/entries", label: "Open form inbox", icon: "inbox" as const }
        : { href: "/admin/theatres", label: "Manage venues", icon: "theatre" as const };

  const stats = [
    {
      label: "Needs Attention",
      value: openWorkCount,
      note: "Reviews, venues and inbox",
      icon: "bolt" as const,
      href: reviewStats.pending > 0 ? "/admin/reviews" : unclaimed > 0 ? "/admin/theatres?unclaimed=1" : "/admin/entries",
      accent: "stat-amber",
    },
    {
      label: "Public Records",
      value: totalPublicRecords,
      note: "Venues, plays, artists and articles",
      icon: "layers" as const,
      href: "/admin",
      accent: "stat-blue",
    },
    {
      label: "Scheduled Shows",
      value: schedules,
      note: "Upcoming performance schedules",
      icon: "calendar" as const,
      href: "/admin/schedules",
      accent: "stat-emerald",
    },
    {
      label: "Team Accounts",
      value: users,
      note: "Staff and theatre owners",
      icon: "user" as const,
      href: "/admin/create-user",
      accent: "stat-violet",
    },
  ];

  const priorityItems = [
    {
      label: "Review approvals",
      value: reviewStats.pending,
      detail: reviewStats.pending > 0 ? "Audience critiques are waiting before public publish." : "No audience reviews waiting.",
      href: "/admin/reviews",
      icon: "sparkle" as const,
      tone: reviewStats.pending > 0 ? "is-warning" : "is-clear",
      action: reviewStats.pending > 0 ? "Open review queue" : "View reviews",
    },
    {
      label: "Unclaimed venues",
      value: unclaimed,
      detail: unclaimed > 0 ? "Assign theatre owners so venues can manage schedules." : "Every venue has an owner assigned.",
      href: "/admin/theatres?unclaimed=1",
      icon: "theatre" as const,
      tone: unclaimed > 0 ? "is-warning" : "is-clear",
      action: unclaimed > 0 ? "Match owners" : "View venues",
    },
    {
      label: "Form inbox",
      value: entries,
      detail: entries > 0 ? "Visitor messages and submissions need checking." : "No form messages in the inbox.",
      href: "/admin/entries",
      icon: "inbox" as const,
      tone: entries > 0 ? "is-info" : "is-clear",
      action: entries > 0 ? "Read inbox" : "Open inbox",
    },
  ];

  const modules = [
    {
      title: "Theatres",
      desc: "Add or edit venue profiles, address details, images and owner assignment.",
      count: theatres,
      unit: "Venues",
      icon: "theatre" as const,
      href: "/admin/theatres",
      accent: "app-amber",
      actionLabel: "Manage theatres",
    },
    {
      title: "Plays",
      desc: "Manage production records, cast, synopsis, posters and public play pages.",
      count: plays,
      unit: "Plays",
      icon: "play" as const,
      href: "/admin/plays",
      accent: "app-crimson",
      actionLabel: "Manage plays",
    },
    {
      title: "Schedules",
      desc: "Update show dates, times, venue links and booking information.",
      count: schedules,
      unit: "Schedules",
      icon: "calendar" as const,
      href: "/admin/schedules",
      accent: "app-blue",
      actionLabel: "Manage schedules",
    },
    {
      title: "Artists",
      desc: "Manage performer, director, writer, crew and musician profiles.",
      count: profiles,
      unit: "Artists",
      icon: "people" as const,
      href: "/admin/profiles",
      accent: "app-violet",
      actionLabel: "Manage artists",
    },
    {
      title: "Editorial",
      desc: "Create and edit news, articles, interviews and theatre stories.",
      count: posts,
      unit: "Articles",
      icon: "article" as const,
      href: "/admin/posts",
      accent: "app-teal",
      actionLabel: "Manage posts",
    },
    {
      title: "Reviews",
      desc: "Approve or delete audience reviews before they appear on the website.",
      count: reviewStats.total,
      unit: "Reviews",
      icon: "sparkle" as const,
      href: "/admin/reviews",
      accent: "app-amber",
      badge: reviewStats.pending > 0 ? `${reviewStats.pending.toLocaleString()} Pending` : undefined,
      actionLabel: "Moderate reviews",
    },
    {
      title: "Form Inbox",
      desc: "Read contact messages, venue listing inquiries and audience feedback entries.",
      count: entries,
      unit: "Messages",
      icon: "inbox" as const,
      href: "/admin/entries",
      accent: "app-rose",
      badge: entries > 0 ? `${entries.toLocaleString()} New` : undefined,
      actionLabel: "Open inbox",
    },
    {
      title: "Users",
      desc: "Create staff or theatre-owner accounts for the admin system.",
      count: users,
      unit: "Users",
      icon: "user" as const,
      href: "/admin/create-user",
      accent: "app-emerald",
      actionLabel: "Create user",
    },
  ];

  return (
    <main className="adm-app-shell">
      {/* ── Sidebar ── */}
      <aside className="adm-dock-side">
        <div className="adm-dock-header">
          <Link href="/" className="adm-dock-brand">
            <img src="/brand-logo-light.png" alt="TheaterHub" className="adm-dock-logo" />
            <div className="adm-dock-title">
              <strong>TheaterHub</strong>
              <small>STUDIO CONSOLE</small>
            </div>
          </Link>
        </div>

        <nav className="adm-dock-nav" aria-label="Admin Navigation">
          <div className="adm-dock-group">
            <span className="adm-dock-heading">WORKSPACE</span>
            <Link href="/admin" className="adm-dock-item is-active">
              <span className="adm-dock-icon"><Icon name="layers" /></span>
              <span>Overview</span>
            </Link>
            <Link href="/admin/theatres" className="adm-dock-item">
              <span className="adm-dock-icon"><Icon name="theatre" /></span>
              <span>Theatres</span>
              <span className="adm-dock-pill">{theatres}</span>
            </Link>
            <Link href="/admin/plays" className="adm-dock-item">
              <span className="adm-dock-icon"><Icon name="play" /></span>
              <span>Productions</span>
              <span className="adm-dock-pill">{plays}</span>
            </Link>
            <Link href="/admin/schedules" className="adm-dock-item">
              <span className="adm-dock-icon"><Icon name="calendar" /></span>
              <span>Schedules</span>
              <span className="adm-dock-pill">{schedules}</span>
            </Link>
          </div>

          <div className="adm-dock-group">
            <span className="adm-dock-heading">DIRECTORY & TOOLS</span>
            <Link href="/admin/profiles" className="adm-dock-item">
              <span className="adm-dock-icon"><Icon name="people" /></span>
              <span>Artists</span>
              <span className="adm-dock-pill">{profiles}</span>
            </Link>
            <Link href="/admin/posts" className="adm-dock-item">
              <span className="adm-dock-icon"><Icon name="article" /></span>
              <span>Editorial</span>
              <span className="adm-dock-pill">{posts}</span>
            </Link>
            <Link href="/admin/reviews" className="adm-dock-item">
              <span className="adm-dock-icon"><Icon name="sparkle" /></span>
              <span>Reviews</span>
              {reviewStats.pending > 0 ? (
                <span className="adm-dock-pill is-alert">{reviewStats.pending}</span>
              ) : (
                <span className="adm-dock-pill">{reviewStats.total}</span>
              )}
            </Link>
            <Link href="/admin/create-user" className="adm-dock-item">
              <span className="adm-dock-icon"><Icon name="plus" /></span>
              <span>Create User</span>
            </Link>
            <Link href="/admin/entries" className="adm-dock-item">
              <span className="adm-dock-icon"><Icon name="inbox" /></span>
              <span>Form Inbox</span>
              {entries > 0 && <span className="adm-dock-pill is-alert">{entries}</span>}
            </Link>
          </div>
        </nav>

        <div className="adm-dock-foot">
          <div className="adm-user-profile-tile">
            <span className="adm-user-avatar-mark">{user.username.slice(0, 1).toUpperCase()}</span>
            <div className="adm-user-profile-info">
              <strong>{user.username}</strong>
              <small>ID: #{user.id} · {user.isSuperuser ? "Superadmin" : "Staff Administrator"}</small>
            </div>
            <span className="adm-user-status-dot" title="Account Active" />
          </div>
        </div>
      </aside>

      {/* ── Main Stage ── */}
      <section className="adm-dock-main">
        {/* Modern Top Header */}
        <header className="adm-dock-topbar">
          <div className="adm-topbar-breadcrumb">
            <span className="adm-bc-parent">Console</span>
            <span className="adm-bc-slash">/</span>
            <strong className="adm-bc-active">Dashboard</strong>
            <span className="adm-live-status-pill">
              <span className="adm-live-status-dot" />
              <span>Signed in as @{user.username}</span>
            </span>
          </div>

          <div className="adm-topbar-controls">
            <ThemeToggle showLabel={false} />
            <Link href="/" className="adm-control-btn" target="_blank" rel="noopener noreferrer" title="View Public Website">
              <Icon name="external" />
              <span>Public Website</span>
            </Link>
            <form action="/api/auth/logout" method="post" className="adm-control-form">
              <button type="submit" className="adm-control-btn adm-logout-btn" title="Log out">
                <Icon name="logout" />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="adm-dock-content">
          <section className="adm-clean-hero" aria-labelledby="admin-dashboard-heading">
            <div>
              <span className="adm-page-kicker">Admin Dashboard</span>
              <h1 id="admin-dashboard-heading">Good morning, {user.username}</h1>
              <p>Use this overview to clear pending tasks first, then manage the public theatre directory and editorial content.</p>
            </div>
            <Link href={firstAction.href} className="adm-clean-hero-action">
              <Icon name={firstAction.icon} />
              <span>{firstAction.label}</span>
            </Link>
          </section>

          <div className="adm-summary-strip" aria-label="Admin summary">
            {stats.map((s) => (
              <Link href={s.href} className={`adm-summary-tile ${s.accent}`} key={s.label}>
                <span className="adm-summary-icon"><Icon name={s.icon} /></span>
                <span className="adm-summary-copy">
                  <strong>{s.value.toLocaleString()}</strong>
                  <span>{s.label}</span>
                  <small>{s.note}</small>
                </span>
              </Link>
            ))}
          </div>

          <section className="adm-work-panel" aria-labelledby="priority-heading">
            <div className="adm-section-header">
              <div>
                <h2 id="priority-heading">Pending Work</h2>
                <p>These are the admin tasks that need action before public content is fully up to date.</p>
              </div>
              <span className={`adm-section-pill ${openWorkCount > 0 ? "is-alert" : "is-clear"}`}>{openWorkCount > 0 ? `${openWorkCount.toLocaleString()} to do` : "All clear"}</span>
            </div>

            <div className="adm-work-list">
              {priorityItems.map((item) => (
                <Link href={item.href} className={`adm-work-item ${item.tone}`} key={item.label}>
                  <span className="adm-work-icon"><Icon name={item.icon} /></span>
                  <span className="adm-work-copy">
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <span className="adm-work-count">
                    <strong>{item.value.toLocaleString()}</strong>
                    <small>{item.value > 0 ? "open" : "clear"}</small>
                  </span>
                  <span className="adm-work-action">
                    <span>{item.action}</span>
                    <Icon name="arrow" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* 2-Column Main Layout */}
          <div className="adm-canvas-grid adm-canvas-grid-single">
            {/* Left: Management Modules */}
            <div className="adm-canvas-modules">
              <div className="adm-section-header">
                <div>
                  <h2>Manage Platform Areas</h2>
                  <p>Choose an area below to add, edit or review records.</p>
                </div>
                <span className="adm-section-pill">{modules.length} modules</span>
              </div>

              <div className="adm-admin-modules-grid">
                {modules.map((m) => (
                  <Link href={m.href} className={`adm-admin-module-card ${m.accent}`} key={m.title}>
                    <span className="adm-admin-module-icon"><Icon name={m.icon} /></span>
                    <span className="adm-admin-module-copy">
                      <span className="adm-admin-module-title">
                        <strong>{m.title}</strong>
                        {m.badge && <em>{m.badge}</em>}
                      </span>
                      <small>{m.desc}</small>
                    </span>
                    <span className="adm-admin-module-action">
                      {m.actionLabel}
                      <Icon name="arrow" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Recent activity */}
            <div className="adm-canvas-side">
              <div className="adm-side-card">
                <div className="adm-side-card-head">
                  <div>
                    <h2>Review Queue</h2>
                    <p>Latest audience-submitted reviews</p>
                  </div>
                  <Link href="/admin/reviews" className="adm-side-action-link">Moderate</Link>
                </div>

                <div className="adm-review-queue">
                  {recentReviews.length > 0 ? (
                    recentReviews.map((review) => (
                      <Link href="/admin/reviews" className="adm-review-queue-row" key={review.id}>
                        <span className="adm-review-queue-main">
                          <strong>{review.reviewTitle || review.playTitle}</strong>
                          <small>{review.reviewerName} - {review.playTitle}</small>
                        </span>
                        <span className={`adm-queue-status is-${review.status.toLowerCase()}`}>
                          {review.status.toLowerCase()}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="adm-mini-empty">No audience reviews yet.</div>
                  )}
                </div>
              </div>

              {/* Recently Updated Theatres */}
              <div className="adm-side-card">
                <div className="adm-side-card-head">
                  <div>
                    <h2>Venue Activity</h2>
                    <p>Recently edited venue records</p>
                  </div>
                  <Link href="/admin/theatres" className="adm-side-action-link">View all</Link>
                </div>

                <div className="adm-activity-stream">
                  {recentTheatres.length > 0 ? recentTheatres.map((t) => (
                    <Link href={`/admin/theatres/${t.id}`} className="adm-activity-row" key={t.id}>
                      <span className="adm-activity-avatar">{t.title.slice(0, 1).toUpperCase()}</span>
                      <div className="adm-activity-info">
                        <strong>{t.title}</strong>
                        <small>
                          <span>{t._count.plays} plays</span>
                          <span className="adm-dot-sep">•</span>
                          <span>{t.owner ? `Owner: ${t.owner.username}` : "Unclaimed"}</span>
                        </small>
                      </div>
                      <time className="adm-activity-time">
                        {t.updated ? t.updated.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </time>
                    </Link>
                  )) : (
                    <div className="adm-mini-empty">No venue activity yet.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
