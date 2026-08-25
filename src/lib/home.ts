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

export async function getFeaturedPlays() {
  const featured = await prisma.play.findMany({
    where: { ...publishedWhere(), isFeatured: true },
    orderBy: { launchedOn: "desc" },
    take: 6,
    include: playCardInclude,
  });

  if (featured.length) return featured;

  return prisma.play.findMany({
    where: publishedWhere(),
    orderBy: { launchedOn: "desc" },
    take: 6,
    include: playCardInclude,
  });
}

export function getHeroPlays() {
  return prisma.play.findMany({
    where: { ...publishedWhere(), coverImage: { not: null } },
    orderBy: [{ isFeatured: "desc" }, { launchedOn: "desc" }],
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
