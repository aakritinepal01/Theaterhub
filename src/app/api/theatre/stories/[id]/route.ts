import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, context: RouteContext<"/api/theatre/stories/[id]">) {
  try {
    const user = await requireTheatreUser();
    const story = await prisma.theatreStory.findFirst({ where: { id: Number((await context.params).id), theatre: { ownerId: user.id } } });
    if (!story) return NextResponse.json({ error: "Access denied" }, { status: 403 });
    await prisma.theatreStory.delete({ where: { id: story.id } }); revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to delete story" }, { status: 500 }); }
}
