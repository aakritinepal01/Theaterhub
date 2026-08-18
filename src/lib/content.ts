import { ContentStatus, Prisma } from "@prisma/client";

export const publishedWhere = (now = new Date()) => ({
  status: ContentStatus.PUBLISHED,
  AND: [
    { OR: [{ publishDate: null }, { publishDate: { lte: now } }] },
    { OR: [{ expiryDate: null }, { expiryDate: { gt: now } }] },
  ],
}) satisfies Prisma.PlayWhereInput;

export function mediaUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `/uploads/${path.replace(/^\/?(?:uploads\/)?/, "")}`;
}

export function plainText(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function formatDate(date?: Date | null) {
  return date ? new Intl.DateTimeFormat("en-NP", { dateStyle: "medium", timeZone: "Asia/Kathmandu" }).format(date) : "";
}
