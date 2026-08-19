import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || "https://www.facebook.com/theatrehub.org";

  return <footer className="site-footer">
    <div className="site-container footer-grid">
      <div className="footer-brand">
        <Logo />
        <p>Nepal&apos;s theatre, all in one place. Discover productions, artists, venues, and the stories that belong on stage.</p>
      </div>
      <div className="footer-column">
        <h2>Explore</h2>
        <Link href="/play/">Plays</Link>
        <Link href="/theatre/">Theatres</Link>
        <Link href="/blog/">Stories</Link>
      </div>
      <div className="footer-column">
        <h2>TheaterHub</h2>
        <Link href="/about-us/">About us</Link>
        <Link href="/contact-us/">Contact</Link>
        <Link href="/signup/">Join TheaterHub</Link>
      </div>
      <div className="footer-column footer-connect">
        <h2>Connect</h2>
        <a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Open TheaterHub on Facebook">
          <span className="footer-social-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14.2 8.2V6.6c0-.8.5-1 1-1h2.6V2h-3.5c-3.5 0-4.7 2.1-4.7 4.6v1.6H7v4h2.6V22h4.6v-9.8h3.1l.5-4h-3.6Z" /></svg></span> Facebook
        </a>
        <p>Follow the latest plays, show announcements, and theatre stories.</p>
      </div>
    </div>
    <div className="site-container footer-bottom">
      <span>© {new Date().getFullYear()} TheaterHub. All rights reserved.</span>
      <span>Stories belong on stage.</span>
    </div>
  </footer>;
}
