"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

type NavLink = { label: string; href: string };
type NavUser = { username: string; isStaff: boolean; profileSlug?: string | null } | null;

export function Navbar({ links, user, logoutAction }: { links: NavLink[]; user: NavUser; logoutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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

  if (pathname === "/login/" || pathname === "/login" || pathname === "/signup/" || pathname === "/signup") return null;

  return <header className={`navbar${scrolled ? " is-scrolled" : ""}${open ? " menu-open" : ""}`}>
    <div className="site-container nav-inner">
      <Logo />
      <nav className="nav-desktop" aria-label="Primary navigation">
        {links.map(link => <Link aria-current={isActive(link.href) ? "page" : undefined} className={isActive(link.href) ? "is-active" : ""} href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>
      <div className="nav-actions">
        {user ? <details className="nav-account">
          <summary aria-label="Open account menu"><span className="nav-avatar">{user.username.slice(0, 1).toUpperCase()}</span><span className="nav-username">{user.username}</span></summary>
          <div className="nav-account-menu">
            {user.profileSlug && <Link href={`/profile/${user.profileSlug}/`}>Profile</Link>}
            {user.isStaff && <Link href="/admin/">Administration</Link>}
            <form action={logoutAction}><button type="submit">Logout</button></form>
          </div>
        </details> : <><Link className="nav-login" href="/login/">Login</Link><Link className="nav-signup" href="/signup/">Sign Up</Link></>}
        <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(value => !value)}>
          <span /><span /><span />
        </button>
      </div>
    </div>
    <nav className="nav-mobile" id="mobile-navigation" aria-label="Mobile navigation">
      <div className="site-container">
        {links.map(link => <Link aria-current={isActive(link.href) ? "page" : undefined} className={isActive(link.href) ? "is-active" : ""} href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}<span aria-hidden="true">→</span></Link>)}
        {!user && <><Link href="/login/" onClick={() => setOpen(false)}>Login<span aria-hidden="true">→</span></Link><Link href="/signup/" onClick={() => setOpen(false)}>Sign Up<span aria-hidden="true">→</span></Link></>}
      </div>
    </nav>
  </header>;
}
