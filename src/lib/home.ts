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
