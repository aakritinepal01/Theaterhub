export type AdminArtistInput = {
  name: string;
  slug: string | null;
  status: "DRAFT" | "PUBLISHED" | "UPCOMING";
  metaTitle: string | null;
  description: string;
  keywordsString: string;
  profilePic: string | null;
  email: string;
  mobile: string;
  dob: Date | null;
  activeSince: Date | null;
  linkWebsite: string;
  linkFacebook: string;
  linkTwitter: string;
  linkInstagram: string;
  bio: string;
  address: string;
  publishDate: Date | null;
  expiryDate: Date | null;
  inSitemap: boolean;
};

type ParseResult = { success: true; data: AdminArtistInput } | { success: false; error: string };
const statuses = new Set(["DRAFT", "PUBLISHED", "UPCOMING"]);

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function readDate(formData: FormData, key: string) {
  const raw = text(formData, key, 10);
  if (!raw) return { valid: true as const, value: null };
  const value = new Date(`${raw}T00:00:00.000Z`);
  return !Number.isNaN(value.getTime()) && value.toISOString().slice(0, 10) === raw
    ? { valid: true as const, value }
    : { valid: false as const, value: null };
}

export function artistSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180) || "artist";
}

export function parseAdminArtistForm(formData: FormData): ParseResult {
  const name = text(formData, "name", 220);
  if (!name) return { success: false, error: "Artist name is required." };
  const email = text(formData, "email", 320).toLowerCase();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { success: false, error: "Enter a valid email address." };

  const dob = readDate(formData, "dob");
  const activeSince = readDate(formData, "activeSince");
  const publishDate = readDate(formData, "publishDate");
  const expiryDate = readDate(formData, "expiryDate");
  if (!dob.valid || !activeSince.valid || !publishDate.valid || !expiryDate.valid) return { success: false, error: "One or more dates are invalid." };
  if (publishDate.value && expiryDate.value && expiryDate.value < publishDate.value) return { success: false, error: "Expiry date cannot be before publish date." };

  const rawStatus = text(formData, "status", 20).toUpperCase();
  const rawSlug = text(formData, "slug", 200);
  return {
    success: true,
    data: {
      name,
      slug: rawSlug ? artistSlug(rawSlug) : null,
      status: statuses.has(rawStatus) ? rawStatus as AdminArtistInput["status"] : "DRAFT",
      metaTitle: text(formData, "metaTitle", 220) || null,
      description: text(formData, "description", 50_000),
      keywordsString: text(formData, "keywordsString", 1_000),
      profilePic: text(formData, "profilePic", 2_048) || null,
      email,
      mobile: text(formData, "mobile", 80),
      dob: dob.value,
      activeSince: activeSince.value,
      linkWebsite: text(formData, "linkWebsite", 2_048),
      linkFacebook: text(formData, "linkFacebook", 2_048),
      linkTwitter: text(formData, "linkTwitter", 2_048),
      linkInstagram: text(formData, "linkInstagram", 2_048),
      bio: text(formData, "bio", 50_000),
      address: text(formData, "address", 1_000),
      publishDate: publishDate.value,
      expiryDate: expiryDate.value,
      inSitemap: formData.get("inSitemap") === "on",
    },
  };
}
