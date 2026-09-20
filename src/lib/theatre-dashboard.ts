import { cache } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getOwnerTheatre = cache(async () => {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!user.isPasswordChanged) redirect("/set-new-password");
  if (user.isStaff || user.isSuperuser) redirect("/admin");

  const theatre = await prisma.theatre.findUnique({
    where: { ownerId: user.id },
    include: {
      plays: { orderBy: [{ updated: "desc" }, { title: "asc" }] },
      showsMeta: { include: { play: true, excludeDates: true, extraShows: true }, orderBy: { startDate: "desc" } },
      shows: { include: { play: true }, orderBy: { showtime: "desc" } },
    },
  });

  // These tables may not exist until the deployment runs `prisma db push`.
  // Keep the owner dashboard usable while that one-time sync is pending.
  if (!theatre) return { user, theatre: null };
  const [reels, stories] = await Promise.all([
    prisma.theatreReel.findMany({ where: { theatreId: theatre.id }, orderBy: { created: "desc" } }).catch(() => []),
    prisma.theatreStory.findMany({ where: { theatreId: theatre.id }, orderBy: { created: "desc" } }).catch(() => []),
  ]);

  return { user, theatre: { ...theatre, reels, stories } };
});

export function formatDate(value: Date | string | null) {
  if (!value) return "Not set";
  const d = new Date(value);
  return Number.isNaN(d.valueOf())
    ? "Not set"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
