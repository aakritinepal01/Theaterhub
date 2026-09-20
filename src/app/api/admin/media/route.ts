import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    await requireStaff();
    const data = await request.formData();
    const kind = String(data.get("kind") || "");
    const theatreId = Number(data.get("theatreId"));
    const title = String(data.get("title") || "").trim();
    const url = String(data.get("url") || "").trim();
    const caption = String(data.get("caption") || "").trim();
    if (!Number.isInteger(theatreId) || theatreId < 1 || !title || !url || !(/^(https?:\/\/|\/)/i.test(url))) {
      return NextResponse.json({ error: "Theatre, title and a valid public URL are required" }, { status: 400 });
    }
    const theatre = await prisma.theatre.findUnique({ where: { id: theatreId }, select: { id: true } });
    if (!theatre) return NextResponse.json({ error: "Theatre not found" }, { status: 404 });
    if (kind === "reel") await prisma.theatreReel.create({ data: { theatreId, title, videoUrl: url, status: "PUBLISHED" } });
    else if (kind === "story") await prisma.theatreStory.create({ data: { theatreId, title, imageUrl: url, caption, status: "PUBLISHED" } });
    else return NextResponse.json({ error: "Unknown media type" }, { status: 400 });
    revalidatePath("/"); revalidatePath("/admin/media");
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to publish media" }, { status: 500 }); }
}
