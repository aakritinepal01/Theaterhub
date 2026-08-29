import { NextResponse } from "next/server";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
async function owned() { const user = await requireTheatreUser(); return prisma.theatre.findUnique({ where: { ownerId: user.id }, include: { plays: { orderBy: [{ updated: "desc" }, { title: "asc" }] } } }); }
export async function GET() { try { const theatre = await owned(); return theatre ? Response.json(theatre) : Response.json({ error: "Access denied" }, { status: 403 }); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); } }
export async function PATCH(request: Request) {
  try {
    const user = await requireTheatreUser(); const theatre = await prisma.theatre.findUnique({ where: { ownerId: user.id } });
    if (!theatre) return Response.json({ error: "Access denied" }, { status: 403 });
    const d = await request.formData(), str = (k:string) => String(d.get(k) || "").trim(), date = (k:string) => str(k) ? new Date(str(k)) : null;
    const title = str("title");
    if (!title) return Response.json({ error: "Theatre name is required" }, { status: 400 });
    await prisma.theatre.update({ where: { id: theatre.id }, data: { title, status: str("status") === "DRAFT" ? "DRAFT" : "PUBLISHED", about: str("about"), profilePic: str("profilePic") || null, coverImage: str("coverImage") || null, email: str("email"), phone: str("phone"), address: str("address"), linkWebsite: str("linkWebsite"), linkFacebook: str("linkFacebook"), linkTwitter: str("linkTwitter"), linkInstagram: str("linkInstagram"), establishedOn: date("establishedOn"), closedOn: date("closedOn"), updated: new Date() } });
    return NextResponse.redirect(new URL("/theatre-dashboard?saved=profile", request.url), 303);
  } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }
}
