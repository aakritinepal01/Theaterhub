import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { parseAdminArtistForm } from "@/lib/admin-artists";
import { prisma } from "@/lib/prisma";

function refreshArtistPages(...slugs: Array<string | null | undefined>) {
  revalidatePath("/"); revalidatePath("/profile"); revalidatePath("/admin/profiles"); revalidatePath("/admin/plays");
  slugs.forEach((slug) => { if (slug) revalidatePath(`/profile/${slug}`); });
}

async function access(context: RouteContext<"/api/admin/artists/[id]">) {
  try { await requireStaff(); } catch { return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) }; }
  const id = Number((await context.params).id);
  return Number.isInteger(id) && id > 0 ? { id } : { error: Response.json({ error: "Invalid artist ID." }, { status: 400 }) };
}

export async function PATCH(request: Request, context: RouteContext<"/api/admin/artists/[id]">) {
  const allowed = await access(context);
  if ("error" in allowed) return allowed.error;
  const existing = await prisma.profile.findUnique({ where: { id: allowed.id }, select: { id: true, slug: true } });
  if (!existing) return Response.json({ error: "Artist not found." }, { status: 404 });
  const parsed = parseAdminArtistForm(await request.formData());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const input = parsed.data;
    const updated = await prisma.profile.update({
      where: { id: existing.id },
      data: {
        title: input.name, name: input.name, slug: input.slug ?? existing.slug,
        metaTitle: input.metaTitle, description: input.description, genDescription: false,
        keywordsString: input.keywordsString, updated: new Date(), status: input.status,
        publishDate: input.publishDate, expiryDate: input.expiryDate, inSitemap: input.inSitemap,
        profilePic: input.profilePic, email: input.email, mobile: input.mobile, dob: input.dob,
        activeSince: input.activeSince, linkWebsite: input.linkWebsite, linkFacebook: input.linkFacebook,
        linkTwitter: input.linkTwitter, linkInstagram: input.linkInstagram, bio: input.bio, address: input.address,
      },
      select: { name: true, slug: true },
    });
    refreshArtistPages(existing.slug, updated.slug);
    return Response.json({ message: `“${updated.name}” was updated.` });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ error: "That artist URL slug is already in use." }, { status: 409 });
    console.error("Admin artist update failed", error);
    return Response.json({ error: "Unable to update this artist right now." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/artists/[id]">) {
  const allowed = await access(context);
  if ("error" in allowed) return allowed.error;
  const existing = await prisma.profile.findUnique({ where: { id: allowed.id }, select: { id: true, name: true, slug: true } });
  if (!existing) return Response.json({ error: "Artist not found." }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.playMaker.deleteMany({ where: { profileId: existing.id } });
      await tx.playCast.deleteMany({ where: { profileId: existing.id } });
      await tx.playCrew.deleteMany({ where: { profileId: existing.id } });
      await tx.profile.delete({ where: { id: existing.id } });
    });
    refreshArtistPages(existing.slug);
    return Response.json({ message: `“${existing.name}” and all connected production credits were deleted.` });
  } catch (error) {
    console.error("Admin artist delete failed", error);
    return Response.json({ error: "Unable to delete this artist right now." }, { status: 500 });
  }
}
