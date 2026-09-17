export type AdminTheatreInput = {
  title: string;
  slug: string | null;
  status: "DRAFT" | "PUBLISHED" | "UPCOMING";
  metaTitle: string | null;
  description: string;
  keywordsString: string;
  about: string;
  profilePic: string | null;
  coverImage: string | null;
  establishedOn: Date | null;
  closedOn: Date | null;
  email: string;
  phone: string;
  address: string;
  linkWebsite: string;
  linkFacebook: string;
  linkTwitter: string;
  linkInstagram: string;
  publishDate: Date | null;
  expiryDate: Date | null;
  inSitemap: boolean;
};

type ParseResult =
  | { success: true; data: AdminTheatreInput }
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

export function theatreSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180) || "theatre";
}

export function parseAdminTheatreForm(formData: FormData): ParseResult {
  const title = readText(formData, "title", 220);
  if (!title) return { success: false, error: "Theatre name is required." };

  const rawStatus = readText(formData, "status", 20).toUpperCase();
  const status = STATUS_VALUES.has(rawStatus)
    ? (rawStatus as AdminTheatreInput["status"])
    : "DRAFT";
  const rawSlug = readText(formData, "slug", 200);
  const slug = rawSlug ? theatreSlug(rawSlug) : null;
  const email = readText(formData, "email", 320).toLowerCase();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return { success: false, error: "Please enter a valid venue email address." };
  }

  const establishedOn = readDate(formData, "establishedOn");
  const closedOn = readDate(formData, "closedOn");
  const publishDate = readDate(formData, "publishDate");
  const expiryDate = readDate(formData, "expiryDate");
  if (!establishedOn.valid || !closedOn.valid || !publishDate.valid || !expiryDate.valid) {
    return { success: false, error: "One or more dates are invalid." };
  }
  if (establishedOn.value && closedOn.value && closedOn.value < establishedOn.value) {
    return { success: false, error: "Closing date cannot be before the established date." };
  }
  if (publishDate.value && expiryDate.value && expiryDate.value < publishDate.value) {
    return { success: false, error: "Expiry date cannot be before the publish date." };
  }

  return {
    success: true,
    data: {
      title,
      slug,
      status,
      metaTitle: readText(formData, "metaTitle", 220) || null,
      description: readText(formData, "description", 50_000),
      keywordsString: readText(formData, "keywordsString", 1_000),
      about: readText(formData, "about", 50_000),
      profilePic: readText(formData, "profilePic", 2_048) || null,
      coverImage: readText(formData, "coverImage", 2_048) || null,
      establishedOn: establishedOn.value,
      closedOn: closedOn.value,
      email,
      phone: readText(formData, "phone", 80),
      address: readText(formData, "address", 1_000),
      linkWebsite: readText(formData, "linkWebsite", 2_048),
      linkFacebook: readText(formData, "linkFacebook", 2_048),
      linkTwitter: readText(formData, "linkTwitter", 2_048),
      linkInstagram: readText(formData, "linkInstagram", 2_048),
      publishDate: publishDate.value,
      expiryDate: expiryDate.value,
      inSitemap: formData.get("inSitemap") === "on",
    },
  };
}
