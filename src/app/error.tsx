"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="site-container"><h1>Server error</h1><p>Something went wrong while loading this page.</p><button className="button" onClick={reset}>Try again</button></div>}
