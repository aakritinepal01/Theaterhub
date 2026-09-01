"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TheatreCurtainSplash() {
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname === "";

  const [phase, setPhase] = useState<
    "closed" | "curtains-sliding" | "black-screen-welcome" | "fade-to-website" | "done"
  >(isHomePage ? "closed" : "done");
  const [flashActive, setFlashActive] = useState(false);

  useEffect(() => {
    if (!isHomePage) return;

    const t1 = setTimeout(() => setPhase("curtains-sliding"), 350);

    const t2 = setTimeout(() => {
      setPhase((p) => (p !== "done" ? "black-screen-welcome" : "done"));
      setTimeout(() => {
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 700);
      }, 180);
    }, 1850);

    const t3 = setTimeout(() => setPhase((p) => (p !== "done" ? "fade-to-website" : "done")), 5500);
    const t4 = setTimeout(() => setPhase("done"), 6700);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [isHomePage]);

  const handleSkip = () => {
    if (phase === "fade-to-website" || phase === "done") return;
    setPhase("fade-to-website");
    setTimeout(() => setPhase("done"), 1100);
  };

  if (phase === "done") return null;

  return (
    <div
      className={`theatre-splash-overlay phase-${phase} ${phase !== "closed" ? "is-curtain-open" : ""}`}
      onClick={handleSkip}
    >
      {/* Camera Flash */}
      <div className={`camera-flash${flashActive ? " camera-flash-active" : ""}`} />

      {/* Pitch-Black Stage BG */}
      <div className="black-screen-bg">
        <div className="black-screen-ambient-glow" />
        <div className="black-screen-vignette" />
        {/* Film-grain overlay */}
        <div className="splash-film-grain" />
      </div>

      {/* 4 Coloured Spotlights */}
      <div className="stage-lights">
        <div className="stage-light stage-light-gold" />
        <div className="stage-light stage-light-red" />
        <div className="stage-light stage-light-blue" />
        <div className="stage-light stage-light-violet" />
        <div className="stage-light stage-light-center" />
      </div>

      {/* Ground colour wash */}
      <div className="splash-floor-wash" />

      {/* Floating Gold Dust */}
      <div className="splash-dust">
        {[...Array(16)].map((_, i) => (
          <span key={i} className={`dust-p dust-p-${i + 1}`} />
        ))}
      </div>

      {/* Left Curtain */}
      <div className="curtain-panel curtain-panel-left">
        <div className="curtain-fold-lines" />
        <div className="curtain-inner-shadow" />
        <div className="curtain-edge-highlight" />
      </div>

      {/* Right Curtain */}
      <div className="curtain-panel curtain-panel-right">
        <div className="curtain-fold-lines" />
        <div className="curtain-inner-shadow" />
        <div className="curtain-edge-highlight" />
      </div>

      {/* ─── Welcome Stage ─── */}
      <div className="black-screen-center">
        <div className="black-screen-welcome-box">

          {/* Glowing top rule */}
          <div className="splash-top-rule">
            <span className="splash-rule-line" />
            <span className="splash-rule-diamond">◆</span>
            <span className="splash-rule-line" />
          </div>

          {/* Kicker badge */}
          <p className="splash-kicker">
            ✦&nbsp; NEPAL&apos;S PREMIERE STAGE &amp; THEATRE HUB &nbsp;✦
          </p>

          {/* Logo with multi-ring glow */}
          <div className="splash-logo-wrap">
            <div className="splash-logo-halo splash-logo-halo-1" />
            <div className="splash-logo-halo splash-logo-halo-2" />
            <div className="splash-logo-halo splash-logo-halo-3" />
            <div className="splash-logo-inner">
              <img src="/brand-logo-light.png" alt="TheaterHub" className="splash-logo-img" />
            </div>
          </div>

          {/* Title block */}
          <div className="splash-title-block">
            <span className="splash-eyebrow">WELCOME TO</span>
            <h1 className="splash-headline">
              Theater<em className="splash-em-gold">Hub</em>
            </h1>
            <p className="splash-sub">Where Nepal&apos;s stories step into the light.</p>
          </div>

          {/* Colour bar accent */}
          <div className="splash-colour-bar">
            <span className="splash-colour-bar-seg splash-cb-gold" />
            <span className="splash-colour-bar-seg splash-cb-red" />
            <span className="splash-colour-bar-seg splash-cb-blue" />
            <span className="splash-colour-bar-seg splash-cb-violet" />
          </div>

          {/* Ornamental divider */}
          <div className="splash-divider">
            <span className="splash-divider-line" />
            <span className="splash-divider-emblem">🎭</span>
            <span className="splash-divider-line" />
          </div>

          {/* Skip hint */}
          <p className="splash-skip-hint">Click anywhere to enter</p>
        </div>
      </div>
    </div>
  );
}
