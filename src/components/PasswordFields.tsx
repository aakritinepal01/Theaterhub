"use client";

import { useState } from "react";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {hidden ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9 8 9 8a17.7 17.7 0 0 1-2 3.1M6.6 6.6C4.3 8.1 3 12 3 12s3.5 8 9 8a9.8 9.8 0 0 0 4.1-.9" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="adm-input-prefix-icon"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function PasswordFields() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Strength computation
  const getStrength = (val: string) => {
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score += 1;
    if (val.length >= 12) score += 1;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;
    return score; // 0 to 4
  };

  const strength = getStrength(password);
  const strengthLabels = ["Empty", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "transparent",
    "var(--adm-crimson)",
    "#f59e0b",
    "#3b82f6",
    "var(--adm-emerald)",
  ];

  const isMatching = confirmPassword.length > 0 && password === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="adm-form-grid-2">
      {/* Password Field */}
      <div className="adm-form-field">
        <label htmlFor="password">
          Initial Password
          <span className="adm-required-star">*</span>
        </label>
        <div className="password-input-wrap">
          <LockIcon />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="has-prefix-icon"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={`${showPassword ? "Hide" : "Show"} password`}
            title={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon hidden={showPassword} />
          </button>
        </div>

        {/* Strength Indicator Bar */}
        {password.length > 0 && (
          <div className="adm-password-strength-wrap">
            <div className="adm-strength-bars">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className="adm-strength-bar"
                  style={{
                    backgroundColor:
                      strength >= step ? strengthColors[strength] : "var(--adm-border-subtle)",
                  }}
                />
              ))}
            </div>
            <span
              className="adm-strength-text"
              style={{ color: strengthColors[strength] }}
            >
              {strengthLabels[strength]}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="adm-form-field">
        <label htmlFor="confirmPassword">
          Confirm Password
          <span className="adm-required-star">*</span>
        </label>
        <div className="password-input-wrap">
          <LockIcon />
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            placeholder="Repeat initial password"
            className={`has-prefix-icon ${isMatching ? "is-valid" : ""} ${isMismatch ? "is-invalid" : ""}`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={`${showConfirm ? "Hide" : "Show"} confirm password`}
            title={showConfirm ? "Hide password" : "Show password"}
          >
            <EyeIcon hidden={showConfirm} />
          </button>
        </div>

        {/* Match Feedback */}
        {isMatching && (
          <span className="adm-match-feedback is-match">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Passwords match perfectly
          </span>
        )}
        {isMismatch && (
          <span className="adm-match-feedback is-mismatch">
            Passwords do not match
          </span>
        )}
      </div>
    </div>
  );
}
