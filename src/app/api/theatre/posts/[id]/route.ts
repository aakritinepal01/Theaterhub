import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireTheatreUser();
    const { id } = await context.params;

    const theatre = await prisma.theatre.findUnique({ where: { ownerId: user.id }, select: { id: true } });
    if (!theatre) return Response.json({ error: "Access denied" }, { status: 403 });

    const post = await prisma.theatrePost.findFirst({ where: { id, theatreId: theatre.id } });
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    await prisma.theatrePost.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/theatre-dashboard/media");

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "PASSWORD_CHANGE_REQUIRED")) {
      return Response.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }
    console.error("Delete theatre post failed", error);
    return Response.json({ error: "Unable to delete post." }, { status: 500 });
  }
}
