import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const [plays, profiles, theatres, schedules, posts, entries, claimed, users, recentTheatres] = await Promise.all([
    prisma.play.count(),
    prisma.profile.count(),
    prisma.theatre.count(),
    prisma.showsMeta.count(),
    prisma.blogPost.count(),
    prisma.formEntry.count(),
    prisma.theatre.count({ where: { ownerId: { not: null } } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.theatre.findMany({
      take: 5,
      orderBy: [{ updated: "desc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        address: true,
        updated: true,
        owner: { select: { username: true } },
        _count: { select: { plays: true } },
      },
    }),
  ]);

  const unclaimed = theatres - claimed;
  const claimedPercent = theatres ? Math.round((claimed / theatres) * 100) : 0;

  const stats = [
    {
      label: "Theatre Venues",
      value: theatres,
      note: `${claimed} claimed · ${unclaimed} unclaimed`,
      icon: "theatre" as const,
      href: "/admin/theatres",
      accent: "stat-amber",
      progress: `${claimedPercent}% claimed`,
      pct: claimedPercent,
    },
    {
      label: "Play Productions",
      value: plays,
      note: "Published in stage archive",
      icon: "play" as const,
      href: "/admin/plays",
      accent: "stat-crimson",
      progress: "Catalog depth",
      pct: 88,
    },
    {
      label: "Artist Profiles",
      value: profiles,
      note: "Performers, directors & makers",
      icon: "people" as const,
      href: "/admin/profiles",
      accent: "stat-violet",
      progress: "Talent index",
      pct: 95,
    },
    {
      label: "Registered Users",
      value: users,
      note: "Staff & theatre accounts",
      icon: "user" as const,
      href: "/admin/create-user",
      accent: "stat-emerald",
      progress: "Active accounts",
      pct: 100,
    },
  ];

  const modules = [
    {
      title: "Theatre Venues",
      desc: "Directory of performance halls, ownership verification, locations & stage specs.",
      count: theatres,
      unit: "Venues",
      icon: "theatre" as const,
      href: "/admin/theatres",
      accent: "app-amber",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
    {
      title: "Play Archive",
      desc: "Production database, directorial credits, cast profiles, synopses & posters.",
      count: plays,
      unit: "Plays",
      icon: "play" as const,
      href: "/admin/plays",
      accent: "app-crimson",
      gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
    },
    {
      title: "Show Calendars",
      desc: "Live performance schedules, active date ranges, recurring shows & tickets.",
      count: schedules,
      unit: "Schedules",
      icon: "calendar" as const,
      href: "/admin/schedules",
      accent: "app-blue",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    },
    {
      title: "Artist Directory",
      desc: "Verified profiles of theatre performers, playwrights, stage crew & musicians.",
      count: profiles,
      unit: "Artists",
      icon: "people" as const,
      href: "/admin/profiles",
      accent: "app-violet",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    },
    {
      title: "Editorial & News",
      desc: "Theatre reviews, insightful articles, festival coverage & spotlight stories.",
      count: posts,
      unit: "Articles",
      icon: "article" as const,
      href: "/admin/posts",
      accent: "app-teal",
      gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
    },
    {
      title: "Form Inbox",
      desc: "Contact messages, venue listing submissions & audience feedback entries.",
      count: entries,
      unit: "Messages",
      icon: "inbox" as const,
      href: "/admin/entries",
      accent: "app-rose",
      gradient: "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)",
      badge: entries > 0 ? `${entries.toLocaleString()} New` : undefined,
    },
  ];

  return (
    <main className="adm-app-shell">
      {/* ── Sidebar ── */}
      <aside className="adm-dock-side">
        <div className="adm-dock-header">
          <Link href="/" className="adm-dock-brand">
            <img src="/brand-logo.png" alt="TheaterHub" className="adm-dock-logo" />
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
              <span>Logged in: @{user.username} (ID: #{user.id})</span>
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
          {/* Header Row */}
          <div className="adm-intro-row">
            <div className="adm-intro-text">
              <h1>
                Good to see you, <em>{user.firstName || user.username}</em>
              </h1>
              <p>Platform telemetry and real-time operations across Nepal&apos;s performing arts archive.</p>
            </div>

            <div className="adm-intro-cta">
              <Link href="/admin/create-user" className="adm-primary-cta">
                <Icon name="plus" />
                <span>Provision Theatre Account</span>
              </Link>
            </div>
          </div>

          {/* 4 Stats Cards */}
          <div className="adm-stats-grid">
            {stats.map((s) => (
              <Link href={s.href} className={`adm-stat-box ${s.accent}`} key={s.label}>
                <div className="adm-stat-box-top">
                  <span className="adm-stat-icon-wrap"><Icon name={s.icon} /></span>
                  <span className="adm-stat-badge-tag">{s.progress}</span>
                </div>
                <div className="adm-stat-number">{s.value.toLocaleString()}</div>
                <div className="adm-stat-title">{s.label}</div>
                <div className="adm-stat-subtitle">{s.note}</div>
                <div className="adm-stat-spark">
                  <div className="adm-stat-spark-bar" style={{ width: `${Math.max(12, Math.min(100, s.pct))}%` }} />
                </div>
              </Link>
            ))}
          </div>

          {/* 2-Column Main Layout */}
          <div className="adm-canvas-grid">
            {/* Left: 6 Modules */}
            <div className="adm-canvas-modules">
              <div className="adm-section-header">
                <div>
                  <h2>Platform Subsystems</h2>
                  <p>Direct navigation into database archives and controllers</p>
                </div>
                <span className="adm-section-pill">{modules.length} Core Modules</span>
              </div>

              <div className="adm-subsystems-grid">
                {modules.map((m) => (
                  <Link href={m.href} className={`adm-app-card ${m.accent}`} key={m.title}>
                    <div className="adm-app-card-header">
                      <div className="adm-app-icon-badge" style={{ background: m.gradient }}>
                        <Icon name={m.icon} />
                      </div>
                      <div className="adm-app-count-tag">
                        <strong>{m.count.toLocaleString()}</strong>
                        <span>{m.unit}</span>
                      </div>
                    </div>

                    <div className="adm-app-card-body">
                      <div className="adm-app-title">
                        <span>{m.title}</span>
                        {m.badge && <span className="adm-app-badge-alert">{m.badge}</span>}
                      </div>
                      <p className="adm-app-desc">{m.desc}</p>
                    </div>

                    <div className="adm-app-card-footer">
                      <span className="adm-app-action-label">Open module</span>
                      <span className="adm-app-action-arrow"><Icon name="arrow" /></span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Activity Stream & Unclaimed Card */}
            <div className="adm-canvas-side">
              {/* Recently Updated Theatres */}
              <div className="adm-side-card">
                <div className="adm-side-card-head">
                  <div>
                    <h2>Venue Activity</h2>
                    <p>Recent database revisions</p>
                  </div>
                  <Link href="/admin/theatres" className="adm-side-action-link">View all →</Link>
                </div>

                <div className="adm-activity-stream">
                  {recentTheatres.map((t) => (
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
                  ))}
                </div>
              </div>

              {/* Action Banner */}
              <div className="adm-spotlight-card">
                <div className="adm-spotlight-glow" />
                <div className="adm-spotlight-head">
                  <span className="adm-spotlight-pill">ACTION REQUIRED</span>
                  <span className="adm-spotlight-counter">{unclaimed} Pending</span>
                </div>
                <h3>{unclaimed} Unclaimed Venues</h3>
                <p>Assign verified accounts so theatre administrators can manage their production schedules and box office.</p>
                <Link href="/admin/theatres?unclaimed=1" className="adm-spotlight-btn">
                  <span>Match Theatre Owners</span>
                  <Icon name="arrow" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
