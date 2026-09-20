import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await requireTheatreUser();
    const theatre = await prisma.theatre.findUnique({ where: { ownerId: user.id }, select: { id: true } });
    if (!theatre) return NextResponse.json({ error: "No theatre assigned" }, { status: 403 });
    const data = await request.formData();
    const title = String(data.get("title") || "").trim();
    const imageUrl = String(data.get("imageUrl") || "").trim();
    const caption = String(data.get("caption") || "").trim();
    const status = String(data.get("status") || "PUBLISHED") === "DRAFT" ? "DRAFT" : "PUBLISHED";
    if (!title || !imageUrl || !/^https?:\/\//i.test(imageUrl)) return NextResponse.json({ error: "Title and a valid image URL are required" }, { status: 400 });
    await prisma.theatreStory.create({ data: { theatreId: theatre.id, title, imageUrl, caption, status } });
    revalidatePath("/"); revalidatePath("/theatre-dashboard");
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to add story" }, { status: 500 }); }
}
