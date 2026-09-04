import { prisma } from "@/lib/prisma";
import { publishedWhere } from "@/lib/content";

const playCardInclude = {
  shows: {
    where: { showtime: { gt: new Date() } },
    orderBy: { showtime: "asc" as const },
    take: 1,
  },
  theatre: true,
  makers: {
    include: {
      profile: true,
    },
    orderBy: { order: "asc" as const },
  },
};

const FEATURED_PLAY_LIMIT = 8;

function kathmanduToday() {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-gregory", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return new Date(Date.UTC(value("year"), value("month") - 1, value("day")));
}

export async function getFeaturedPlays() {
  const featured = await prisma.play.findMany({
    where: { ...publishedWhere(), isFeatured: true },
    orderBy: { launchedOn: "desc" },
    take: FEATURED_PLAY_LIMIT,
    include: playCardInclude,
  });

  if (featured.length >= FEATURED_PLAY_LIMIT) return featured;

  const fallback = await prisma.play.findMany({
    where: {
      ...publishedWhere(),
      coverImage: { not: null },
      id: { notIn: featured.map((play) => play.id) },
    },
    orderBy: { launchedOn: "desc" },
    take: FEATURED_PLAY_LIMIT - featured.length,
    include: playCardInclude,
  });

  return [...featured, ...fallback];
}

export function getHeroPlays() {
  return prisma.play.findMany({
    where: { ...publishedWhere(), coverImage: { not: null } },
    orderBy: [{ isFeatured: "desc" }, { launchedOn: "desc" }],
    take: 1,
    select: { id: true, coverImage: true },
  });
}

export async function getUpcomingShows() {
  const now = new Date();
  const today = kathmanduToday();

  return prisma.show.findMany({
    where: {
      showtime: { gt: now },
      play: {
        status: "PUBLISHED",
        OR: [
          { endedOn: null },
          { endedOn: { gte: today } },
        ],
      },
    },
    orderBy: { showtime: "asc" },
    take: 10,
    include: { play: true, theatre: true },
  });
}

export function getHomepageTheatres() {
  return prisma.theatre.findMany({
    where: { status: "PUBLISHED", slug: { not: null } },
    orderBy: { title: "asc" },
    take: 12,
    select: { id: true, title: true, slug: true, profilePic: true, coverImage: true },
  });
}

export function getHomepagePhotoStories() {
  return prisma.play.findMany({
    where: { ...publishedWhere(), coverImage: { not: null }, slug: { not: null } },
    orderBy: [{ updated: "desc" }, { launchedOn: "desc" }],
    take: 10,
    select: { id: true, title: true, slug: true, coverImage: true },
  });
}

export async function getHomepageStats() {
  const now = new Date();
  const today = kathmanduToday();
  const [plays, theatres, bookings, upcomingShows] = await Promise.all([
    prisma.play.count({ where: publishedWhere() }),
    prisma.theatre.count({ where: { status: "PUBLISHED" } }),
    prisma.booking.count(),
    prisma.show.count({
      where: {
        showtime: { gt: now },
        play: {
          status: "PUBLISHED",
          OR: [{ endedOn: null }, { endedOn: { gte: today } }],
        },
      },
    }),
  ]);

  return { plays, theatres, bookings, upcomingShows };
}
