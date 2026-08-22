import Link from "next/link";

type LogoProps = {
  className?: string;
  compact?: boolean;
  href?: string;
};

export function Logo({ className = "", compact = false, href = "/" }: LogoProps) {
  const content = (
    <>
      <img
        src="/brand-logo.png"
        alt="TheatreHub Logo"
        className="logo-img"
      />
      {!compact && (
        <span className="logo-wordmark">
          <span>Theater</span>
          <strong>Hub</strong>
        </span>
      )}
    </>
  );

  return (
    <Link className={`logo ${className}`.trim()} href={href} aria-label="TheatreHub home">
      {content}
    </Link>
  );
}

