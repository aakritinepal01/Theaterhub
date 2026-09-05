"use client";

import { useEffect, useState } from "react";

export function MobileAdminSidebarToggle() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const isHidden = window.localStorage.getItem("admin-sidebar-hidden") === "1";
    setHidden(isHidden);
    document.querySelectorAll<HTMLElement>(".adm-inner-shell").forEach((shell) => {
      shell.toggleAttribute("data-sidebar-hidden", isHidden);
    });
  }, []);

  return (
    <button
      type="button"
      className="adm-sidebar-toggle"
      aria-label={hidden ? "Show sidebar" : "Hide sidebar"}
      aria-pressed={hidden}
      onClick={() => {
        const next = !hidden;
        setHidden(next);
        window.localStorage.setItem("admin-sidebar-hidden", next ? "1" : "0");
        document.querySelectorAll<HTMLElement>(".adm-inner-shell").forEach((shell) => {
          shell.toggleAttribute("data-sidebar-hidden", next);
        });
      }}
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </button>
  );
}
