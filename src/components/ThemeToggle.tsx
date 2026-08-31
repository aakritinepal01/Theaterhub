"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

export function ThemeToggle({ className = "", showLabel = true }: { className?: string; showLabel?: boolean }) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let initialTheme: ThemeMode = "light";
    try {
      initialTheme = window.localStorage.getItem("theaterhub-theme") === "dark" ? "dark" : "light";
    } catch {
      initialTheme = "light";
    }
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem("theaterhub-theme", nextTheme);
    } catch {
      // Storage unavailable
    }
  };

  if (!mounted) {
    return (
      <button className={`admin-theme-btn ${className}`} type="button" aria-label="Toggle theme">
        <span className="admin-theme-icon">🌓</span>
        {showLabel && <span className="admin-theme-label">Theme</span>}
      </button>
    );
  }

  return (
    <button
      className={`admin-theme-btn ${theme === "dark" ? "is-dark" : "is-light"} ${className}`.trim()}
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <span className="admin-theme-icon" aria-hidden="true">
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </span>
      {showLabel && (
        <span className="admin-theme-label">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </span>
      )}
    </button>
  );
}
