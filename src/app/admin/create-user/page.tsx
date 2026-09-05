import { currentUser } from "@/lib/auth";
import { ClearCreateUserStatus } from "@/components/ClearCreateUserStatus";
import { PasswordFields } from "@/components/PasswordFields";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileAdminSidebarToggle } from "@/components/MobileAdminSidebarToggle";
import Link from "next/link";
import { redirect } from "next/navigation";

const errors: Record<string, string> = {
  invalid: "Please complete every field with valid details. Password must be at least 8 characters.",
  mismatch: "Password and confirm password do not match.",
  duplicate: "An account with this email already exists.",
  claimed: "This theatre already has an owner account.",
  db_connection: "Failed to create user — database connection issue, please try again",
  failed: "The account could not be created. Please try again.",
};

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
      {(query.success || query.sent) && <ClearCreateUserStatus />}
      {/* Sidebar Navigation */}
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
          <span className="adm-inner-user-dot">{user.username.slice(0, 1).toUpperCase()}</span>
          <div className="adm-inner-user-info">
            <strong>{user.firstName || user.username}</strong>
            <small>{user.isSuperuser ? "Superadmin" : "Staff"}</small>
          </div>
        </div>
      </aside>

      {/* Main Stage */}
      <section className="adm-inner-main">
        {/* Topbar */}
        <header className="adm-inner-topbar">
          <div className="adm-inner-breadcrumb">
            <Link href="/admin" className="adm-inner-bc-link">Console</Link>
            <span className="adm-inner-bc-sep">/</span>
            <strong>Provision Account</strong>
          </div>
          <div className="adm-inner-topbar-right">
            <MobileAdminSidebarToggle />
            <ThemeToggle showLabel={false} />
          </div>
        </header>

        <div className="adm-inner-content">
          {/* Page Banner Header */}
          <div className="adm-inner-page-header adm-page-header-fancy">
            <div className="adm-inner-page-icon is-create-user">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 27h24M6 27V12l10-6 10 6v15M10 27V16h4v11M18 27V16h4v11M4 12h24" />
                <path d="M12 12h8" />
              </svg>
            </div>
            <div>
              <div className="adm-header-badge">
                <span className="adm-badge-pulse" />
                <span>PROVISIONING STUDIO</span>
              </div>
              <h1>Provision Theatre Account</h1>
              <p>Register a theatre owner account, generate administrative credentials, and link venue management rights.</p>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="adm-create-user-layout">
            {/* Left Column: Form Card */}
            <div className="adm-form-card adm-card-accent-top">
              <div className="adm-form-card-header">
                <div className="adm-form-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
                </div>
                <div>
                  <h2>Create Owner Account</h2>
                  <p>Grant administrative ownership and provision initial credentials.</p>
                </div>
              </div>

              {/* Status Notifications */}
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
                      ? `Successfully linked account to existing venue: ${query.theatre}`
                      : `Successfully created owner account and registered venue: ${query.theatre}`}
                  </span>
                </div>
              )}

              {query.sent && (
                <div className="adm-form-alert info" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span>Initial credentials dispatched to <strong>{query.sent}</strong></span>
                </div>
              )}

              {/* Provision Form */}
              <form className="adm-form" action="/api/admin/users" method="post">
                {/* Theatre Name Field */}
                <div className="adm-form-field">
                  <label htmlFor="theatreName">
                    Theatre / Venue Name
                    <span className="adm-required-star">*</span>
                  </label>
                  <div className="adm-input-with-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="adm-input-prefix-icon"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>
                    <input
                      id="theatreName"
                      name="theatreName"
                      type="text"
                      defaultValue={query.theatreName || ""}
                      placeholder="e.g. Mandala Theatre Nepal"
                      className="has-prefix-icon"
                      required
                    />
                  </div>
                  <span className="adm-field-hint">
                    Auto-links if an unclaimed theatre record with this name already exists in the venue directory.
                  </span>
                </div>

                {/* Email Field */}
                <div className="adm-form-field">
                  <label htmlFor="email">
                    Administrator Email Address
                    <span className="adm-required-star">*</span>
                  </label>
                  <div className="adm-input-with-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="adm-input-prefix-icon"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="owner@theatre.org.np"
                      className="has-prefix-icon"
                      required
                    />
                  </div>
                  <span className="adm-field-hint">
                    Login credentials and password reset dispatches will be sent to this inbox.
                  </span>
                </div>

                <div className="adm-form-divider" />

                {/* Password Fields with Live Strength Meter */}
                <PasswordFields />

                {/* Actions */}
                <div className="adm-form-actions">
                  <button type="submit" className="adm-btn-submit adm-btn-glow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
                    <span>Provision Account & Send Credentials</span>
                  </button>
                </div>
              </form>

              <div className="adm-form-footer">
                <p>Need to verify existing venue profiles first?</p>
                <div className="adm-form-info-links">
                  <Link href="/admin/theatres">Browse venue directory →</Link>
                </div>
              </div>
            </div>

            {/* Right Column: Studio Guidance & Workflow Assistant */}
            <div className="adm-side-guide-column">
              {/* Card 1: Provisioning Workflow Steps */}
              <div className="adm-guide-card">
                <div className="adm-guide-card-header">
                  <div className="adm-guide-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                  </div>
                  <div>
                    <h3>Provisioning Workflow</h3>
                    <p>Automated provisioning sequence</p>
                  </div>
                </div>

                <div className="adm-workflow-steps">
                  <div className="adm-workflow-step">
                    <span className="adm-step-num">1</span>
                    <div>
                      <strong>Venue Verification</strong>
                      <p>System searches venue database for exact name match to auto-link record.</p>
                    </div>
                  </div>

                  <div className="adm-workflow-step">
                    <span className="adm-step-num">2</span>
                    <div>
                      <strong>Identity Provisioning</strong>
                      <p>Creates secure user record with encrypted password and admin role.</p>
                    </div>
                  </div>

                  <div className="adm-workflow-step">
                    <span className="adm-step-num">3</span>
                    <div>
                      <strong>First Login Activation</strong>
                      <p>Owner is prompted to reset initial password upon their first sign-in.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Security & Password Policy Note */}
              <div className="adm-guide-card adm-security-guide-card">
                <div className="adm-guide-card-header">
                  <div className="adm-guide-icon is-emerald">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <div>
                    <h3>Security Policy</h3>
                    <p>Access control standards</p>
                  </div>
                </div>
                <ul className="adm-security-list">
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                    Minimum 8 characters password requirement
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                    Mandatory password change on first sign-in
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                    Audited administrative action logging
                  </li>
                </ul>
              </div>

              {/* Card 3: Quick Action Navigation */}
              <div className="adm-guide-card adm-quick-action-card">
                <div className="adm-quick-action-content">
                  <div className="adm-quick-action-badge">QUICK ACCESS</div>
                  <h4>Manage Registered Venues</h4>
                  <p>View, edit owner links, or update stage profiles in the venue directory.</p>
                  <Link href="/admin/theatres" className="adm-quick-action-btn">
                    <span>View Venue Directory</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
