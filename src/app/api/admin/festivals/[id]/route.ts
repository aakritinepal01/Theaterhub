import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import {
  FESTIVAL_CATEGORY_SLUGS,
  FESTIVAL_LIVE_STAGE_SLUG,
  FESTIVAL_LIVE_STAGE_TITLE,
  festivalSeriesTitle,
  parseFestivalForm,
} from "@/lib/festivals";
import { prisma } from "@/lib/prisma";

function festivalId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function ensureCategory(
  tx: Prisma.TransactionClient,
  slug: string,
  title: string,
) {
  const existing = await tx.blogCategory.findUnique({ where: { slug }, select: { id: true } });
  if (existing) return existing.id;
  const max = await tx.blogCategory.aggregate({ _max: { id: true } });
  return (
    await tx.blogCategory.create({
      data: { id: (max._max.id ?? 0) + 1, slug, title },
      select: { id: true },
    })
  ).id;
}

function refreshFestivalPages(slug?: string) {
  revalidatePath("/festival");
  revalidatePath("/blog");
  revalidatePath("/admin");
  revalidatePath("/admin/festivals");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = festivalId(rawId);
  if (!id) return Response.json({ error: "Invalid festival story ID." }, { status: 400 });

  const existing = await prisma.blogPost.findFirst({
    where: {
      id,
      categories: { some: { category: { slug: { in: [...FESTIVAL_CATEGORY_SLUGS] } } } },
    },
    select: { id: true, slug: true },
  });
  if (!existing) return Response.json({ error: "Festival story not found." }, { status: 404 });

  const parsed = parseFestivalForm(await request.formData());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const updated = await prisma.$transaction(async (tx) => {
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

      const managedCategories = await tx.blogCategory.findMany({
        where: { slug: { in: [...FESTIVAL_CATEGORY_SLUGS, FESTIVAL_LIVE_STAGE_SLUG] } },
        select: { id: true },
      });
      await tx.blogPostCategory.deleteMany({
        where: { postId: id, categoryId: { in: managedCategories.map((category) => category.id) } },
      });
      await tx.blogPostCategory.createMany({
        data: categoryIds.map((categoryId) => ({ postId: id, categoryId })),
      });

      return tx.blogPost.update({
        where: { id },
        data: {
          title: input.title,
          metaTitle: input.title,
          description: input.description,
          genDescription: false,
          keywordsString: `festival, theatre, ${festivalSeriesTitle(input.seriesSlug)}`,
          content: input.content,
          updated: new Date(),
          status: input.status,
          publishDate: input.publishDate,
          featuredImage: input.featuredImage,
        },
        select: { slug: true, title: true },
      });
    });

    refreshFestivalPages(updated.slug);
    return Response.json({ message: `“${updated.title}” was updated.` });
  } catch (error) {
    console.error("Admin festival update failed", error);
    return Response.json({ error: "Unable to update this festival story right now." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = festivalId(rawId);
  if (!id) return Response.json({ error: "Invalid festival story ID." }, { status: 400 });

  const existing = await prisma.blogPost.findFirst({
    where: {
      id,
      categories: { some: { category: { slug: { in: [...FESTIVAL_CATEGORY_SLUGS] } } } },
    },
    select: { id: true, slug: true, title: true },
  });
  if (!existing) return Response.json({ error: "Festival story not found." }, { status: 404 });

  try {
    await prisma.blogPost.delete({ where: { id } });
    refreshFestivalPages(existing.slug);
    return Response.json({ message: `“${existing.title}” was deleted.` });
  } catch (error) {
    console.error("Admin festival delete failed", error);
    return Response.json({ error: "Unable to delete this festival story right now." }, { status: 500 });
  }
}
