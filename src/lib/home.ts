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

const FEATURED_PLAY_LIMIT = 6;

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

export function getUpcomingShows() {
  return prisma.show.findMany({
    where: {
      showtime: { gt: new Date() },
      play: publishedWhere(),
    },
    orderBy: { showtime: "asc" },
    take: 10,
    include: { play: true, theatre: true },
  });
}

export async function getHomepageStats() {
  const [plays, theatres, bookings, upcomingShows] = await Promise.all([
    prisma.play.count({ where: publishedWhere() }),
    prisma.theatre.count({ where: { status: "PUBLISHED" } }),
    prisma.booking.count(),
    prisma.show.count({ where: { showtime: { gt: new Date() } } }),
  ]);

  return { plays, theatres, bookings, upcomingShows };
}
