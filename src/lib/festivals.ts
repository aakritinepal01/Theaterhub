export const FESTIVAL_SERIES = [
  { slug: "international-theatre-festival", title: "International Theatre Festival" },
  { slug: "international-theatre-festival-solo", title: "International Theatre Festival (Solo)" },
  { slug: "national-theatre-festival", title: "National Theatre Festival" },
] as const;

export const FESTIVAL_CATEGORY_SLUGS = FESTIVAL_SERIES.map((series) => series.slug);
export const FESTIVAL_LIVE_STAGE_SLUG = "festival-live-stage";
export const FESTIVAL_LIVE_STAGE_TITLE = "Festival Live Stage";

export type FestivalPlacement = "LIVE" | "ARCHIVE";
export type FestivalPublishStatus = "DRAFT" | "PUBLISHED";

export function isFestivalSeriesSlug(value: string): value is (typeof FESTIVAL_SERIES)[number]["slug"] {
  return FESTIVAL_CATEGORY_SLUGS.includes(value as (typeof FESTIVAL_CATEGORY_SLUGS)[number]);
}

export function festivalSeriesTitle(slug: string) {
  return FESTIVAL_SERIES.find((series) => series.slug === slug)?.title ?? "Festival";
}

export function festivalPostSlug(title: string, id: number) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
  return `${base || "festival-story"}-${id}`;
}

function optionalDate(value: FormDataEntryValue | null) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const date = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseFestivalForm(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const seriesSlug = String(formData.get("seriesSlug") || "").trim();
  const placementValue = String(formData.get("placement") || "LIVE").trim();
  const statusValue = String(formData.get("status") || "PUBLISHED").trim();
  const description = String(formData.get("description") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const featuredImage = String(formData.get("featuredImage") || "").trim() || null;
  const publishDate = optionalDate(formData.get("publishDate"));

  if (!title || title.length > 220) return { success: false as const, error: "Add a festival story title under 220 characters." };
  if (!isFestivalSeriesSlug(seriesSlug)) return { success: false as const, error: "Choose a valid festival series." };
  if (placementValue !== "LIVE" && placementValue !== "ARCHIVE") return { success: false as const, error: "Choose Live Stage or Archive placement." };
  if (statusValue !== "DRAFT" && statusValue !== "PUBLISHED") return { success: false as const, error: "Choose Draft or Published status." };
  if (!description) return { success: false as const, error: "Add a short public summary." };
  if (description.length > 1000) return { success: false as const, error: "Keep the summary under 1,000 characters." };
  if (!content) return { success: false as const, error: "Add the full festival story." };
  if (publishDate === undefined) return { success: false as const, error: "Enter a valid publish date." };

  return {
    success: true as const,
    data: {
      title,
      seriesSlug,
      placement: placementValue as FestivalPlacement,
      status: statusValue as FestivalPublishStatus,
      description,
      content,
      featuredImage,
      publishDate: publishDate ?? new Date(),
    },
  };
}
