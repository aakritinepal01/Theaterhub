import { TheatreMediaStudio } from "@/components/TheatreMediaStudio";
import { getOwnerTheatre } from "@/lib/theatre-dashboard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TheatreMediaPage() {
  const { theatre } = await getOwnerTheatre();
  if (!theatre) return null;
  const posts = await prisma.theatrePost.findMany({
    where: { theatreId: theatre.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      kind: true,
      caption: true,
      createdAt: true,
      assets: {
        orderBy: { position: "asc" },
        select: { id: true, url: true, mediaType: true },
      },
    },
  });

  return <TheatreMediaStudio
    theatreName={theatre.title}
    posts={posts.map(post => ({ ...post, createdAt: post.createdAt.toISOString() }))}
  />;
}
