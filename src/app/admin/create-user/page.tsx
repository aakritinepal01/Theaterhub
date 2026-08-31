import { currentUser } from "@/lib/auth";
import { PasswordFields } from "@/components/PasswordFields";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { redirect } from "next/navigation";

const errors: Record<string, string> = {
  invalid: "Please complete every field with valid details. Password must be at least 8 characters.",
  mismatch: "Password and confirm password do not match.",
  duplicate: "An account with this email already exists.",
  claimed: "This theatre already has an owner account.",
  email_mismatch: "The email does not match this existing theatre record.",
  failed: "The account could not be created. Please try again.",
};

<<<<<<< HEAD
export default async function CreateUser({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await currentUser();
  if (!user || (!user.isStaff && !user.isSuperuser)) redirect("/login");
  if (!user.isPasswordChanged) redirect("/set-new-password");

  const query = await searchParams;

  return (
    <main className="adm-inner-shell">
      {/* Sidebar */}
      <aside className="adm-inner-dock">
        <div className="adm-inner-brand">
          <Link href="/" className="adm-inner-brand-link">
            <img src="/brand-logo.png" alt="TheaterHub" className="adm-inner-brand-img" />
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
            </Link>
            <Link href="/admin/plays" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></svg>
              <span>Productions</span>
            </Link>
            <Link href="/admin/profiles" className="adm-inner-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Artists</span>
            </Link>
          </div>

          <div className="adm-inner-nav-group">
            <span className="adm-inner-nav-label">TOOLS</span>
            <Link href="/admin/create-user" className="adm-inner-nav-item is-active">
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
            <strong>Provision Account</strong>
          </div>
          <div className="adm-inner-topbar-right">
            <ThemeToggle showLabel={false} />
          </div>
        </header>

        <div className="adm-inner-content">
          {/* Page Header */}
          <div className="adm-inner-page-header">
            <div className="adm-inner-page-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <div>
              <h1>Provision Theatre Account</h1>
              <p>Create a new theatre owner account with credentials and link it to a venue in the directory</p>
          <div className="adm-form-card">
            <div className="adm-form-card-header">
              <div className="adm-form-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
              </div>
              <div>
                <h2>Create Theatre Owner Account</h2>
                <p>Provision credentials and grant administrative access to a registered venue.</p>
              </div>
            </div>

            {query.error && (
              <div className="adm-form-alert error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{errors[query.error] || errors.failed}</span>
              </div>
            )}

            {query.success && (
              <div className="adm-form-alert success" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>
                  {query.success === "linked"
                    ? `Successfully linked to existing theatre: ${query.theatre}`
                    : `Successfully created new theatre: ${query.theatre}`}
                </span>
              </div>
            )}

            {query.sent && (
              <div className="adm-form-alert info" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>Credentials sent to {query.sent}</span>
              </div>
            )}

            <form className="adm-form" action="/api/admin/users" method="post">
              <div className="adm-form-field">
                <label htmlFor="theatreName">
                  Theatre / Venue Name
                  <span className="adm-required-star">*</span>
                </label>
                <input
                  id="theatreName"
                  name="theatreName"
                  type="text"
                  defaultValue={query.theatreName || ""}
                  placeholder="e.g. Mandala Theatre Nepal"
                  required
                />
                <span className="adm-field-hint">
                  If this matches an existing unclaimed theatre record, it will automatically link to this user.
                </span>
              </div>

              <div className="adm-form-field">
                <label htmlFor="email">
                  Administrator Email Address
                  <span className="adm-required-star">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="owner@theatre.org.np"
                  required
                />
                <span className="adm-field-hint">
                  Initial credentials and password reset notifications will be dispatched to this address.
                </span>
              </div>

              <div className="adm-form-divider" />

              <PasswordFields />

              <div className="adm-form-actions">
                <button type="submit" className="adm-btn-submit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
                  <span>Provision Account & Send Credentials</span>
                </button>
              </div>
            </form>

            <div className="adm-form-footer">
              <p>Looking to verify an existing theatre profile before creating an account?</p>
              <div className="adm-form-info-links">
                <Link href="/admin/theatres">Browse all venues →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
