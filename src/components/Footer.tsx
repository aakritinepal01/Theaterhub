import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || "https://www.facebook.com/theatrehub.org";

  return (
    <footer className="site-footer">
      {/* ── Spotlight Hero Banner ── */}
      <div className="site-container footer-spotlight">
        <div className="footer-spotlight-content">
          <div className="footer-spotlight-badge">
            <span className="footer-badge-dot" />
            <span>Nepal Stage Archive &amp; Community</span>
          </div>

          <p className="footer-kicker">Built for Nepal&apos;s theatre community</p>
          <h2>One place for plays, theatres, stories, and show announcements.</h2>
          <p className="footer-spotlight-sub">
            Empowering audiences to discover live theatre and giving every production team in Nepal a living digital stage.
          </p>

          <div className="footer-highlights-row">
            <div className="footer-highlight-pill">🎭 50+ Plays</div>
            <div className="footer-highlight-pill">🏛️ 20+ Venues</div>
            <div className="footer-highlight-pill">⚡ Real-time Schedules</div>
            <div className="footer-highlight-pill">✨ 100% Free</div>
          </div>
        </div>

        <div className="footer-spotlight-links">
          <Link href="/play/" className="about-btn about-btn-primary about-btn-lg">
            Explore Plays <span aria-hidden="true">→</span>
          </Link>
          <Link href="/contact-us/" className="about-btn about-btn-ghost about-btn-lg">
            Share Show Updates
          </Link>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="site-container footer-grid">

        {/* Logo + Description */}
        <div className="footer-brand">
          <Logo />
          <p className="footer-brand-desc">
            Nepal&apos;s theatre scene, all in one place. Discover productions, artists, venues, and the stories that belong on stage.
          </p>
          <div className="footer-notes">
            <span>🎭 Plays</span>
            <span>🏛️ Theatres</span>
            <span>📖 Stories</span>
            <span>🇳🇵 Nepal</span>
          </div>
        </div>

        {/* Explore Column */}
        <div className="footer-column">
          <h3 className="footer-col-heading">Explore</h3>
          <ul className="footer-links">
            <li><Link href="/play/">Plays Catalog</Link></li>
            <li><Link href="/theatre/">Theatre Venues</Link></li>
            <li><Link href="/blog/">Stories &amp; Articles</Link></li>
            <li><Link href="/search/">Search Archive</Link></li>
          </ul>
        </div>

        {/* TheatreHub Column */}
        <div className="footer-column">
          <h3 className="footer-col-heading">TheatreHub</h3>
          <ul className="footer-links">
            <li><Link href="/about-us/">About Us</Link></li>
            <li><Link href="/contact-us/">Contact Team</Link></li>
            <li><Link href="/signup/">Join TheatreHub</Link></li>
            <li><Link href="/login/">Sign In</Link></li>
          </ul>
        </div>

        {/* For Theatre Teams Column */}
        <div className="footer-column">
          <h3 className="footer-col-heading">For Theatre Teams</h3>
          <ul className="footer-links">
            <li><Link href="/signup/">Create Profile</Link></li>
            <li><Link href="/contact-us/">Submit Show Dates</Link></li>
            <li><Link href="/contact-us/">Register Venue</Link></li>
            <li><Link href="/blog/">Submit Story Pitch</Link></li>
          </ul>
        </div>

        {/* Connect Column */}
        <div className="footer-column footer-connect">
          <h3 className="footer-col-heading">Connect</h3>
          <p className="footer-connect-sub">
            Stay updated with show announcements, reviews, and theatre stories from Nepal&apos;s stage world.
          </p>
          <div className="footer-socials-row">
            <a href={facebookUrl} target="_blank" rel="noreferrer" className="footer-icon-btn footer-fb-btn" aria-label="Follow TheatreHub on Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M14.2 8.2V6.6c0-.8.5-1 1-1h2.6V2h-3.5c-3.5 0-4.7 2.1-4.7 4.6v1.6H7v4h2.6V22h4.6v-9.8h3.1l.5-4h-3.6Z" />
              </svg>
            </a>
            <a href="mailto:theatrehub.org@gmail.com" className="footer-icon-btn footer-mail-btn" aria-label="Email TheatreHub">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
            <a href="https://wa.me/9779851223023" target="_blank" rel="noreferrer" className="footer-icon-btn footer-wa-btn" aria-label="Message TheatreHub on WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* ── Footer Bottom Bar ── */}
      <div className="site-container footer-bottom">
        <span className="footer-copy">&copy; {new Date().getFullYear()} TheatreHub. All rights reserved.</span>
        <div className="footer-bottom-links">
          <Link href="/about-us/">About</Link>
          <Link href="/contact-us/">Contact</Link>
        </div>
        <span className="footer-motto">Stories belong on stage. 🎭</span>
      </div>
    </footer>
  );
}
