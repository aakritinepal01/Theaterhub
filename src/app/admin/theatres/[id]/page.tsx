import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileAdminSidebarToggle } from "@/components/MobileAdminSidebarToggle";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const show = (value: unknown) =>
  value instanceof Date ? value.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : String(value || "—");

export default async function TheatreDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user || (!user.isStaff && !user.isSuperuser)) redirect("/login");
  if (!user.isPasswordChanged) redirect("/set-new-password");

  const { id } = await params;
  const theatre = await prisma.theatre.findUnique({
    where: { id: Number(id) },
    include: {
      owner: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          lastLogin: true,
          dateJoined: true,
        },
      },
      plays: { orderBy: { title: "asc" } },
      shows: { include: { play: true }, orderBy: { showtime: "desc" } },
      showsMeta: {
        include: { play: true, excludeDates: true, extraShows: true },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!theatre) notFound();

  const totalTheatres = await prisma.theatre.count();

  const fields: Array<[string, unknown]> = [
    ["Official Name", theatre.title],
    ["URL Slug", theatre.slug],
    ["Address / Location", theatre.address],
    ["Phone Number", theatre.phone],
    ["Email Address", theatre.email],
    ["Website Link", theatre.linkWebsite],
    ["Established Date", theatre.establishedOn],
    ["Publishing Status", theatre.status],
  ];

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
            <Link href="/admin/theatres" className="adm-inner-nav-item is-active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>
              <span>Theatres</span>
              <span className="adm-inner-nav-pill">{totalTheatres}</span>
            </Link>
            <Link href="/admin/plays" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></svg>
              <span>Productions</span>
            </Link>
            <Link href="/admin/profiles" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 1 0 7.75"/></svg>
              <span>Artists</span>
            </Link>
          </div>

          <div className="adm-inner-nav-group">
            <span className="adm-inner-nav-label">TOOLS</span>
            <Link href="/admin/create-user" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Create User</span>
            </Link>
            <Link href="/admin/entries" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4zM4 14h4l2 3h4l2-3h4"/></svg>
              <span>Form Inbox</span>
            </Link>
          </div>
        </nav>

        <div className="adm-inner-dock-foot">
          <span className="adm-inner-user-dot">{user.username.slice(0,1).toUpperCase()}</span>
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
            <Link href="/admin/theatres" className="adm-inner-bc-link">Theatres</Link>
            <span className="adm-inner-bc-sep">/</span>
            <strong>{theatre.title}</strong>
          </div>
          <div className="adm-inner-topbar-right">
            <MobileAdminSidebarToggle />
            <ThemeToggle showLabel={false} />
            <Link href={`/theatre/${theatre.slug}`} target="_blank" rel="noopener noreferrer" className="adm-inner-action-btn">
              View Public Page ↗
            </Link>
          </div>
        </header>

        <div className="adm-inner-content">
          {/* Header Banner */}
          <div className="adm-inner-page-header">
            <div className="adm-inner-page-icon is-theatres">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 27.5h24M6.5 25.5h19M8 12h16v13.5H8z" fill="currentColor" opacity="0.08" />
                <path d="M4 12h24L16 4zM8 12v13.5M24 12v13.5M11 15v7M16 15v7M21 15v7M6.5 25.5h19M4 28h24" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1>{theatre.title}</h1>
                {theatre.owner ? (
                  <span className="adm-inner-unclaimed-text" style={{ color: "var(--adm-emerald)" }}>✓ Account Linked</span>
                ) : (
                  <span className="adm-inner-unclaimed-text">● Unclaimed</span>
                )}
              </div>
              <p>{theatre.address || "No address listed"} · Registered ID #{theatre.id}</p>
            </div>
          </div>

          {/* 2-Column Detail Grid */}
          <div className="adm-form-layout">
            {/* Left: General Info */}
            <div className="adm-form-main-card">
              <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 800 }}>Venue Metadata</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                {fields.map(([key, value]) => (
                  <div key={key} style={{ padding: "10px 12px", borderRadius: "8px", background: "var(--adm-surface-subtle)" }}>
                    <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{key}</span>
                    <strong style={{ display: "block", marginTop: "3px", fontSize: "13px", color: "var(--adm-text)" }}>{show(value)}</strong>
                  </div>
                ))}
              </div>

              {theatre.about && (
                <div style={{ marginTop: "20px", padding: "14px", borderRadius: "8px", background: "var(--adm-surface-subtle)" }}>
                  <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>About Venue</span>
                  <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "var(--adm-text)" }}>{theatre.about}</p>
                </div>
              )}
            </div>

            {/* Right: Owner Account Card */}
            <div className="adm-form-info-card">
              <h3>Owner Account Status</h3>
              {theatre.owner ? (
                <div className="adm-form-info-steps">
                  <div className="adm-form-step">
                    <span className="adm-form-step-num">✓</span>
                    <div>
                      <strong>Account Linked</strong>
                      <p><strong>{theatre.owner.username}</strong> ({theatre.owner.email})</p>
                    </div>
                  </div>
                  <div className="adm-form-step">
                    <span className="adm-form-step-num">i</span>
                    <div>
                      <strong>Owner Full Name</strong>
                      <p>{theatre.owner.firstName || "—"} {theatre.owner.lastName || ""}</p>
                    </div>
                  </div>
                  <div className="adm-form-step">
                    <span className="adm-form-step-num">📅</span>
                    <div>
                      <strong>Last Login</strong>
                      <p>{show(theatre.owner.lastLogin)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: "var(--adm-muted)", fontSize: "13px", lineHeight: "1.5" }}>
                    This theatre venue has not been claimed by an owner account yet. Provisioning an account will give the theatre administrator full control over their venue dashboard.
                  </p>
                  <Link
                    href={`/admin/create-user?theatreName=${encodeURIComponent(theatre.title)}`}
                    className="adm-inner-action-btn"
                    style={{ marginTop: "14px", width: "100%", justifyContent: "center" }}
                  >
                    Provision Owner Account
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Plays Section */}
          <div className="adm-inner-table-card" style={{ marginTop: "24px" }}>
            <div className="adm-inner-table-head-row">
              <span className="adm-inner-table-title">Registered Plays ({theatre.plays.length})</span>
            </div>
            <div className="adm-inner-table-wrap">
              <table className="adm-inner-table">
                <thead>
                  <tr>
                    <th>Play Title</th>
                    <th>Status</th>
                    <th>Launched Date</th>
                    <th>Rating</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {theatre.plays.map((play) => (
                    <tr key={play.id}>
                      <td>
                        <strong className="adm-inner-link-strong">{play.title}</strong>
                      </td>
                      <td>
                        <span className="adm-inner-count-badge" style={{ background: "var(--adm-amber-bg)", color: "var(--adm-amber)" }}>{play.status}</span>
                      </td>
                      <td className="adm-inner-cell-muted">{show(play.launchedOn)}</td>
                      <td>★ {play.ratingAverage || "0.0"}</td>
                      <td>
                        <Link href={`/play/${play.slug}/`} target="_blank" rel="noopener noreferrer" className="adm-inner-row-action">
                          View on site ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!theatre.plays.length && (
                <div className="adm-inner-empty">
                  <p>No registered plays for this venue yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
