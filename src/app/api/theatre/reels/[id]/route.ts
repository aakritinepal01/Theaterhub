import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function owned(id: string) {
  const user = await requireTheatreUser();
  return prisma.theatreReel.findFirst({ where: { id: Number(id), theatre: { ownerId: user.id } } });
}
export async function DELETE(_request: Request, context: RouteContext<"/api/theatre/reels/[id]">) {
  try { const reel = await owned((await context.params).id); if (!reel) return NextResponse.json({ error: "Access denied" }, { status: 403 }); await prisma.theatreReel.delete({ where: { id: reel.id } }); revalidatePath("/"); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Unable to delete reel" }, { status: 500 }); }
}
