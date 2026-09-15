export type AdminProductionInput = {
  title: string;
  theatreId: number | null;
  status: "DRAFT" | "PUBLISHED" | "UPCOMING";
  metaTitle: string | null;
  description: string;
  keywordsString: string;
  abstract: string;
  directorialNote: string;
  coverImage: string | null;
  duration: number | null;
  launchedOn: Date | null;
  endedOn: Date | null;
  publishDate: Date | null;
  expiryDate: Date | null;
  isFeatured: boolean;
  inSitemap: boolean;
};

type ParseResult =
  | { success: true; data: AdminProductionInput }
  | { success: false; error: string };

const STATUS_VALUES = new Set(["DRAFT", "PUBLISHED", "UPCOMING"]);

function readText(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maxLength);
}

function readDate(formData: FormData, key: string) {
  const value = readText(formData, key, 10);
  if (!value) return { valid: true as const, value: null };

  const date = new Date(`${value}T00:00:00.000Z`);
  const valid = !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  return valid
    ? { valid: true as const, value: date }
    : { valid: false as const, value: null };
}

export function parseAdminProductionForm(formData: FormData): ParseResult {
  const title = readText(formData, "title", 220);
  if (!title) return { success: false, error: "Production title is required." };

  const rawTheatreId = readText(formData, "theatreId", 20);
  const theatreId = rawTheatreId ? Number(rawTheatreId) : null;
  if (theatreId !== null && (!Number.isInteger(theatreId) || theatreId < 1)) {
    return { success: false, error: "Please select a valid theatre." };
  }

  const rawStatus = readText(formData, "status", 20).toUpperCase();
  const status = STATUS_VALUES.has(rawStatus)
    ? (rawStatus as AdminProductionInput["status"])
    : "DRAFT";

  const rawDuration = readText(formData, "duration", 8);
  const duration = rawDuration ? Number(rawDuration) : null;
  if (duration !== null && (!Number.isInteger(duration) || duration < 1 || duration > 1440)) {
    return { success: false, error: "Duration must be between 1 and 1440 minutes." };
  }

  const launchedOn = readDate(formData, "launchedOn");
  const endedOn = readDate(formData, "endedOn");
  const publishDate = readDate(formData, "publishDate");
  const expiryDate = readDate(formData, "expiryDate");
  if (!launchedOn.valid || !endedOn.valid || !publishDate.valid || !expiryDate.valid) {
    return { success: false, error: "One or more dates are invalid." };
  }
  if (launchedOn.value && endedOn.value && endedOn.value < launchedOn.value) {
    return { success: false, error: "End date cannot be before the launch date." };
  }
  if (publishDate.value && expiryDate.value && expiryDate.value < publishDate.value) {
    return { success: false, error: "Expiry date cannot be before the publish date." };
  }

  return {
    success: true,
    data: {
      title,
      theatreId,
      status,
      metaTitle: readText(formData, "metaTitle", 220) || null,
      description: readText(formData, "description", 50_000),
      keywordsString: readText(formData, "keywordsString", 1_000),
      abstract: readText(formData, "abstract", 50_000),
      directorialNote: readText(formData, "directorialNote", 50_000),
      coverImage: readText(formData, "coverImage", 2_048) || null,
      duration,
      launchedOn: launchedOn.value,
      endedOn: endedOn.value,
      publishDate: publishDate.value,
      expiryDate: expiryDate.value,
      isFeatured: formData.get("isFeatured") === "on",
      inSitemap: formData.get("inSitemap") === "on",
    },
  };
}

export function productionSlug(title: string, id: number) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "production";

  return `${base}-${id}`;
}
