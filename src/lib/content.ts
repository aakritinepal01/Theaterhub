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

const ARTIST_PORTRAITS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1534493872551-856c2bb2279f?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=500&q=80"
];

const THEATRE_PHOTOS: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1200&q=80", // Mandala
  2: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80", // Theatre Village
  3: "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=1200&q=80", // Shilpee
  4: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80", // Sarwanam
  5: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80", // Theatre Mall
  6: "https://images.unsplash.com/photo-1504804884814-d58d4c9b0a35?auto=format&fit=crop&w=1200&q=80", // Pokhara Theatre
  7: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1200&q=80", // Kausi Theatre
  8: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=1200&q=80", // Studio 7
  9: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80", // Aarohan Gurukul
  10: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=1200&q=80", // RCSC
  11: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80", // Kunja Natak Ghar
};

const GENERIC_THEATRE_PHOTOS = [
  "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
];

export function getTheatrePhoto(theatre: { id: number; title?: string | null; coverImage?: string | null }) {
  if (theatre.title?.toLowerCase().includes("mandala")) {
    return "/uploads/theatre_logo/mandala-logo.png";
  }
  if (theatre.coverImage) {
    const url = mediaUrl(theatre.coverImage);
    if (url) return url;
  }
  if (theatre.title?.toLowerCase().includes("jhorahat")) {
    return "/uploads/theatre_logo/jhorahat-theatre.jpg";
  }
  if (theatre.title?.toLowerCase().includes("kadam")) {
    return "/uploads/theatre_logo/kadam-theatre.jpg";
  }
  if (theatre.title?.toLowerCase().includes("kalalaya")) {
    return "/uploads/theatre_logo/kalalaya-itahari.jpg";
  }
  if (theatre.title?.toLowerCase().includes("ojas")) {
    return "/uploads/theatre_logo/ojas-theatre.jpg";
  }
  if (theatre.title?.toLowerCase().includes("one world")) {
    return "/uploads/theatre_logo/one-world-theatre.jpg";
  }
  if (theatre.title?.toLowerCase().includes("pariwartan")) {
    return "/uploads/theatre_logo/pariwartan-theatre.jpg";
  }
  if (theatre.title?.toLowerCase().includes("purano ghar")) {
    return "/uploads/theatre_logo/purano-ghar.jpg";
  }
  if (theatre.title?.toLowerCase().includes("shailee")) {
    return "/uploads/theatre_logo/shailee-theatre.jpg";
  }
  return THEATRE_PHOTOS[theatre.id] ?? GENERIC_THEATRE_PHOTOS[theatre.id % GENERIC_THEATRE_PHOTOS.length];
}

export function getArtistPhoto(artist: { id: number; profilePic?: string | null }) {
  if (artist.profilePic) {
    const url = mediaUrl(artist.profilePic);
    if (url) return url;
  }
  const index = Math.abs(artist.id || 0) % ARTIST_PORTRAITS.length;
  return ARTIST_PORTRAITS[index];
}

const PLAY_POSTER_FALLBACKS = [
  "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504804884814-d58d4c9b0a35?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80",
];

export function getPlayPhoto(play: { id?: number; coverImage?: string | null }) {
  if (play.coverImage) {
    const filename = play.coverImage.split("/").pop() || "";
    // Filter out legacy Django Mezzanine 'NO PIC' placeholder files prefixed with 4-digit numbers (e.g. 0015_, 0143_)
    const isLegacyNoPic = /^\d{4}_/.test(filename);
    if (!isLegacyNoPic) {
      const url = mediaUrl(play.coverImage);
      if (url) return url;
    }
  }
  const index = Math.abs(play.id || 0) % PLAY_POSTER_FALLBACKS.length;
  return PLAY_POSTER_FALLBACKS[index];
}

export function plainText(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function formatDate(date?: Date | null, includeTime = false) {
  if (!date) return "";
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeZone: "Asia/Kathmandu",
    ...(includeTime ? { timeStyle: "short" } : {}),
  };
  return new Intl.DateTimeFormat("en-NP", options).format(date);
}
