import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import {
  FESTIVAL_LIVE_STAGE_SLUG,
  FESTIVAL_LIVE_STAGE_TITLE,
  festivalPostSlug,
  festivalSeriesTitle,
  parseFestivalForm,
} from "@/lib/festivals";
import { prisma } from "@/lib/prisma";

async function ensureCategory(tx: Prisma.TransactionClient, slug: string, title: string) {
  const existing = await tx.blogCategory.findUnique({ where: { slug }, select: { id: true } });
  if (existing) return existing.id;
  const max = await tx.blogCategory.aggregate({ _max: { id: true } });
  const category = await tx.blogCategory.create({
    data: { id: (max._max.id ?? 0) + 1, slug, title },
    select: { id: true },
  });
  return category.id;
}

function refreshFestivalPages(slug?: string) {
  revalidatePath("/festival");
  revalidatePath("/blog");
  revalidatePath("/admin");
  revalidatePath("/admin/festivals");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireStaff();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = parseFestivalForm(await request.formData());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const site = await prisma.site.findFirst({ orderBy: { id: "asc" }, select: { id: true } });
  if (!site) return Response.json({ error: "A site must exist before adding festival content." }, { status: 400 });

  try {
    let created: { id: number; slug: string; title: string } | null = null;

    for (let attempt = 0; attempt < 3 && !created; attempt += 1) {
      try {
        created = await prisma.$transaction(
          async (tx) => {
            const input = parsed.data;
            const seriesCategoryId = await ensureCategory(
              tx,
              input.seriesSlug,
              festivalSeriesTitle(input.seriesSlug),
            );
            const categoryIds = [seriesCategoryId];
            if (input.placement === "LIVE") {
              categoryIds.push(
                await ensureCategory(tx, FESTIVAL_LIVE_STAGE_SLUG, FESTIVAL_LIVE_STAGE_TITLE),
              );
            }

            const max = await tx.blogPost.aggregate({ _max: { id: true } });
            const id = (max._max.id ?? 0) + 1;
            const now = new Date();
            const post = await tx.blogPost.create({
              data: {
                id,
                siteId: site.id,
                userId: user.id,
                title: input.title,
                slug: festivalPostSlug(input.title, id),
                metaTitle: input.title,
                description: input.description,
                genDescription: false,
                keywordsString: `festival, theatre, ${festivalSeriesTitle(input.seriesSlug)}`,
                content: input.content,
                created: now,
                updated: now,
                status: input.status,
                publishDate: input.publishDate,
                inSitemap: true,
                featuredImage: input.featuredImage,
              },
              select: { id: true, slug: true, title: true },
            });

            await tx.blogPostCategory.createMany({
              data: categoryIds.map((categoryId) => ({ postId: post.id, categoryId })),
            });
            return post;
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
    refreshFestivalPages(created.slug);
    return Response.json({ message: `“${created.title}” was added to Festivals.` }, { status: 201 });
  } catch (error) {
    console.error("Admin festival create failed", error);
    return Response.json({ error: "Unable to add this festival story right now." }, { status: 500 });
  }
}
