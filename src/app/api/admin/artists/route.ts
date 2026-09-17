import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { artistSlug, parseAdminArtistForm } from "@/lib/admin-artists";
import { prisma } from "@/lib/prisma";

function refreshArtistPages(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/admin/profiles");
  revalidatePath("/admin/plays");
  if (slug) revalidatePath(`/profile/${slug}`);
}

export async function POST(request: Request) {
  try { await requireStaff(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }
  const parsed = parseAdminArtistForm(await request.formData());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });
  const site = await prisma.site.findFirst({ orderBy: { id: "asc" }, select: { id: true } });
  if (!site) return Response.json({ error: "A site must exist before adding an artist." }, { status: 400 });

  try {
    let created: { id: number; name: string; slug: string | null } | null = null;
    for (let attempt = 0; attempt < 3 && !created; attempt += 1) {
      try {
        created = await prisma.$transaction(async (tx) => {
          const max = await tx.profile.aggregate({ _max: { id: true } });
          const id = (max._max.id ?? 0) + 1;
          const now = new Date();
          const input = parsed.data;
          return tx.profile.create({
            data: {
              id, siteId: site.id, title: input.name, name: input.name,
              slug: input.slug ?? `${artistSlug(input.name)}-${id}`,
              metaTitle: input.metaTitle, description: input.description, genDescription: false,
              keywordsString: input.keywordsString, created: now, updated: now, status: input.status,
              publishDate: input.publishDate, expiryDate: input.expiryDate, inSitemap: input.inSitemap,
              profilePic: input.profilePic, email: input.email, mobile: input.mobile, dob: input.dob,
              activeSince: input.activeSince, linkWebsite: input.linkWebsite, linkFacebook: input.linkFacebook,
              linkTwitter: input.linkTwitter, linkInstagram: input.linkInstagram, bio: input.bio, address: input.address,
            },
            select: { id: true, name: true, slug: true },
          });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        const retry = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
        if (!retry || attempt === 2) throw error;
      }
    }
    if (!created) throw new Error("CREATE_FAILED");
    refreshArtistPages(created.slug);
    return Response.json({ message: `“${created.name}” was added.` }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ error: "That artist URL slug is already in use." }, { status: 409 });
    console.error("Admin artist create failed", error);
    return Response.json({ error: "Unable to add this artist right now." }, { status: 500 });
  }
}
