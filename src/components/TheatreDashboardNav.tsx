"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TheatreDashboardNav({
  playsCount,
  schedulesCount,
  slug,
}: {
  playsCount: number;
  schedulesCount: number;
  slug: string | null;
}) {
  const pathname = usePathname();

  const isOverview = pathname === "/theatre-dashboard" || pathname === "/theatre-dashboard/";
  const isProfile = pathname.startsWith("/theatre-dashboard/profile");
  const isProductions = pathname.startsWith("/theatre-dashboard/productions");
  const isSchedules = pathname.startsWith("/theatre-dashboard/schedules");

  return (
    <details className="owner-mobile-nav">
      <summary>Menu</summary>
      <nav>
      <p>Workspace</p>
      <Link href="/theatre-dashboard" className={isOverview ? "is-active" : ""}>
        Overview
      </Link>
      <Link href="/theatre-dashboard/profile" className={isProfile ? "is-active" : ""}>
        Theatre profile
      </Link>
      <Link href="/theatre-dashboard/productions" className={isProductions ? "is-active" : ""}>
        Productions <span>{playsCount}</span>
      </Link>
      <Link href="/theatre-dashboard/schedules" className={isSchedules ? "is-active" : ""}>
        Schedules <span>{schedulesCount}</span>
      </Link>
      <p>Public presence</p>
      {slug ? (
        <Link href={`/theatre/${slug}`} target="_blank" rel="noopener noreferrer">
          View theatre page ↗
        </Link>
      ) : (
        <span className="owner-muted-link">Public page unavailable</span>
      )}
      </nav>
    </details>
  );
}
