import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { parseAdminTheatreForm, theatreSlug } from "@/lib/admin-theatres";
import { prisma } from "@/lib/prisma";

function refreshTheatrePages(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/theatre");
  revalidatePath("/admin/theatres");
  if (slug) revalidatePath(`/theatre/${slug}`);
}

export async function GET(request: Request) {
  try {
    await requireStaff();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();
  const unclaimed = url.searchParams.get("unclaimed") === "1";
  const theatres = await prisma.theatre.findMany({
    where: {
      title: search ? { contains: search, mode: "insensitive" } : undefined,
      ownerId: unclaimed ? null : undefined,
    },
    include: {
      owner: { select: { username: true, email: true } },
      _count: { select: { plays: true } },
    },
    orderBy: [{ updated: "desc" }, { title: "asc" }],
  });
  return Response.json(theatres);
}

export async function POST(request: Request) {
  try {
    await requireStaff();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = parseAdminTheatreForm(await request.formData());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const site = await prisma.site.findFirst({ orderBy: { id: "asc" }, select: { id: true } });
  if (!site) return Response.json({ error: "A site must exist before adding a theatre." }, { status: 400 });

  try {
    let created: { id: number; slug: string | null; title: string } | null = null;
    for (let attempt = 0; attempt < 3 && !created; attempt += 1) {
      try {
        created = await prisma.$transaction(async (tx) => {
          const maxId = await tx.theatre.aggregate({ _max: { id: true } });
          const id = (maxId._max.id ?? 0) + 1;
          const now = new Date();
          const input = parsed.data;
          return tx.theatre.create({
            data: {
              id,
              siteId: site.id,
              title: input.title,
              slug: input.slug ?? `${theatreSlug(input.title)}-${id}`,
              metaTitle: input.metaTitle,
              description: input.description,
              genDescription: false,
              keywordsString: input.keywordsString,
              created: now,
              updated: now,
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
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        const retryable = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
        if (!retryable || attempt === 2) throw error;
      }
    }

    if (!created) throw new Error("CREATE_FAILED");
    refreshTheatrePages(created.slug);
    return Response.json({ theatre: created, message: `“${created.title}” was added.` }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "That URL slug is already used by another theatre." }, { status: 409 });
    }
    console.error("Admin theatre create failed", error);
    return Response.json({ error: "Unable to add this theatre right now." }, { status: 500 });
  }
}
