import Link from "next/link";

type EditorialSection = "reviews" | "news";

const sections: Array<{
  key: EditorialSection;
  href: string;
  label: string;
  description: string;
}> = [
  {
    key: "reviews",
    href: "/reviews/",
    label: "Reviews",
    description: "Critiques & ratings",
  },
  {
    key: "news",
    href: "/blog/",
    label: "News",
    description: "Stories & updates",
  },
];

export function EditorialSectionNav({
  activeSection,
  embedded = false,
}: {
  activeSection: EditorialSection;
  embedded?: boolean;
}) {
  return (
    <div className={`editorial-section-shell${embedded ? " is-embedded" : ""}`}>
      <div className={`${embedded ? "" : "site-container "}editorial-section-inner`}>
        <nav className="editorial-section-nav" aria-label="Reviews and news">
          {sections.map((section) => {
            const isActive = section.key === activeSection;

            return (
              <Link
                key={section.key}
                href={section.href}
                className={`editorial-section-link${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="editorial-section-link-icon" aria-hidden="true">
                  {section.key === "reviews" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
                      <path d="M4 5.5v16M8 7h8M8 11h6" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 4h14v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
                      <path d="M8 8h8M8 12h8M8 16h5" />
                    </svg>
                  )}
                </span>
                <span className="editorial-section-link-copy">
                  <strong>{section.label}</strong>
                  <small>{section.description}</small>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
