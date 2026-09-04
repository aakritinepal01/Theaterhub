import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const slugify = (s:string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
export async function POST(request: Request) {
  try {
    const user = await requireTheatreUser(); const theatre = await prisma.theatre.findUnique({ where: { ownerId: user.id } });
    if (!theatre) return Response.json({ error: "Access denied" }, { status: 403 });
    const d = await request.formData(), title = String(d.get("title") || "").trim(); if (!title) return Response.json({ error: "Title is required" }, { status: 400 });
    await prisma.$transaction(async tx => { const max = await tx.play.aggregate({ _max: { id: true } }), base = slugify(title) || "play", id = (max._max.id ?? 0) + 1, s=(key:string)=>String(d.get(key)||"").trim(); await tx.play.create({ data: { id, siteId: theatre.siteId, theatreId: theatre.id, title, slug: `${base}-${id}`, status:s("status")==="DRAFT"?"DRAFT":"PUBLISHED", description:s("description"), abstract:s("abstract"), directorialNote:s("directorialNote"), coverImage:s("coverImage")||null, duration:s("duration")?Number(s("duration")):null, launchedOn:s("launchedOn")?new Date(s("launchedOn")):null, endedOn:s("endedOn")?new Date(s("endedOn")):null, isFeatured:d.get("isFeatured")==="on", created:new Date(), updated:new Date() } }); await tx.theatre.update({ where: { id: theatre.id }, data: { updated: new Date() } }); }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.redirect(new URL("/theatre-dashboard/productions?saved=play", request.url), 303);
  } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }
}
