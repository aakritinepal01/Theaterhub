"use client";

import { useRouter, usePathname } from "next/navigation";

/**
 * Shows a floating back arrow button on any page deeper than root.
 * Calls router.back() — falls back to the parent route if no history.
 */
export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Only show on detail/sub pages — not on top-level listing pages
  const topLevel = ["/", "/play", "/play/", "/theatre", "/theatre/", "/profile", "/profile/", "/blog", "/blog/", "/about-us", "/about-us/", "/contact-us", "/contact-us/", "/search", "/search/"];
  const isTop = topLevel.includes(pathname) || topLevel.includes(pathname.replace(/\/$/, ""));
  if (isTop) return null;

  // Derive sensible fallback parent from current path
  const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  const parentPath = segments.length > 1 ? `/${segments.slice(0, -1).join("/")}` : "/";

  const handleBack = () => {
    // If browser has history go back, else navigate to parent
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(parentPath);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="back-btn"
      aria-label="Go back"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
        aria-hidden="true"
      >
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      <span>Back</span>
    </button>
  );
}
