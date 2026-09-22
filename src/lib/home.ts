import { prisma } from "@/lib/prisma";
import { groupTheatrePosts } from "@/lib/theatre-post-groups";

export async function getHomepageMedia() {
  const posts = await prisma.theatrePost.findMany({
    where: { theatre: { status: "PUBLISHED" } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { theatre: { select: { id: true, title: true, slug: true } }, assets: { orderBy: { position: "asc" } } },
  });
  return { stories: groupTheatrePosts(posts, "STORY"), reels: groupTheatrePosts(posts, "REEL") };
}
import { releasedPlayWhere, playingNowWhere, upcomingPlayWhere } from "@/lib/production-visibility";

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

export async function getFeaturedPlays() {
  const featured = await prisma.play.findMany({
    where: { ...releasedPlayWhere(), isFeatured: true },
    orderBy: { launchedOn: "desc" },
    take: FEATURED_PLAY_LIMIT,
    include: playCardInclude,
  });

  if (featured.length >= FEATURED_PLAY_LIMIT) return featured;

  const fallback = await prisma.play.findMany({
    where: {
      ...releasedPlayWhere(),
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
    where: { ...releasedPlayWhere(), coverImage: { not: null } },
    orderBy: [{ isFeatured: "desc" }, { launchedOn: "desc" }],
    take: 1,
    select: { id: true, coverImage: true },
  });
}

export async function getUpcomingShows() {
  const now = new Date();
  const productions = await prisma.play.findMany({
    where: { ...upcomingPlayWhere(now), isFeatured: true, slug: { not: null }, theatreId: { not: null } },
    orderBy: [{ launchedOn: "asc" }, { title: "asc" }],
    take: 10,
    include: { theatre: true, shows: { where: { showtime: { gt: now } }, orderBy: { showtime: "asc" }, take: 1 } },
  });
  return productions.filter(play => play.theatre).map(play => ({
    id: play.id,
    play,
    theatre: play.theatre!,
    showtime: play.launchedOn,
    price: play.shows[0]?.price ?? null,
  }));
}

export function getPlayingNowPlays() {
  return prisma.play.findMany({
    where: { ...playingNowWhere(), slug: { not: null } },
    orderBy: [{ isFeatured: "desc" }, { launchedOn: "desc" }],
    take: 10,
    include: playCardInclude,
  });
}

export function getRecentPlays() {
  return prisma.play.findMany({
    where: { ...releasedPlayWhere(), slug: { not: null }, coverImage: { not: null } },
    orderBy: [{ launchedOn: "desc" }, { updated: "desc" }],
    take: 8,
    include: playCardInclude,
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
    where: { ...releasedPlayWhere(), coverImage: { not: null }, slug: { not: null } },
    orderBy: [{ updated: "desc" }, { launchedOn: "desc" }],
    take: 10,
    select: { id: true, title: true, slug: true, coverImage: true },
  });
}

export function getHomepageTheatreReels() {
  return prisma.theatreReel.findMany({
    where: { status: "PUBLISHED", theatre: { status: "PUBLISHED" } },
    orderBy: { created: "desc" },
    take: 12,
    select: { id: true, title: true, videoUrl: true, theatre: { select: { title: true } } },
  }).catch(() => []);
}

export function getHomepageTheatreStories() {
  return prisma.theatreStory.findMany({
    where: { status: "PUBLISHED", theatre: { status: "PUBLISHED" } },
    orderBy: { created: "desc" },
    take: 30,
    select: { id: true, title: true, imageUrl: true, caption: true, theatre: { select: { title: true, slug: true } } },
  }).catch(() => []);
}

export async function getHomepageStats() {
  const now = new Date();
  const [plays, theatres, bookings, upcomingShows] = await Promise.all([
    prisma.play.count({ where: releasedPlayWhere() }),
    prisma.theatre.count({ where: { status: "PUBLISHED" } }),
    prisma.booking.count(),
    prisma.play.count({ where: { ...upcomingPlayWhere(now), isFeatured: true, slug: { not: null }, theatreId: { not: null } } }),
  ]);

  return { plays, theatres, bookings, upcomingShows };
}
