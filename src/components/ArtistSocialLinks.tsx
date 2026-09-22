import styles from "./ArtistSocialLinks.module.css";

type ArtistLinks = { linkFacebook: string; linkInstagram: string; linkTwitter: string; linkWebsite: string };

const platforms = [
  { field: "linkFacebook", label: "Facebook", style: "facebook", path: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.49 0-1.956.931-1.956 1.887v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" },
  { field: "linkInstagram", label: "Instagram", style: "instagram" },
  { field: "linkTwitter", label: "X / Twitter", style: "twitter", path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933Zm-1.29 19.49h2.039L6.487 3.24H4.3l13.31 17.403Z" },
  { field: "linkWebsite", label: "Website", style: "website" },
] as const;

export function ArtistSocialLinks({ artist }: { artist: ArtistLinks }) {
  const links = platforms.flatMap(platform => {
    const raw = artist[platform.field].trim();
    if (!raw) return [];
    try {
      const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      if (!url.hostname.includes(".")) return [];
      return [{ ...platform, href: url.href }];
    } catch { return []; }
  });
  if (!links.length) return null;

  return <nav className={styles.links} aria-label="Artist social links">
    {links.map(platform => <a key={platform.field} href={platform.href} className={`${styles.link} ${styles[platform.style]}`} target="_blank" rel="noopener noreferrer" aria-label={`${platform.label} (opens in a new tab)`} title={platform.label}>
      <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" fill="none">
        {"path" in platform ? <path d={platform.path} fill="currentColor" /> : platform.style === "instagram" ? <g stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></g> : <g stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6.5h14M5 17.5h14" /></g>}
      </svg>
    </a>)}
  </nav>;
}
