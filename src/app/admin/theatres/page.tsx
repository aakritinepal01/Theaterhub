import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function Theatres({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; unclaimed?: string }>;
}) {
  const user = await currentUser();
  if (!user || (!user.isStaff && !user.isSuperuser)) redirect("/login");
  if (!user.isPasswordChanged) redirect("/set-new-password");

  const q = await searchParams;
  const search = q.search?.trim();
  const rows = await prisma.theatre.findMany({
    where: {
      title: search ? { contains: search, mode: "insensitive" } : undefined,
      ownerId: q.unclaimed === "1" ? null : undefined,
    },
    select: {
      id: true,
      title: true,
      address: true,
      description: true,
      about: true,
      email: true,
      phone: true,
      linkWebsite: true,
      establishedOn: true,
      status: true,
      updated: true,
      profilePic: true,
      coverImage: true,
      owner: { select: { username: true, email: true } },
      _count: { select: { plays: true, shows: true } },
    },
    orderBy: [{ updated: "desc" }, { title: "asc" }],
  });

  const [totalTheatres, totalPlays, totalProfiles, totalSchedules, totalPosts, totalEntries] = await Promise.all([
    prisma.theatre.count(),
    prisma.play.count(),
    prisma.profile.count(),
    prisma.showsMeta.count(),
    prisma.blogPost.count(),
    prisma.formEntry.count(),
  ]);

  const claimed = await prisma.theatre.count({ where: { ownerId: { not: null } } });
  const unclaimed = totalTheatres - claimed;

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
              <span className="adm-inner-nav-pill">{totalPlays}</span>
            </Link>
            <Link href="/admin/schedules" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>
              <span>Schedules</span>
              <span className="adm-inner-nav-pill">{totalSchedules}</span>
            </Link>
            <Link href="/admin/profiles" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 1 0 7.75"/></svg>
              <span>Artists</span>
              <span className="adm-inner-nav-pill">{totalProfiles}</span>
            </Link>
            <Link href="/admin/posts" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>
              <span>Editorial</span>
              <span className="adm-inner-nav-pill">{totalPosts}</span>
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
            <strong>Theatre Venues</strong>
          </div>
          <div className="adm-inner-topbar-right">
            <ThemeToggle showLabel={false} />
            <Link href="/admin/create-user" className="adm-inner-action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Provision Account
            </Link>
          </div>
        </header>

        <div className="adm-inner-content">
          {/* Page Header */}
          <div className="adm-inner-page-header">
            <div className="adm-inner-page-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--adm-amber)", letterSpacing: "0.08em", textTransform: "uppercase" }}>VENUE DIRECTORY</span>
              <h1>Theatre Venues</h1>
              <p>Manage Nepal&apos;s performing arts venue directory, owner assignments, and stage profiles</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="adm-inner-stats">
            <div className="adm-inner-stat-item">
              <span className="adm-inner-stat-num">{totalTheatres}</span>
              <span className="adm-inner-stat-lbl">Total Venues</span>
            </div>
            <div className="adm-inner-stat-divider" />
            <div className="adm-inner-stat-item">
              <span className="adm-inner-stat-num" style={{ color: "var(--adm-emerald)" }}>{claimed}</span>
              <span className="adm-inner-stat-lbl">Claimed Accounts</span>
            </div>
            <div className="adm-inner-stat-divider" />
            <div className="adm-inner-stat-item">
              <span className="adm-inner-stat-num" style={{ color: "var(--adm-amber)" }}>{unclaimed}</span>
              <span className="adm-inner-stat-lbl">Unclaimed</span>
            </div>
            <div className="adm-inner-stat-divider" />
            <div className="adm-inner-stat-item">
              <span className="adm-inner-stat-num">{rows.length}</span>
              <span className="adm-inner-stat-lbl">Showing</span>
            </div>
          </div>

          {/* Filter Bar */}
          <form className="adm-inner-filter-bar" method="get">
            <div className="adm-inner-search-wrap">
              <svg className="adm-inner-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input name="search" defaultValue={search} placeholder="Search venue name or location..." className="adm-inner-search-input" />
            </div>
            <label className="adm-inner-filter-check">
              <input type="checkbox" name="unclaimed" value="1" defaultChecked={q.unclaimed === "1"} />
              <span>Show unclaimed only</span>
            </label>
            <button type="submit" className="adm-inner-filter-btn">Apply Filter</button>
            {(search || q.unclaimed) && (
              <Link href="/admin/theatres" className="adm-inner-clear-link">Clear</Link>
            )}
          </form>

          <div className="adm-theatre-directory-head">
            <div>
              <span>VENUE COLLECTION</span>
              <h2>{q.unclaimed === "1" ? "Unclaimed venues" : search ? `Search results for "${search}"` : "All theatre venues"}</h2>
            </div>
            <strong>{rows.length} {rows.length === 1 ? "venue" : "venues"} visible</strong>
          </div>

          {/* Visual venue directory */}
          <div className="adm-theatre-grid">
            {rows.map((t) => (
              <article className="adm-theatre-card" key={t.id}>
                <div className="adm-theatre-cover">
                  {t.coverImage ? (
                    <img src={t.coverImage} alt={`${t.title} cover`} loading="lazy" />
                  ) : (
                    <span className="adm-theatre-cover-fallback">THEATRE</span>
                  )}
                  <span className={`adm-theatre-status ${t.owner ? "is-claimed" : "is-unclaimed"}`}>
                    {t.owner ? "Claimed" : "Unclaimed"}
                  </span>
                </div>
                <div className="adm-theatre-card-body">
                  <div className="adm-theatre-card-heading">
                    <div>
                      <h2>{t.title}</h2>
                      <span>Venue ID #{t.id}</span>
                    </div>
                  </div>
                  {t.profilePic && (
                    <div className="adm-theatre-logo-strip">
                      <img src={t.profilePic} alt={`${t.title} logo`} loading="lazy" />
                      <span>Official venue logo</span>
                    </div>
                  )}
                  <p className="adm-theatre-address">{t.address || "No location listed"}</p>
                  {(t.description || t.about) && (
                    <p className="adm-theatre-description">{t.description || t.about}</p>
                  )}
                  <div className="adm-theatre-details">
                    <span><strong>{t._count.plays}</strong> plays</span>
                    <span><strong>{t._count.shows}</strong> shows</span>
                    <span><strong>{t.status.toLowerCase()}</strong></span>
                  </div>
                  {(t.email || t.phone || t.linkWebsite) && (
                    <div className="adm-theatre-contact">
                      {t.email && <span>{t.email}</span>}
                      {t.phone && <span>{t.phone}</span>}
                      {t.linkWebsite && <span>Website listed</span>}
                    </div>
                  )}
                  <div className="adm-theatre-owner">
                    <span className="adm-theatre-owner-mark">{t.owner ? t.owner.username.slice(0, 1).toUpperCase() : "!"}</span>
                    <span>{t.owner ? t.owner.email : "No owner assigned"}</span>
                  </div>
                  <div className="adm-theatre-card-footer">
                    <small>Updated {t.updated?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) || "-"}</small>
                    <Link href={`/admin/theatres/${t.id}`} className="adm-theatre-manage-link">Manage venue <span aria-hidden="true">→</span></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!rows.length && (
            <div className="adm-inner-empty adm-theatre-empty">
              <p>No venues match your current filters.</p>
              <Link href="/admin/theatres" className="adm-inner-empty-reset">Clear filters →</Link>
            </div>
          )}

          {/* Accessible data table kept for wide-screen record comparison */}
          <div className="adm-inner-table-card adm-theatre-table-card">
            <div className="adm-inner-table-head-row">
              <span className="adm-inner-table-title">
                {rows.length} {rows.length === 1 ? "Venue" : "Venues"} {search ? `matching "${search}"` : q.unclaimed === "1" ? "— unclaimed" : ""}
              </span>
            </div>
            <div className="adm-inner-table-wrap">
              <table className="adm-inner-table">
                <thead>
                  <tr>
                    <th>Theatre / Venue Name</th>
                    <th>Location</th>
                    <th>Ownership Status</th>
                    <th style={{ textAlign: "center" }}>Productions</th>
                    <th>Last Updated</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div className="adm-inner-cell-primary">
                          <span className="adm-inner-venue-avatar">{t.title.slice(0, 1).toUpperCase()}</span>
                          <div>
                            <Link href={`/admin/theatres/${t.id}`} className="adm-inner-link-strong">{t.title}</Link>
                            <small className="adm-inner-cell-sub">Registered ID #{t.id}</small>
                          </div>
                        </div>
                      </td>
                      <td className="adm-inner-cell-muted">{t.address || "—"}</td>
                      <td>
                        {t.owner ? (
                          <div className="adm-inner-owner-badge">
                            <span className="adm-inner-status-dot claimed" />
                            <div>
                              <span className="adm-inner-owner-name">{t.owner.username}</span>
                              <small className="adm-inner-owner-email">{t.owner.email}</small>
                            </div>
                          </div>
                        ) : (
                          <div className="adm-inner-owner-badge">
                            <span className="adm-inner-status-dot unclaimed-dot" />
                            <span className="adm-inner-unclaimed-text">Unclaimed</span>
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="adm-inner-count-badge">{t._count.plays}</span>
                      </td>
                      <td className="adm-inner-cell-muted">{t.updated?.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) || "—"}</td>
                      <td style={{ textAlign: "right" }}>
                        <Link href={`/admin/theatres/${t.id}`} className="adm-inner-row-action">
                          Manage Venue →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rows.length && (
                <div className="adm-inner-empty">
                  <p>No venues match your current filters.</p>
                  <Link href="/admin/theatres" className="adm-inner-empty-reset">Clear filters →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
