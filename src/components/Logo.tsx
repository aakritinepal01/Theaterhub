import Link from "next/link";

type LogoProps = {
  className?: string;
  compact?: boolean;
  href?: string;
  variant?: "auto" | "light" | "dark";
};

export function Logo({ className = "", compact = false, href = "/", variant = "auto" }: LogoProps) {
  const content = (
    <>
      <span className="logo-img-wrapper">
        <img
          src="/brand-logo-light.png"
          alt="TheatreHub Logo"
          className="logo-img logo-img-light"
        />
        <img
          src="/brand-logo-dark.png"
          alt="TheatreHub Logo"
          className="logo-img logo-img-dark"
        />
      </span>
      {!compact && (
        <span className="logo-wordmark">
          <span>Theater</span>
          <strong>Hub</strong>
        </span>
      )}
    </>
  );

  return (
    <Link className={`logo logo-variant-${variant} ${className}`.trim()} href={href} aria-label="TheatreHub home">
      {content}
    </Link>
  );
}


