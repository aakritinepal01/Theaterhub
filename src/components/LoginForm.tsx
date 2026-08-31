"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export function LoginForm({ error }: { error?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <section className="auth-card">
      <div className="auth-card-header">
        <Link className="auth-back-btn" href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back to home</span>
        </Link>
        <Logo />
      </div>

      <div className="auth-title-group">
        <h1>Welcome back</h1>
        <p className="auth-intro">Sign in to access your theatre management portal.</p>
      </div>

      {error && (
        <div className="auth-alert" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Invalid username or password. Please try again.</span>
        </div>
      )}

      <form 
        action="/api/auth/login" 
        method="post" 
        className="auth-form"
        onSubmit={() => setLoading(true)}
      >
        <div className="auth-field">
          <label htmlFor="username-input">Username</label>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input 
              id="username-input"
              name="username" 
              type="text" 
              placeholder="Enter your username"
              autoComplete="username" 
              required 
            />
          </div>
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="password-input">Password</label>
          </div>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input 
              id="password-input"
              name="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              autoComplete="current-password" 
              required 
            />
            <button 
              type="button" 
              className="auth-password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <span className="auth-btn-spinner" />
          ) : (
            <>
              <span>Sign In</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="auth-footer-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Accounts are created by TheatreHub administrators after verification.</span>
      </div>
    </section>
  );
}
