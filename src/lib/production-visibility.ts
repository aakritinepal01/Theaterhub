import type { Prisma } from "@prisma/client";

// Production dates are date-only values stored at UTC midnight; compare them
// with the calendar date in Nepal, not the server's timezone or current instant.
export function kathmanduToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (name: string) => Number(parts.find(value => value.type === name)!.value);
  return new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
}

function publicationWindow(now: Date): Prisma.PlayWhereInput[] {
  return [
    { OR: [{ publishDate: null }, { publishDate: { lte: now } }] },
    { OR: [{ expiryDate: null }, { expiryDate: { gt: now } }] },
  ];
}

export function releasedPlayWhere(now = new Date()): Prisma.PlayWhereInput {
  return { AND: [
    { OR: [
      { status: "PUBLISHED" },
      { status: "UPCOMING", launchedOn: { lte: kathmanduToday(now) } },
    ] },
    ...publicationWindow(now),
  ] };
}

export function upcomingPlayWhere(now = new Date()): Prisma.PlayWhereInput {
  return { AND: [
    { status: "UPCOMING" },
    { OR: [{ launchedOn: null }, { launchedOn: { gt: kathmanduToday(now) } }] },
    ...publicationWindow(now),
  ] };
}

export function playingNowWhere(now = new Date()): Prisma.PlayWhereInput {
  const today = kathmanduToday(now);
  return { AND: [
    releasedPlayWhere(now),
    { OR: [
      { launchedOn: { lte: today }, OR: [{ endedOn: null }, { endedOn: { gte: today } }] },
      { launchedOn: null, OR: [{ endedOn: null }, { endedOn: { gte: today } }], shows: { some: { showtime: { gt: now } } } },
    ] },
  ] };
}

export function isPlayingNow(play: { launchedOn: Date | null; endedOn: Date | null; shows: unknown[] }, now = new Date()) {
  const today = kathmanduToday(now);
  if (play.endedOn && play.endedOn < today) return false;
  return play.launchedOn ? play.launchedOn <= today : play.shows.length > 0;
}

export function publicPlayWhere(now = new Date()): Prisma.PlayWhereInput {
  return { OR: [releasedPlayWhere(now), upcomingPlayWhere(now)] };
}
