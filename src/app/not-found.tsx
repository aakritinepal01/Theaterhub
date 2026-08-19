import Link from "next/link";
import { PageFrame } from "@/components/SiteShell";

export default function NotFound() {
  return (
    <PageFrame>
      <div className="not-found">
        <h1>404 — Page not found</h1>
        <p>The page you requested could not be found.</p>
        <Link href="/" className="button">Go back home</Link>
      </div>
    </PageFrame>
  );
}
