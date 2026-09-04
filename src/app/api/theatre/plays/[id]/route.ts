import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
async function ownedPlay(rawId:string) { const user = await requireTheatreUser(); return prisma.play.findFirst({ where: { id: Number(rawId), theatre: { ownerId: user.id } } }); }
export async function PATCH(request: Request, context: RouteContext<"/api/theatre/plays/[id]">) {
  try {
    const { id } = await context.params, play = await ownedPlay(id);
    if (!play) return Response.json({ error: "Access denied" }, { status: 403 });
    const d=await request.formData(), s=(k:string)=>String(d.get(k)||"").trim(), now=new Date();
    if(!s("title")) return Response.json({error:"Title is required"},{status:400});
    const credits = [
      ...d.getAll("director").map(value=>({name:String(value).trim(),kind:"maker" as const,role:"Director"})),
      ...d.getAll("onStage").map(value=>({name:String(value).trim(),kind:"cast" as const,role:"On-stage artist"})),
      ...d.getAll("offStage").map(value=>({name:String(value).trim(),kind:"crew" as const,role:"Off-stage artist"})),
    ].filter(credit=>credit.name);
    await prisma.$transaction(async tx=>{
      const status = (s("status") === "UPCOMING" ? "UPCOMING" : "PUBLISHED") as any;
      await tx.play.update({ where:{id:play.id}, data:{title:s("title"),abstract:s("abstract"),directorialNote:s("directorialNote"),description:s("description"),coverImage:s("coverImage")||null,duration:s("duration")?Number(s("duration")):null,launchedOn:s("launchedOn")?new Date(s("launchedOn")):null,endedOn:s("endedOn")?new Date(s("endedOn")):null,status,isFeatured:status==="PUBLISHED"||d.get("isFeatured")==="on",updated:now} });
      await Promise.all([tx.playMaker.deleteMany({where:{playId:play.id}}),tx.playCast.deleteMany({where:{playId:play.id}}),tx.playCrew.deleteMany({where:{playId:play.id}})]);
      let nextProfileId=((await tx.profile.aggregate({_max:{id:true}}))._max.id??0)+1;
      let nextMakerId=((await tx.playMaker.aggregate({_max:{id:true}}))._max.id??0)+1;
      let nextCastId=((await tx.playCast.aggregate({_max:{id:true}}))._max.id??0)+1;
      let nextCrewId=((await tx.playCrew.aggregate({_max:{id:true}}))._max.id??0)+1;
      for(const [order,credit] of credits.entries()){
        let profile=await tx.profile.findFirst({where:{siteId:play.siteId,name:{equals:credit.name,mode:"insensitive"}}});
        if(!profile){const profileId=nextProfileId++;profile=await tx.profile.create({data:{id:profileId,siteId:play.siteId,title:credit.name,name:credit.name,slug:`${slugify(credit.name)||"artist"}-${profileId}`,created:now,updated:now}})}
        if(credit.kind==="maker")await tx.playMaker.create({data:{id:nextMakerId++,playId:play.id,profileId:profile.id,role:credit.role,order}});
        if(credit.kind==="cast")await tx.playCast.create({data:{id:nextCastId++,playId:play.id,profileId:profile.id,role:credit.role,order}});
        if(credit.kind==="crew")await tx.playCrew.create({data:{id:nextCrewId++,playId:play.id,profileId:profile.id,role:credit.role,order}});
      }
      if(play.theatreId)await tx.theatre.update({where:{id:play.theatreId},data:{updated:now}});
    },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable,maxWait:10000,timeout:30000});
    revalidatePath("/"); revalidatePath("/play"); revalidatePath("/theatre-dashboard");
    return NextResponse.json({ok:true});
  } catch { return Response.json({error:"Unable to update play"},{status:500}); }
}
export async function DELETE(_request: Request, context: RouteContext<"/api/theatre/plays/[id]">) { try { const {id}=await context.params,play=await ownedPlay(id);if(!play)return Response.json({error:"Access denied"},{status:403});await prisma.$transaction([prisma.play.delete({where:{id:play.id}}),prisma.theatre.update({where:{id:play.theatreId!},data:{updated:new Date()}})]);return Response.json({ok:true});}catch{return Response.json({error:"Unauthorized"},{status:401});} }

const slugify = (value:string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
