import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regenerateShows } from "@/lib/showtimes";

export async function POST(_request: Request, context: RouteContext<"/api/admin/schedules/[id]/regenerate">) {
  try { await requireStaff(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Invalid schedule ID." }, { status: 400 });

  const schedule = await prisma.showsMeta.findUnique({ where: { id }, select: { playId: true } });
  if (!schedule) return Response.json({ error: "Schedule not found." }, { status: 404 });
  const bookings = await prisma.booking.count({ where: { show: { playId: schedule.playId } } });
  if (bookings) {
    return Response.json({ error: "Booked shows cannot be regenerated. Delete the schedule explicitly if those bookings should also be removed." }, { status: 409 });
  }

  try {
    const count = await regenerateShows(id);
    revalidatePath("/admin/schedules");
    revalidatePath("/theatre-dashboard/schedules");
    return Response.json({ count, message: `${count} shows were regenerated.` });
  } catch (error) {
    console.error("Admin schedule regeneration failed", error);
    return Response.json({ error: "Unable to regenerate this schedule right now." }, { status: 500 });
  }
}
