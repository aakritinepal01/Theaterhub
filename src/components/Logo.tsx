import Link from "next/link";

type LogoProps = {
  className?: string;
  compact?: boolean;
  href?: string;
};

export function Logo({ className = "", compact = false, href = "/" }: LogoProps) {
  const content = <>
    <svg className="logo-curtain" viewBox="0 0 42 42" role="img" aria-label="TheaterHub curtain mark">
      <path d="M5 5h32v5H5z" fill="currentColor" opacity=".95" />
      <path d="M6 10h14v26H5c5-5.9 7.1-14.5 6.2-26H6Z" fill="currentColor" />
      <path d="M36 10H22v26h15c-5-5.9-7.1-14.5-6.2-26H36Z" fill="currentColor" />
      <path d="M20 10h2v26h-2z" fill="currentColor" opacity=".45" />
      <path d="M10.2 12.5c.3 8-1.1 14.7-4.1 20.2M31.8 12.5c-.3 8 1.1 14.7 4.1 20.2" fill="none" stroke="#211b18" strokeWidth="1.25" opacity=".45" />
    </svg>
    {!compact && <span className="logo-wordmark"><span>Theater</span><strong>Hub</strong></span>}
  </>;

  return <Link className={`logo ${className}`.trim()} href={href} aria-label="TheaterHub home">{content}</Link>;
}
