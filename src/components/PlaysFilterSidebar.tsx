"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Theatre = { id: number; title: string };

type Props = {
  theatres: Theatre[];
  selectedTheatreId: number | null;
  selectedFilter: string;
  selectedDuration: string;
  selectedRating: string;
  selectedFeatured: string;
  selectedPlayType: string;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`pf-chevron${open ? " pf-chevron-open" : ""}`}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterSection({
  label,
  children,
  hasValue,
  onClear,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  hasValue: boolean;
  onClear: () => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pf-section">
      <button
        type="button"
        className="pf-section-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="pf-section-label">
          <ChevronIcon open={open} />
          {label}
        </span>
        {hasValue && (
          <span
            className="pf-clear-btn"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onClear();
              }
            }}
          >
            Clear
          </span>
        )}
      </button>
      {open && <div className="pf-section-body">{children}</div>}
    </div>
  );
}

export function PlaysFilterSidebar({
  theatres,
  selectedTheatreId,
  selectedFilter,
  selectedDuration,
  selectedRating,
  selectedFeatured,
  selectedPlayType,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [theatreId, setTheatreId] = useState<number | null>(selectedTheatreId);
  const [filter, setFilter] = useState(selectedFilter);
  const [duration, setDuration] = useState(selectedDuration);
  const [rating, setRating] = useState(selectedRating);
  const [featured, setFeatured] = useState(selectedFeatured);
  const [playType, setPlayType] = useState(selectedPlayType);

  const hasAnyFilter =
    !!theatreId ||
    filter !== "all" ||
    duration !== "" ||
    rating !== "" ||
    featured !== "" ||
    playType !== "";

  function buildHref(overrides: Record<string, string | null>) {
    const q = new URLSearchParams(searchParams.toString());
    q.delete("page");
    const merged: Record<string, string | null> = {
      theatre: theatreId ? String(theatreId) : null,
      filter: filter !== "all" ? filter : null,
      duration: duration || null,
      rating: rating || null,
      featured: featured || null,
      type: playType || null,
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) q.set(k, v);
      else q.delete(k);
    });
    const qs = q.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }

  function navigate(overrides: Record<string, string | null>) {
    startTransition(() => router.push(buildHref(overrides)));
  }

  function clearAll() {
    setTheatreId(null);
    setFilter("all");
    setDuration("");
    setRating("");
    setFeatured("");
    setPlayType("");
    startTransition(() => router.push(pathname));
  }

  const availabilityOptions = [
    { value: "all", label: "All" },
    { value: "showing", label: "Now Showing" },
    { value: "archive", label: "Archive" },
  ];

  const durationOptions = [
    { value: "short", label: "Under 60 min" },
    { value: "medium", label: "60–120 min" },
    { value: "long", label: "Over 120 min" },
  ];

  const ratingOptions = [
    { value: "4", label: "★ 4+" },
    { value: "3", label: "★ 3+" },
    { value: "2", label: "★ 2+" },
  ];

  const playTypeOptions = [
    { value: "storytelling", label: "Storytelling" },
    { value: "theatre", label: "Theatre" },
  ];

  return (
    <aside className="pf-sidebar">
      <div className="pf-sidebar-head">
        <strong className="pf-sidebar-title">Filters</strong>
        {hasAnyFilter && (
          <button type="button" className="pf-clear-all-btn" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      <FilterSection
        label="Plays Type"
        defaultOpen
        hasValue={!!playType}
        onClear={() => {
          setPlayType("");
          navigate({ type: null });
        }}
      >
        <div className="pf-chips">
          {playTypeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pf-chip${playType === opt.value ? " pf-chip-active" : ""}`}
              onClick={() => {
                const next = playType === opt.value ? "" : opt.value;
                setPlayType(next);
                navigate({ type: next || null });
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        label="Theatre / Venue"
        defaultOpen
        hasValue={!!theatreId}
        onClear={() => {
          setTheatreId(null);
          navigate({ theatre: null });
        }}
      >
        <div className="pf-chips">
          {theatres.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`pf-chip${theatreId === t.id ? " pf-chip-active" : ""}`}
              onClick={() => {
                const next = theatreId === t.id ? null : t.id;
                setTheatreId(next);
                navigate({ theatre: next ? String(next) : null });
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        label="Availability"
        defaultOpen
        hasValue={filter !== "all"}
        onClear={() => {
          setFilter("all");
          navigate({ filter: null });
        }}
      >
        <div className="pf-chips">
          {availabilityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pf-chip${filter === opt.value ? " pf-chip-active" : ""}`}
              onClick={() => {
                setFilter(opt.value);
                navigate({ filter: opt.value !== "all" ? opt.value : null });
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        label="Duration"
        hasValue={!!duration}
        onClear={() => {
          setDuration("");
          navigate({ duration: null });
        }}
      >
        <div className="pf-chips">
          {durationOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pf-chip${duration === opt.value ? " pf-chip-active" : ""}`}
              onClick={() => {
                const next = duration === opt.value ? "" : opt.value;
                setDuration(next);
                navigate({ duration: next || null });
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        label="Audience Rating"
        hasValue={!!rating}
        onClear={() => {
          setRating("");
          navigate({ rating: null });
        }}
      >
        <div className="pf-chips">
          {ratingOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pf-chip${rating === opt.value ? " pf-chip-active" : ""}`}
              onClick={() => {
                const next = rating === opt.value ? "" : opt.value;
                setRating(next);
                navigate({ rating: next || null });
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        label="More Filters"
        hasValue={!!featured}
        onClear={() => {
          setFeatured("");
          navigate({ featured: null });
        }}
      >
        <div className="pf-chips">
          <button
            type="button"
            className={`pf-chip${featured === "yes" ? " pf-chip-active" : ""}`}
            onClick={() => {
              const next = featured === "yes" ? "" : "yes";
              setFeatured(next);
              navigate({ featured: next || null });
            }}
          >
            Featured only
          </button>
          <button
            type="button"
            className={`pf-chip${featured === "with-image" ? " pf-chip-active" : ""}`}
            onClick={() => {
              const next = featured === "with-image" ? "" : "with-image";
              setFeatured(next);
              navigate({ featured: next || null });
            }}
          >
            Has poster
          </button>
        </div>
      </FilterSection>

      <Link href="/theatre/" className="pf-venue-cta">
        Browse by Venues
      </Link>
    </aside>
  );
}
