import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET(_request: Request, context: RouteContext<"/api/admin/theatres/[id]">) {
  try { await requireStaff(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await context.params;
  const theatre = await prisma.theatre.findUnique({ where: { id: Number(id) }, include: { owner: { select: { firstName: true, lastName: true, username: true, email: true, lastLogin: true, dateJoined: true } }, plays: { select: { id: true, title: true, slug: true, coverImage: true, status: true, launchedOn: true, ratingAverage: true }, orderBy: { title: "asc" } }, shows: { include: { play: true }, orderBy: { showtime: "desc" } }, showsMeta: { include: { play: true, excludeDates: true, extraShows: true }, orderBy: { startDate: "desc" } } } });
  return theatre ? Response.json(theatre) : Response.json({ error: "Not found" }, { status: 404 });
}
