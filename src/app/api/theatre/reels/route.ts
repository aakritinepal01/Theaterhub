import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ownedTheatre() {
  const user = await requireTheatreUser();
  return prisma.theatre.findUnique({ where: { ownerId: user.id }, select: { id: true, slug: true } });
}

export async function POST(request: Request) {
  try {
    const theatre = await ownedTheatre();
    if (!theatre) return NextResponse.json({ error: "No theatre assigned" }, { status: 403 });
    const data = await request.formData();
    const videoUrl = String(data.get("videoUrl") || "").trim();
    const title = String(data.get("title") || "TheatreHub").trim() || "TheatreHub";
    const status = String(data.get("status") || "PUBLISHED") === "DRAFT" ? "DRAFT" : "PUBLISHED";
    if (!videoUrl || !/^https?:\/\//i.test(videoUrl)) return NextResponse.json({ error: "A valid video URL is required" }, { status: 400 });
    await prisma.theatreReel.create({ data: { theatreId: theatre.id, title, videoUrl, status } });
    revalidatePath("/"); revalidatePath("/theatre-dashboard");
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to add reel" }, { status: 500 }); }
}
