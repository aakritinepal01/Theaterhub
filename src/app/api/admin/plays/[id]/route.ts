import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { parseAdminProductionForm } from "@/lib/admin-productions";
import { prisma } from "@/lib/prisma";

function refreshProductionPages(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/play");
  revalidatePath("/admin/plays");
  revalidatePath("/theatre");
  if (slug) revalidatePath(`/play/${slug}`);
}

function readProductionId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaff();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = readProductionId(rawId);
  if (!id) return Response.json({ error: "Invalid production ID." }, { status: 400 });

  const existing = await prisma.play.findUnique({
    where: { id },
    select: { id: true, slug: true, theatreId: true },
  });
  if (!existing) return Response.json({ error: "Production not found." }, { status: 404 });

  const parsed = parseAdminProductionForm(await request.formData());
  if (!parsed.success) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const input = parsed.data;
  const theatre = input.theatreId
    ? await prisma.theatre.findUnique({
        where: { id: input.theatreId },
        select: { id: true, siteId: true },
      })
    : null;
  if (input.theatreId && !theatre) {
    return Response.json({ error: "The selected theatre no longer exists." }, { status: 400 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const play = await tx.play.update({
        where: { id },
        data: {
          ...(theatre ? { siteId: theatre.siteId } : {}),
          theatreId: input.theatreId,
          title: input.title,
          metaTitle: input.metaTitle,
          description: input.description,
          genDescription: false,
          keywordsString: input.keywordsString,
          status: input.status,
          publishDate: input.publishDate,
          expiryDate: input.expiryDate,
          inSitemap: input.inSitemap,
          abstract: input.abstract,
          directorialNote: input.directorialNote,
          coverImage: input.coverImage,
          duration: input.duration,
          launchedOn: input.launchedOn,
          endedOn: input.endedOn,
          isFeatured: input.isFeatured,
          updated: now,
        },
        select: { id: true, slug: true, title: true },
      });

      const affectedTheatres = new Set(
        [existing.theatreId, input.theatreId].filter((value): value is number => value !== null),
      );
      if (affectedTheatres.size) {
        await tx.theatre.updateMany({
          where: { id: { in: [...affectedTheatres] } },
          data: { updated: now },
        });
      }
      return play;
    });

    refreshProductionPages(updated.slug);
    return Response.json({ play: updated, message: `“${updated.title}” was updated.` });
  } catch (error) {
    console.error("Admin production update failed", error);
    return Response.json({ error: "Unable to update this production right now." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaff();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = readProductionId(rawId);
  if (!id) return Response.json({ error: "Invalid production ID." }, { status: 400 });

  const existing = await prisma.play.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, theatreId: true },
  });
  if (!existing) return Response.json({ error: "Production not found." }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.deleteMany({ where: { show: { playId: id } } });
      await tx.play.delete({ where: { id } });
      if (existing.theatreId) {
        await tx.theatre.update({
          where: { id: existing.theatreId },
          data: { updated: new Date() },
        });
      }
    });

    refreshProductionPages(existing.slug);
    return Response.json({ message: `“${existing.title}” was permanently deleted.` });
  } catch (error) {
    console.error("Admin production delete failed", error);
    return Response.json({ error: "Unable to delete this production right now." }, { status: 500 });
  }
}
