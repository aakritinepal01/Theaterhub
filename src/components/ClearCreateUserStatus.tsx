"use client";

import { useEffect } from "react";

export function ClearCreateUserStatus() {
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    url.searchParams.delete("theatre");
    url.searchParams.delete("sent");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return null;
}
