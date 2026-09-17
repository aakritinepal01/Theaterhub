import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { parseAdminScheduleForm } from "@/lib/admin-schedules";
import { prisma } from "@/lib/prisma";
import { regenerateShows } from "@/lib/showtimes";

function refreshSchedulePages() {
  revalidatePath("/");
  revalidatePath("/play");
  revalidatePath("/theatre");
  revalidatePath("/admin/schedules");
  revalidatePath("/theatre-dashboard");
  revalidatePath("/theatre-dashboard/schedules");
}

export async function POST(request: Request) {
  try { await requireStaff(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }

  const parsed = parseAdminScheduleForm(await request.formData());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });
  const play = await prisma.play.findUnique({ where: { id: parsed.data.playId }, select: { id: true, title: true, theatreId: true } });
  if (!play?.theatreId) return Response.json({ error: "Select a production assigned to a theatre." }, { status: 400 });
  if (await prisma.showsMeta.findFirst({ where: { playId: play.id }, select: { id: true } })) {
    return Response.json({ error: "This production already has a schedule. Edit the existing schedule instead." }, { status: 409 });
  }

  let createdId: number | null = null;
  try {
    for (let attempt = 0; attempt < 3 && !createdId; attempt += 1) {
      try {
        createdId = await prisma.$transaction(async (tx) => {
          const max = await tx.showsMeta.aggregate({ _max: { id: true } });
          const id = (max._max.id ?? 0) + 1;
          await tx.showsMeta.create({ data: { id, theatreId: play.theatreId!, ...parsed.data } });
          return id;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        const retry = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
        if (!retry || attempt === 2) throw error;
      }
    }
    if (!createdId) throw new Error("CREATE_FAILED");
    await regenerateShows(createdId);
    refreshSchedulePages();
    return Response.json({ message: `Schedule for “${play.title}” was added and shows were generated.` }, { status: 201 });
  } catch (error) {
    if (createdId) await prisma.showsMeta.deleteMany({ where: { id: createdId } }).catch(() => undefined);
    console.error("Admin schedule create failed", error);
    return Response.json({ error: "Unable to create this schedule right now." }, { status: 500 });
  }
}
