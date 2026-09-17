import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { parseAdminTheatreForm } from "@/lib/admin-theatres";
import { prisma } from "@/lib/prisma";

function theatreId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function refreshTheatrePages(...slugs: Array<string | null | undefined>) {
  revalidatePath("/");
  revalidatePath("/theatre");
  revalidatePath("/play");
  revalidatePath("/admin/theatres");
  revalidatePath("/admin/plays");
  slugs.forEach((slug) => {
    if (slug) revalidatePath(`/theatre/${slug}`);
  });
}

async function staffRequestId(context: RouteContext<"/api/admin/theatres/[id]">) {
  try {
    await requireStaff();
  } catch {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const params = await context.params;
  const id = theatreId(params.id);
  return id
    ? { id }
    : { error: Response.json({ error: "Invalid theatre ID." }, { status: 400 }) };
}

export async function GET(_request: Request, context: RouteContext<"/api/admin/theatres/[id]">) {
  const access = await staffRequestId(context);
  if ("error" in access) return access.error;

  const theatre = await prisma.theatre.findUnique({
    where: { id: access.id },
    include: {
      owner: { select: { firstName: true, lastName: true, username: true, email: true, lastLogin: true, dateJoined: true } },
      plays: { select: { id: true, title: true, slug: true, coverImage: true, status: true, launchedOn: true, ratingAverage: true }, orderBy: { title: "asc" } },
      shows: { include: { play: true }, orderBy: { showtime: "desc" } },
      showsMeta: { include: { play: true, excludeDates: true, extraShows: true }, orderBy: { startDate: "desc" } },
    },
  });
  return theatre ? Response.json(theatre) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: Request, context: RouteContext<"/api/admin/theatres/[id]">) {
  const access = await staffRequestId(context);
  if ("error" in access) return access.error;

  const existing = await prisma.theatre.findUnique({
    where: { id: access.id },
    select: { id: true, slug: true },
  });
  if (!existing) return Response.json({ error: "Theatre not found." }, { status: 404 });

  const parsed = parseAdminTheatreForm(await request.formData());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const input = parsed.data;
    const updated = await prisma.theatre.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        slug: input.slug ?? existing.slug,
        metaTitle: input.metaTitle,
        description: input.description,
        genDescription: false,
        keywordsString: input.keywordsString,
        updated: new Date(),
        status: input.status,
        publishDate: input.publishDate,
        expiryDate: input.expiryDate,
        inSitemap: input.inSitemap,
        about: input.about,
        profilePic: input.profilePic,
        coverImage: input.coverImage,
        establishedOn: input.establishedOn,
        closedOn: input.closedOn,
        email: input.email,
        phone: input.phone,
        address: input.address,
        linkWebsite: input.linkWebsite,
        linkFacebook: input.linkFacebook,
        linkTwitter: input.linkTwitter,
        linkInstagram: input.linkInstagram,
      },
      select: { id: true, slug: true, title: true },
    });
    refreshTheatrePages(existing.slug, updated.slug);
    revalidatePath(`/admin/theatres/${existing.id}`);
    return Response.json({ theatre: updated, message: `“${updated.title}” was updated.` });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "That URL slug is already used by another theatre." }, { status: 409 });
    }
    console.error("Admin theatre update failed", error);
    return Response.json({ error: "Unable to update this theatre right now." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/theatres/[id]">) {
  const access = await staffRequestId(context);
  if ("error" in access) return access.error;

  const existing = await prisma.theatre.findUnique({
    where: { id: access.id },
    select: { id: true, title: true, slug: true },
  });
  if (!existing) return Response.json({ error: "Theatre not found." }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.deleteMany({ where: { show: { theatreId: existing.id } } });
      await tx.show.deleteMany({ where: { theatreId: existing.id } });
      await tx.showsMeta.deleteMany({ where: { theatreId: existing.id } });
      await tx.play.updateMany({ where: { theatreId: existing.id }, data: { theatreId: null } });
      await tx.theatre.delete({ where: { id: existing.id } });
    });
    refreshTheatrePages(existing.slug);
    return Response.json({
      message: `“${existing.title}” was deleted. Its productions were kept as standalone archive records.`,
    });
  } catch (error) {
    console.error("Admin theatre delete failed", error);
    return Response.json({ error: "Unable to delete this theatre right now." }, { status: 500 });
  }
}
