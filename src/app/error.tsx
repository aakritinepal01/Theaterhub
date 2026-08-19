"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="site-container">
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred while loading this page.</p>
      {error?.message && <pre className="error-message">{error.message}</pre>}
      <button className="button" onClick={reset}>Try again</button>
    </div>
  );
}
