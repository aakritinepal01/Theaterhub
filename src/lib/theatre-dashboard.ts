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

  return { user, theatre };
});

export function formatDate(value: Date | string | null) {
  if (!value) return "Not set";
  const d = new Date(value);
  return Number.isNaN(d.valueOf())
    ? "Not set"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
