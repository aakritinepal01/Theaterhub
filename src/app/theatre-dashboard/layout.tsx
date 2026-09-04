import { ReactNode } from "react";
import Link from "next/link";
import { getOwnerTheatre, formatDate } from "@/lib/theatre-dashboard";
import { TheatreDashboardNav } from "@/components/TheatreDashboardNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function TheatreDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, theatre } = await getOwnerTheatre();

  if (!theatre) {
    return (
      <main className="manage-page">
        <div className="manage-shell">
          <h1>Access denied</h1>
          <p>No theatre is assigned to this account. Contact the administrator.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="owner-dashboard">
      <aside className="owner-sidebar">
        <Link className="owner-brand" href="/">
          <span>TH</span>
          <strong>Owner Studio</strong>
        </Link>
        <TheatreDashboardNav
          playsCount={theatre.plays.length}
          schedulesCount={theatre.showsMeta.length}
          slug={theatre.slug}
        />
        <div className="owner-account">
          <span>{user.username.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user.username}</strong>
            <small>ID: #{user.id} · {theatre.title}</small>
          </div>
        </div>
      </aside>

      <section className="owner-workspace">
        <header className="owner-topbar">
          <div>
            <span className="owner-status">
              <i />Logged in as: <strong>{user.username}</strong> (ID: #{user.id})
            </span>
            <small>Theatre: {theatre.title} · Last updated {formatDate(theatre.updated)}</small>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ThemeToggle />
            {theatre.slug && (
              <Link href={`/theatre/${theatre.slug}`} target="_blank" rel="noopener noreferrer">
                View public page
              </Link>
            )}
            <form action="/api/auth/logout" method="post">
              <button>Log out</button>
            </form>
          </div>
        </header>

        <div className="owner-content">
          {children}
        </div>
      </section>
    </main>
  );
}
