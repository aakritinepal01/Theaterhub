import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MobileAdminSidebarToggle } from "@/components/MobileAdminSidebarToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminTheatreRecordActions } from "@/components/AdminTheatreManager";
import { currentUser } from "@/lib/auth";
import { mediaUrl } from "@/lib/content";
import { prisma } from "@/lib/prisma";

function formatDate(value?: Date | null) {
  if (!value) return "Not provided";
  return value.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(value?: Date | null) {
  if (!value) return "Never";
  return value.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function formatShowtime(value: Date) {
  return {
    day: value.toLocaleDateString("en-US", { day: "2-digit" }),
    month: value.toLocaleDateString("en-US", { month: "short" }),
    weekday: value.toLocaleDateString("en-US", { weekday: "short" }),
    time: value.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

function externalUrl(value: string) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function statusClass(status: string) {
  return status.toLowerCase().replace(/_/g, "-");
}

export default async function TheatreDetail({ params }: PageProps<"/admin/theatres/[id]">) {
  const user = await currentUser();
  if (!user || (!user.isStaff && !user.isSuperuser)) redirect("/login");
  if (!user.isPasswordChanged) redirect("/set-new-password");

  const { id } = await params;
  const theatreId = Number(id);
  if (!Number.isInteger(theatreId) || theatreId < 1) notFound();

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const [theatre, totalTheatres, totalPerformances, upcomingPerformanceCount, totalBookings] = await Promise.all([
    prisma.theatre.findUnique({
      where: { id: theatreId },
      include: {
        owner: {
          select: {
            firstName: true, lastName: true, username: true, email: true, isActive: true,
            isPasswordChanged: true, lastLogin: true, dateJoined: true,
          },
        },
        plays: {
          select: {
            id: true, title: true, slug: true, status: true, launchedOn: true, endedOn: true,
            duration: true, ratingAverage: true, ratingCount: true, isFeatured: true,
          },
          orderBy: [{ status: "asc" }, { title: "asc" }],
        },
        shows: {
          where: { showtime: { gte: now } },
          select: {
            id: true, showtime: true, totalSeats: true, availableSeats: true,
            play: { select: { title: true } },
            _count: { select: { bookings: true } },
          },
          orderBy: { showtime: "asc" },
          take: 6,
        },
        showsMeta: {
          select: {
            id: true, startDate: true, endDate: true, sunday: true, monday: true,
            tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true,
            play: { select: { title: true } },
            _count: { select: { excludeDates: true, extraShows: true } },
          },
          orderBy: { startDate: "desc" },
        },
      },
    }),
    prisma.theatre.count(),
    prisma.show.count({ where: { theatreId } }),
    prisma.show.count({ where: { theatreId, showtime: { gte: now } } }),
    prisma.booking.count({ where: { show: { theatreId } } }),
  ]);

  if (!theatre) notFound();

  const publishedPlays = theatre.plays.filter((play) => play.status === "PUBLISHED").length;
  const activeSchedules = theatre.showsMeta.filter((schedule) => schedule.endDate >= today).length;
  const ownerName = theatre.owner
    ? `${theatre.owner.firstName} ${theatre.owner.lastName}`.trim() || theatre.owner.username
    : "Not assigned";
  const websiteUrl = externalUrl(theatre.linkWebsite);
  const publicUrl = theatre.slug ? `/theatre/${theatre.slug}` : null;
  const venueLogo = mediaUrl(theatre.profilePic);
  const socialLinks = [
    { label: "Facebook", value: theatre.linkFacebook },
    { label: "Instagram", value: theatre.linkInstagram },
    { label: "X / Twitter", value: theatre.linkTwitter },
  ].filter((item) => item.value);
  const profileChecks = [
    { label: "URL slug", ready: Boolean(theatre.slug) },
    { label: "venue address", ready: Boolean(theatre.address.trim()) },
    { label: "phone number", ready: Boolean(theatre.phone.trim()) },
    { label: "email address", ready: Boolean(theatre.email.trim()) },
    { label: "website", ready: Boolean(theatre.linkWebsite.trim()) },
    { label: "established date", ready: Boolean(theatre.establishedOn) },
    { label: "venue description", ready: Boolean(theatre.about.trim() || theatre.description.trim()) },
    { label: "venue logo", ready: Boolean(theatre.profilePic) },
    { label: "cover image", ready: Boolean(theatre.coverImage) },
  ];
  const completedProfileFields = profileChecks.filter((item) => item.ready).length;
  const profileCompleteness = Math.round((completedProfileFields / profileChecks.length) * 100);
  const missingProfileFields = profileChecks.filter((item) => !item.ready);
  const venueFields = [
    { label: "Official name", value: theatre.title, icon: "T", href: null },
    { label: "URL slug", value: theatre.slug || "Not configured", icon: "/", href: null },
    { label: "Address / location", value: theatre.address || "Not provided", icon: "⌖", href: null },
    { label: "Phone number", value: theatre.phone || "Not provided", icon: "P", href: theatre.phone ? `tel:${theatre.phone}` : null },
    { label: "Email address", value: theatre.email || "Not provided", icon: "@", href: theatre.email ? `mailto:${theatre.email}` : null },
    { label: "Website", value: theatre.linkWebsite || "Not provided", icon: "W", href: websiteUrl },
    { label: "Established", value: formatDate(theatre.establishedOn), icon: "E", href: null },
    { label: "Last updated", value: formatDate(theatre.updated), icon: "U", href: null },
  ];
  const theatreActionRecord = {
    id: theatre.id,
    title: theatre.title,
    slug: theatre.slug,
    status: theatre.status,
    metaTitle: theatre.metaTitle,
    description: theatre.description,
    keywordsString: theatre.keywordsString,
    about: theatre.about,
    profilePic: theatre.profilePic,
    coverImage: theatre.coverImage,
    coverUrl: mediaUrl(theatre.coverImage) ?? venueLogo ?? "/brand-logo-light.png",
    logoUrl: venueLogo ?? mediaUrl(theatre.coverImage) ?? "/brand-logo-light.png",
    establishedOn: theatre.establishedOn?.toISOString() ?? null,
    closedOn: theatre.closedOn?.toISOString() ?? null,
    publishDate: theatre.publishDate?.toISOString() ?? null,
    expiryDate: theatre.expiryDate?.toISOString() ?? null,
    inSitemap: theatre.inSitemap,
    email: theatre.email,
    phone: theatre.phone,
    address: theatre.address,
    linkWebsite: theatre.linkWebsite,
    linkFacebook: theatre.linkFacebook,
    linkTwitter: theatre.linkTwitter,
    linkInstagram: theatre.linkInstagram,
    updated: theatre.updated?.toISOString() ?? null,
    owner: theatre.owner ? { username: theatre.owner.username, email: theatre.owner.email } : null,
    related: {
      plays: theatre.plays.length,
      schedules: theatre.showsMeta.length,
      shows: totalPerformances,
      bookings: totalBookings,
    },
  };

  return (
    <main className="adm-inner-shell">
      <aside className="adm-inner-dock">
        <div className="adm-inner-brand">
          <Link href="/" className="adm-inner-brand-link">
            <img src="/brand-logo-light.png" alt="TheaterHub" className="adm-inner-brand-img" />
            <div><strong>TheaterHub</strong><small>STUDIO CONSOLE</small></div>
          </Link>
        </div>

        <nav className="adm-inner-nav" aria-label="Admin navigation">
          <div className="adm-inner-nav-group">
            <span className="adm-inner-nav-label">WORKSPACE</span>
            <Link href="/admin" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <span>Overview</span>
            </Link>
            <Link href="/admin/theatres" className="adm-inner-nav-item is-active" aria-current="page">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>
              <span>Theatres</span><span className="adm-inner-nav-pill">{totalTheatres}</span>
            </Link>
            <Link href="/admin/plays" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></svg>
              <span>Productions</span>
            </Link>
            <Link href="/admin/schedules" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>
              <span>Schedules</span>
            </Link>
            <Link href="/admin/profiles" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
              <span>Artists</span>
            </Link>
          </div>
          <div className="adm-inner-nav-group">
            <span className="adm-inner-nav-label">TOOLS</span>
            <Link href="/admin/create-user" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Create User</span>
            </Link>
            <Link href="/admin/entries" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16v16H4zM4 14h4l2 3h4l2-3h4"/></svg>
              <span>Form Inbox</span>
            </Link>
          </div>
        </nav>

        <div className="adm-inner-dock-foot">
          <span className="adm-inner-user-dot">{user.username.slice(0, 1).toUpperCase()}</span>
          <div className="adm-inner-user-info"><strong>{user.firstName || user.username}</strong><small>{user.isSuperuser ? "Superadmin" : "Staff"}</small></div>
          <form action="/api/auth/logout" method="post" className="adm-inner-logout-form">
            <button type="submit" className="adm-inner-logout-btn" title="Log out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 5H5v14h5"/><path d="M14 8l4 4-4 4M18 12H9"/></svg><span>Log out</span>
            </button>
          </form>
        </div>
      </aside>

      <section className="adm-inner-main">
        <header className="adm-inner-topbar">
          <div className="adm-inner-breadcrumb">
            <Link href="/admin" className="adm-inner-bc-link">Console</Link><span className="adm-inner-bc-sep">/</span>
            <Link href="/admin/theatres" className="adm-inner-bc-link">Theatres</Link><span className="adm-inner-bc-sep">/</span>
            <strong>{theatre.title}</strong>
          </div>
          <div className="adm-inner-topbar-right">
            <MobileAdminSidebarToggle /><ThemeToggle showLabel={false} />
            <AdminTheatreRecordActions theatre={theatreActionRecord} />
            {publicUrl ? (
              <Link href={publicUrl} target="_blank" rel="noopener noreferrer" className="adm-inner-action-btn">View public page <span aria-hidden="true">↗</span></Link>
            ) : (
              <span className="adm-theatre-detail-public-disabled" title="Add a URL slug to enable the public page">Public page unavailable</span>
            )}
          </div>
        </header>

        <div className="adm-inner-content adm-theatre-detail-page">
          <section className="adm-theatre-detail-hero">
            <div className="adm-theatre-detail-hero-content">
              <div className="adm-theatre-detail-logo">
                {venueLogo ? <img src={venueLogo} alt={`${theatre.title} logo`} /> : <span>{theatre.title.slice(0, 1).toUpperCase()}</span>}
              </div>
              <div className="adm-theatre-detail-title-block">
                <span className="adm-theatre-detail-eyebrow">Theatre #{theatre.id}</span>
                <h1>{theatre.title}</h1>
                <p>{theatre.address || "Address not provided"}</p>
              </div>
              <div className="adm-theatre-detail-hero-badges">
                <span className={`adm-theatre-detail-status is-${statusClass(theatre.status)}`}><i /> {theatre.status}</span>
                <span className={`adm-theatre-detail-status ${theatre.owner ? "is-linked" : "is-unclaimed"}`}><i /> {theatre.owner ? "Account linked" : "Unclaimed venue"}</span>
              </div>
            </div>
          </section>

          <section className="adm-theatre-detail-stats" aria-label="Venue summary">
            <div className="adm-theatre-detail-stat"><span className="is-crimson">{theatre.plays.length}</span><div><strong>Productions</strong><small>{publishedPlays} published</small></div></div>
            <div className="adm-theatre-detail-stat"><span className="is-blue">{theatre.showsMeta.length}</span><div><strong>Schedules</strong><small>{activeSchedules} currently active</small></div></div>
            <div className="adm-theatre-detail-stat"><span className="is-violet">{totalPerformances}</span><div><strong>Performances</strong><small>{upcomingPerformanceCount} upcoming</small></div></div>
            <div className="adm-theatre-detail-stat"><span className="is-emerald">{profileCompleteness}%</span><div><strong>Profile complete</strong><small>{completedProfileFields} of {profileChecks.length} key fields</small></div></div>
          </section>

          <div className="adm-theatre-detail-layout">
            <div className="adm-theatre-detail-main-column">
              <section className="adm-theatre-detail-card">
                <div className="adm-theatre-detail-card-head">
                  <div><span className="adm-theatre-detail-kicker">Venue profile</span><h2>Metadata & contact details</h2></div>
                  <span className={`adm-theatre-detail-record-status is-${statusClass(theatre.status)}`}>{theatre.status}</span>
                </div>
                <div className="adm-theatre-detail-field-grid">
                  {venueFields.map((field) => (
                    <div className={`adm-theatre-detail-field${field.value === "Not provided" || field.value === "Not configured" ? " is-missing" : ""}`} key={field.label}>
                      <span className="adm-theatre-detail-field-icon" aria-hidden="true">{field.icon}</span>
                      <div>
                        <small>{field.label}</small>
                        {field.href ? <a href={field.href} target={field.href.startsWith("http") ? "_blank" : undefined} rel={field.href.startsWith("http") ? "noopener noreferrer" : undefined}>{field.value}</a> : <strong>{field.value}</strong>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="adm-theatre-detail-description">
                  <small>About this venue</small>
                  <p>{theatre.about || theatre.description || "No venue description has been added yet. Add an overview so visitors understand the venue's history, facilities, and programming."}</p>
                </div>
                <div className="adm-theatre-detail-meta-footer">
                  <span>Created <strong>{formatDate(theatre.created)}</strong></span>
                  <span>Publish date <strong>{formatDate(theatre.publishDate)}</strong></span>
                  <span>In sitemap <strong>{theatre.inSitemap ? "Yes" : "No"}</strong></span>
                  <span>Auto description <strong>{theatre.genDescription ? "On" : "Off"}</strong></span>
                </div>
              </section>

              <section className="adm-theatre-detail-card">
                <div className="adm-theatre-detail-card-head">
                  <div><span className="adm-theatre-detail-kicker is-crimson">Production archive</span><h2>Registered plays <em>{theatre.plays.length}</em></h2></div>
                  <Link href="/admin/plays" className="adm-theatre-detail-head-link">Open all productions →</Link>
                </div>
                {theatre.plays.length ? (
                  <div className="adm-theatre-detail-table-wrap">
                    <table className="adm-theatre-detail-table">
                      <thead><tr><th>Production</th><th>Status</th><th>Run</th><th>Rating</th><th><span className="sr-only">Action</span></th></tr></thead>
                      <tbody>
                        {theatre.plays.map((play) => (
                          <tr key={play.id}>
                            <td><div className="adm-theatre-detail-production-title"><span>{play.title.slice(0, 1).toUpperCase()}</span><div><strong>{play.title}</strong><small>Play #{play.id}{play.isFeatured ? " · Featured" : ""}</small></div></div></td>
                            <td><span className={`adm-theatre-detail-table-status is-${statusClass(play.status)}`}>{play.status}</span></td>
                            <td><strong className="adm-theatre-detail-table-primary">{formatDate(play.launchedOn)}</strong><small className="adm-theatre-detail-table-secondary">{play.duration ? `${play.duration} min` : play.endedOn ? `Ended ${formatDate(play.endedOn)}` : "Duration not set"}</small></td>
                            <td><span className="adm-theatre-detail-rating"><b aria-hidden="true">★</b> {play.ratingAverage.toFixed(1)}</span><small className="adm-theatre-detail-table-secondary">{play.ratingCount} {play.ratingCount === 1 ? "rating" : "ratings"}</small></td>
                            <td>{play.slug && play.status === "PUBLISHED" ? <Link href={`/play/${play.slug}`} target="_blank" rel="noopener noreferrer" className="adm-theatre-detail-row-link" aria-label={`View ${play.title} on site`}>↗</Link> : <span className="adm-theatre-detail-row-link is-disabled" title="Public page unavailable">—</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="adm-theatre-detail-empty"><span aria-hidden="true">◇</span><strong>No productions registered</strong><p>Productions connected to this venue will appear here.</p></div>
                )}
              </section>

              <section className="adm-theatre-detail-card">
                <div className="adm-theatre-detail-card-head">
                  <div><span className="adm-theatre-detail-kicker is-blue">Performance calendar</span><h2>Schedule records <em>{theatre.showsMeta.length}</em></h2></div>
                  <Link href="/admin/schedules" className="adm-theatre-detail-head-link is-blue">Open schedules →</Link>
                </div>
                {theatre.showsMeta.length ? (
                  <div className="adm-theatre-detail-schedule-list">
                    {theatre.showsMeta.slice(0, 5).map((schedule) => {
                      const slots = [["Sun", schedule.sunday], ["Mon", schedule.monday], ["Tue", schedule.tuesday], ["Wed", schedule.wednesday], ["Thu", schedule.thursday], ["Fri", schedule.friday], ["Sat", schedule.saturday]].filter((slot) => slot[1]);
                      const isActive = schedule.endDate >= today;
                      return (
                        <article className="adm-theatre-detail-schedule" key={schedule.id}>
                          <div><span className={`adm-theatre-detail-schedule-dot ${isActive ? "is-active" : ""}`} /><div><strong>{schedule.play.title}</strong><small>Schedule #{schedule.id} · {isActive ? "Active" : "Ended"}</small></div></div>
                          <div className="adm-theatre-detail-schedule-dates"><small>Date range</small><strong>{formatDate(schedule.startDate)} — {formatDate(schedule.endDate)}</strong></div>
                          <div className="adm-theatre-detail-schedule-slots">
                            {slots.length ? slots.slice(0, 3).map(([day, time]) => <span key={day}><b>{day}</b> {time}</span>) : <span className="is-empty">No weekly slots</span>}
                            {slots.length > 3 && <span>+{slots.length - 3} more</span>}
                          </div>
                          <div className="adm-theatre-detail-schedule-adjustments"><span>{schedule._count.excludeDates} exclusions</span><span>{schedule._count.extraShows} extras</span></div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="adm-theatre-detail-empty"><span aria-hidden="true">□</span><strong>No schedule records</strong><p>Recurring performance schedules will appear here.</p></div>
                )}
              </section>
            </div>

            <aside className="adm-theatre-detail-side-column">
              <section className="adm-theatre-detail-card adm-theatre-detail-owner-card">
                <div className="adm-theatre-detail-card-head">
                  <div><span className="adm-theatre-detail-kicker is-emerald">Access & ownership</span><h2>Owner account</h2></div>
                  <span className={`adm-theatre-detail-owner-state ${theatre.owner?.isActive ? "is-active" : ""}`}>{theatre.owner?.isActive ? "Active" : theatre.owner ? "Inactive" : "Unlinked"}</span>
                </div>
                {theatre.owner ? (
                  <>
                    <div className="adm-theatre-detail-owner-profile"><span>{ownerName.slice(0, 1).toUpperCase()}</span><div><strong>{ownerName}</strong><small>{theatre.owner.email || theatre.owner.username}</small></div></div>
                    <dl className="adm-theatre-detail-owner-facts">
                      <div><dt>Username</dt><dd>{theatre.owner.username}</dd></div>
                      <div><dt>Joined</dt><dd>{formatDate(theatre.owner.dateJoined)}</dd></div>
                      <div><dt>Last login</dt><dd>{formatDateTime(theatre.owner.lastLogin)}</dd></div>
                      <div><dt>Password setup</dt><dd>{theatre.owner.isPasswordChanged ? "Completed" : "Action required"}</dd></div>
                    </dl>
                    <div className="adm-theatre-detail-linked-note"><span aria-hidden="true">✓</span><p><strong>Account linked</strong>This owner can manage the venue dashboard and its production records.</p></div>
                  </>
                ) : (
                  <div className="adm-theatre-detail-unclaimed"><span aria-hidden="true">!</span><strong>This venue is unclaimed</strong><p>Assigning an owner gives the theatre administrator access to venue, production, and schedule management.</p><Link href={`/admin/create-user?theatreName=${encodeURIComponent(theatre.title)}`} className="adm-inner-action-btn">Provision owner account</Link></div>
                )}
              </section>

              <section className="adm-theatre-detail-card">
                <div className="adm-theatre-detail-card-head"><div><span className="adm-theatre-detail-kicker is-violet">Data quality</span><h2>Profile completeness</h2></div><strong className="adm-theatre-detail-completeness-number">{profileCompleteness}%</strong></div>
                <div className="adm-theatre-detail-progress" role="progressbar" aria-label="Venue profile completeness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={profileCompleteness}><span style={{ width: `${profileCompleteness}%` }} /></div>
                {missingProfileFields.length ? (
                  <div className="adm-theatre-detail-missing-list"><small>Recommended next steps</small>{missingProfileFields.slice(0, 5).map((field) => <span key={field.label}><i aria-hidden="true">+</i> Add {field.label}</span>)}{missingProfileFields.length > 5 && <em>+{missingProfileFields.length - 5} more incomplete fields</em>}</div>
                ) : <div className="adm-theatre-detail-complete-note">All key venue fields are complete.</div>}
              </section>

              <section className="adm-theatre-detail-card">
                <div className="adm-theatre-detail-card-head"><div><span className="adm-theatre-detail-kicker is-blue">Next on stage</span><h2>Upcoming shows</h2></div><strong className="adm-theatre-detail-upcoming-count">{upcomingPerformanceCount}</strong></div>
                {theatre.shows.length ? (
                  <div className="adm-theatre-detail-upcoming-list">
                    {theatre.shows.map((show) => {
                      const showtime = formatShowtime(show.showtime);
                      const soldSeats = Math.max(0, show.totalSeats - show.availableSeats);
                      return <article key={show.id}><time dateTime={show.showtime.toISOString()}><strong>{showtime.day}</strong><span>{showtime.month}</span></time><div><strong>{show.play.title}</strong><small>{showtime.weekday} · {showtime.time}</small><span>{show.availableSeats} seats available · {soldSeats} sold</span></div><b title={`${show._count.bookings} bookings`}>{show._count.bookings}</b></article>;
                    })}
                    {upcomingPerformanceCount > theatre.shows.length && <p className="adm-theatre-detail-more-shows">+{upcomingPerformanceCount - theatre.shows.length} more upcoming performances</p>}
                  </div>
                ) : <div className="adm-theatre-detail-empty is-compact"><span aria-hidden="true">○</span><strong>No upcoming shows</strong><p>Future dated performances will appear here.</p></div>}
              </section>

              <section className="adm-theatre-detail-card">
                <div className="adm-theatre-detail-card-head"><div><span className="adm-theatre-detail-kicker">Public presence</span><h2>Links & visibility</h2></div></div>
                <div className="adm-theatre-detail-public-list">
                  <div><span>Public page</span>{publicUrl ? <Link href={publicUrl} target="_blank">Open page ↗</Link> : <strong>Slug required</strong>}</div>
                  <div><span>Search engines</span><strong>{theatre.inSitemap ? "Included" : "Hidden"}</strong></div>
                  <div><span>Website</span>{websiteUrl ? <a href={websiteUrl} target="_blank" rel="noopener noreferrer">Visit site ↗</a> : <strong>Not linked</strong>}</div>
                </div>
                {socialLinks.length ? <div className="adm-theatre-detail-socials">{socialLinks.map((social) => <a href={externalUrl(social.value) ?? "#"} target="_blank" rel="noopener noreferrer" key={social.label}>{social.label} ↗</a>)}</div> : <p className="adm-theatre-detail-no-socials">No social media profiles have been linked.</p>}
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
