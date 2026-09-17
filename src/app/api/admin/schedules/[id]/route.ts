import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { parseAdminScheduleForm } from "@/lib/admin-schedules";
import { prisma } from "@/lib/prisma";
import { regenerateShows } from "@/lib/showtimes";

function idValue(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function refreshSchedulePages() {
  revalidatePath("/");
  revalidatePath("/play");
  revalidatePath("/theatre");
  revalidatePath("/admin/schedules");
  revalidatePath("/theatre-dashboard");
  revalidatePath("/theatre-dashboard/schedules");
}

async function access(context: RouteContext<"/api/admin/schedules/[id]">) {
  try { await requireStaff(); } catch { return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) }; }
  const id = idValue((await context.params).id);
  return id ? { id } : { error: Response.json({ error: "Invalid schedule ID." }, { status: 400 }) };
}

export async function PATCH(request: Request, context: RouteContext<"/api/admin/schedules/[id]">) {
  const allowed = await access(context);
  if ("error" in allowed) return allowed.error;
  const existing = await prisma.showsMeta.findUnique({ where: { id: allowed.id } });
  if (!existing) return Response.json({ error: "Schedule not found." }, { status: 404 });

  const parsed = parseAdminScheduleForm(await request.formData());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });
  const play = await prisma.play.findUnique({ where: { id: parsed.data.playId }, select: { id: true, title: true, theatreId: true } });
  if (!play?.theatreId) return Response.json({ error: "Select a production assigned to a theatre." }, { status: 400 });
  const duplicate = await prisma.showsMeta.findFirst({ where: { playId: play.id, id: { not: existing.id } }, select: { id: true } });
  if (duplicate) return Response.json({ error: "That production already has another schedule." }, { status: 409 });

  const bookings = await prisma.booking.count({ where: { show: { playId: { in: [existing.playId, play.id] } } } });
  if (bookings) return Response.json({ error: "This schedule has bookings and cannot be regenerated. Remove or resolve its bookings first." }, { status: 409 });

  try {
    await prisma.$transaction(async (tx) => {
      if (existing.playId !== play.id) await tx.show.deleteMany({ where: { playId: existing.playId, theatreId: existing.theatreId } });
      await tx.showsMeta.update({ where: { id: existing.id }, data: { theatreId: play.theatreId!, ...parsed.data } });
    });
    const count = await regenerateShows(existing.id);
    refreshSchedulePages();
    return Response.json({ message: `Schedule updated. ${count} shows were generated.` });
  } catch (error) {
    console.error("Admin schedule update failed", error);
    return Response.json({ error: "Unable to update this schedule right now." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/schedules/[id]">) {
  const allowed = await access(context);
  if ("error" in allowed) return allowed.error;
  const existing = await prisma.showsMeta.findUnique({ where: { id: allowed.id }, include: { play: { select: { title: true } } } });
  if (!existing) return Response.json({ error: "Schedule not found." }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.deleteMany({ where: { show: { playId: existing.playId, theatreId: existing.theatreId } } });
      await tx.show.deleteMany({ where: { playId: existing.playId, theatreId: existing.theatreId } });
      await tx.showsMeta.delete({ where: { id: existing.id } });
    });
    const remaining = await prisma.showsMeta.findFirst({ where: { playId: existing.playId }, orderBy: { id: "desc" }, select: { id: true } });
    if (remaining) await regenerateShows(remaining.id);
    refreshSchedulePages();
    return Response.json({ message: `Schedule for “${existing.play.title}” was deleted.` });
  } catch (error) {
    console.error("Admin schedule delete failed", error);
    return Response.json({ error: "Unable to delete this schedule right now." }, { status: 500 });
  }
}
