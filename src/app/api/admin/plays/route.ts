import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { parseAdminProductionForm, productionSlug } from "@/lib/admin-productions";
import { prisma } from "@/lib/prisma";

function refreshProductionPages(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/play");
  revalidatePath("/admin/plays");
  revalidatePath("/theatre");
  if (slug) revalidatePath(`/play/${slug}`);
}

export async function POST(request: Request) {
  try {
    await requireStaff();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const fallbackSite = theatre
    ? null
    : await prisma.site.findFirst({ orderBy: { id: "asc" }, select: { id: true } });
  const siteId = theatre?.siteId ?? fallbackSite?.id;
  if (!siteId) {
    return Response.json({ error: "A site must exist before adding a production." }, { status: 400 });
  }

  try {
    let created: { id: number; slug: string | null; title: string } | null = null;

    for (let attempt = 0; attempt < 3 && !created; attempt += 1) {
      try {
        created = await prisma.$transaction(
          async (tx) => {
            const maxId = await tx.play.aggregate({ _max: { id: true } });
            const id = (maxId._max.id ?? 0) + 1;
            const now = new Date();
            const play = await tx.play.create({
              data: {
                id,
                siteId,
                theatreId: input.theatreId,
                title: input.title,
                slug: productionSlug(input.title, id),
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
                created: now,
                updated: now,
              },
              select: { id: true, slug: true, title: true },
            });

            if (input.theatreId) {
              await tx.theatre.update({ where: { id: input.theatreId }, data: { updated: now } });
            }
            return play;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        const retryable =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === "P2002" || error.code === "P2034");
        if (!retryable || attempt === 2) throw error;
      }
    }

    if (!created) throw new Error("CREATE_FAILED");
    refreshProductionPages(created.slug);
    return Response.json({ play: created, message: `“${created.title}” was added.` }, { status: 201 });
  } catch (error) {
    console.error("Admin production create failed", error);
    return Response.json({ error: "Unable to add this production right now." }, { status: 500 });
  }
}
