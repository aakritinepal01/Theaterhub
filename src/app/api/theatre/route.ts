import { NextResponse } from "next/server";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
async function owned() { const user = await requireTheatreUser(); return prisma.theatre.findUnique({ where: { ownerId: user.id }, include: { plays: { orderBy: [{ updated: "desc" }, { title: "asc" }] } } }); }
export async function GET() { try { const theatre = await owned(); return theatre ? Response.json(theatre) : Response.json({ error: "Access denied" }, { status: 403 }); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); } }
export async function PATCH(request: Request) {
  try {
    const user = await requireTheatreUser(); const theatre = await prisma.theatre.findUnique({ where: { ownerId: user.id } });
    if (!theatre) return Response.json({ error: "Access denied" }, { status: 403 });
    const d = await request.formData(), str = (k:string) => String(d.get(k) || "").trim(), date = (k:string) => str(k) ? new Date(str(k)) : null;
    const title = str("title");
    if (!title) return Response.json({ error: "Theatre name is required" }, { status: 400 });
    const profilePic=await saveImage(d.get("profilePicFile"),"theatre_logo")||str("profilePic")||null;
    const coverImage=await saveImage(d.get("coverImageFile"),"theatre_cover")||str("coverImage")||null;
    await prisma.theatre.update({ where: { id: theatre.id }, data: { title, status: str("status") === "DRAFT" ? "DRAFT" : "PUBLISHED", about: str("about"), profilePic, coverImage, email: str("email"), phone: str("phone"), address: str("address"), linkWebsite: str("linkWebsite"), linkFacebook: str("linkFacebook"), linkTwitter: str("linkTwitter"), linkInstagram: str("linkInstagram"), establishedOn: date("establishedOn"), closedOn: date("closedOn"), updated: new Date() } });
    return NextResponse.json({ok:true});
  } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }
}

async function saveImage(value:FormDataEntryValue|null,folder:string) {
  if(!(value instanceof File)||!value.size)return null;
  if(value.size>5*1024*1024)throw new Error("Image must be smaller than 5 MB");
  const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"};
  const extension=extensions[value.type];
  if(!extension)throw new Error("Unsupported image type");
  const directory=path.join(process.cwd(),"public","uploads",folder);
  await mkdir(directory,{recursive:true});
  const filename=`${randomUUID()}.${extension}`;
  await writeFile(path.join(directory,filename),Buffer.from(await value.arrayBuffer()));
  return `/uploads/${folder}/${filename}`;
}
