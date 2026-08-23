"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { BackButton } from "@/components/BackButton";

type NavLink = { label: string; href: string };
type NavUser = { username: string; isStaff: boolean; profileSlug?: string | null } | null;
type ThemeMode = "light" | "dark";

export function Navbar({ links, user, logoutAction }: { links: NavLink[]; user: NavUser; logoutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const normalize = (path: string) => path === "/" ? path : path.replace(/\/+$/, "");
  const currentPath = normalize(pathname);
  const isActive = (href: string) => {
    const target = normalize(href);
    return currentPath === target || (target !== "/" && currentPath.startsWith(`${target}/`));
  };

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 28);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    let nextTheme: ThemeMode = "light";
    try {
      nextTheme = window.localStorage.getItem("theaterhub-theme") === "dark" ? "dark" : "light";
    } catch {
      nextTheme = "light";
    }
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const toggleTheme = () => {
    setTheme(current => {
      const nextTheme: ThemeMode = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      try {
        window.localStorage.setItem("theaterhub-theme", nextTheme);
      } catch {
        // Theme still changes for the current page if persistence is unavailable.
      }
      return nextTheme;
    });
  };

  if (pathname === "/login/" || pathname === "/login" || pathname === "/signup/" || pathname === "/signup") return null;

  return <header className={`navbar${scrolled ? " is-scrolled" : ""}${open ? " menu-open" : ""}`}>
    <div className="site-container nav-inner">
      <div className="nav-logo-group">
        <BackButton />
        <Logo />
      </div>
      <nav className="nav-desktop" aria-label="Primary navigation">
        {links.map(link => <Link aria-current={isActive(link.href) ? "page" : undefined} className={isActive(link.href) ? "is-active" : ""} href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>
      <div className="nav-actions">
        <button
          className={`theme-toggle${theme === "dark" ? " is-dark" : ""}`}
          type="button"
          role="switch"
          aria-checked={theme === "dark"}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          onClick={toggleTheme}
        >
          <span className="theme-toggle-icon theme-toggle-sun" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </span>
          <span className="theme-toggle-icon theme-toggle-moon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </span>
          <span className="theme-toggle-knob" aria-hidden="true">
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="knob-icon moon-icon">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="knob-icon sun-icon">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </span>
        </button>
        {user && <details className="nav-account">
          <summary aria-label="Open account menu"><span className="nav-avatar">{user.username.slice(0, 1).toUpperCase()}</span><span className="nav-username">{user.username}</span></summary>
          <div className="nav-account-menu">
            {user.profileSlug && <Link href={`/profile/${user.profileSlug}/`}>Profile</Link>}
            {user.isStaff && <Link href="/admin/">Administration</Link>}
            <form action={logoutAction}><button type="submit">Logout</button></form>
          </div>
        </details>}
        <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(value => !value)}>
          <span /><span /><span />
        </button>
      </div>
    </div>
    <nav className="nav-mobile" id="mobile-navigation" aria-label="Mobile navigation">
      <div className="site-container">
        {links.map(link => <Link aria-current={isActive(link.href) ? "page" : undefined} className={isActive(link.href) ? "is-active" : ""} href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}<span aria-hidden="true">→</span></Link>)}
      </div>
    </nav>
  </header>;
}
