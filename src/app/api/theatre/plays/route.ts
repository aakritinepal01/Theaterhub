import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const slugify=(value:string)=>value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const stringValue=(data:FormData,key:string)=>String(data.get(key)||"").trim();

export async function POST(request:Request) {
  try {
    const user=await requireTheatreUser();
    const theatre=await prisma.theatre.findUnique({where:{ownerId:user.id}});
    if(!theatre)return Response.json({error:"Access denied"},{status:403});

    const data=await request.formData();
    const title=stringValue(data,"title");
    if(!title)return Response.json({error:"Title is required"},{status:400});
    const durationText=stringValue(data,"duration");
    const duration=durationText?Number(durationText):null;
    if(duration!==null&&(!Number.isInteger(duration)||duration<1))return Response.json({error:"Duration must be a positive whole number"},{status:400});
    const launchedOn=parseDate(data,"launchedOn");
    const endedOn=parseDate(data,"endedOn");
    if(launchedOn&&endedOn&&endedOn<launchedOn)return Response.json({error:"Closing date must be after the opening date"},{status:400});
    const status=stringValue(data,"status")==="UPCOMING"?"UPCOMING":stringValue(data,"status")==="DRAFT"?"DRAFT":"PUBLISHED";

    let playId: number | null = null;
    for (let attempt = 0; attempt < 3 && playId === null; attempt++) {
      try {
        playId = await prisma.$transaction(async tx=>{
          const maximum=await tx.play.aggregate({_max:{id:true}});
          const id=(maximum._max.id??0)+1;
          await tx.play.create({data:{
            id,
            siteId:theatre.siteId,
            theatreId:theatre.id,
            title,
            slug:`${slugify(title)||"play"}-${id}`,
            status,
            description:stringValue(data,"description"),
            abstract:stringValue(data,"abstract"),
            directorialNote:stringValue(data,"directorialNote"),
            coverImage:stringValue(data,"coverImage")||null,
            duration,
            launchedOn,
            endedOn,
            isFeatured:data.get("isFeatured")==="on",
            created:new Date(),
            updated:new Date(),
          }});
          await tx.theatre.update({where:{id:theatre.id},data:{updated:new Date()}});
          await saveCredits(tx,id,theatre.siteId,data);
          return id;
        },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable,maxWait:10000,timeout:15000});
      } catch (txError) {
        const retryable =
          txError instanceof Prisma.PrismaClientKnownRequestError &&
          (txError.code === "P2002" || txError.code === "P2034");
        if (!retryable || attempt === 2) throw txError;
      }
    }
    if (playId === null) throw new Error("CREATE_FAILED");

    revalidatePath("/theatre-dashboard/productions");
    revalidatePath("/");
    revalidatePath("/play");
    revalidatePath("/theatre-dashboard");
    return NextResponse.json({ok:true,playId});
  } catch(error) {
    console.error("Unable to publish theatre play",error);
    if(error instanceof Error&&(error.message==="UNAUTHORIZED"||error.message==="PASSWORD_CHANGE_REQUIRED"))return Response.json({error:"Your session expired. Please log in again."},{status:401});
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return Response.json({error:"This play already exists. Refresh the dashboard and try again."},{status:409});
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2034")return Response.json({error:"The database is busy. Please retry in a moment."},{status:503});
    if(error instanceof Prisma.PrismaClientKnownRequestError)return Response.json({error:`Database error ${error.code}. Please try again.`},{status:500});
    if(error instanceof Prisma.PrismaClientValidationError)return Response.json({error:"Invalid data submitted. Please check your inputs and retry."},{status:400});
    return Response.json({error:"Unable to publish play right now. Please retry."},{status:500});
  }
}

function parseDate(data:FormData,key:string) {
  const value=stringValue(data,key);
  if(!value)return null;
  const date=new Date(value);
  if(Number.isNaN(date.valueOf()))throw new Error(`Invalid ${key} date`);
  return date;
}

async function saveCredits(tx:Prisma.TransactionClient,playId:number,siteId:number,data:FormData) {
  const raw=[
    ...data.getAll("director").map(value=>({name:String(value).trim(),kind:"maker" as const,role:"Director"})),
    ...data.getAll("onStage").map(value=>({name:String(value).trim(),kind:"cast" as const,role:"On-stage artist"})),
    ...data.getAll("offStage").map(value=>({name:String(value).trim(),kind:"crew" as const,role:"Off-stage artist"})),
  ].filter(item=>item.name);
  const credits=raw.filter((item,index,list)=>list.findIndex(other=>other.kind===item.kind&&other.name.toLocaleLowerCase()===item.name.toLocaleLowerCase())===index);
  if(!credits.length)return;


    const uniqueNames=[...new Map(credits.map(credit=>[credit.name.toLocaleLowerCase(),credit.name])).values()];
    const existing=await tx.profile.findMany({where:{siteId,name:{in:uniqueNames,mode:"insensitive"}}});
    const existingNames=new Set(existing.map(profile=>profile.name.toLocaleLowerCase()));
    const missingNames=uniqueNames.filter(name=>!existingNames.has(name.toLocaleLowerCase()));
    let nextProfileId=((await tx.profile.aggregate({_max:{id:true}}))._max.id??0)+1;
    if(missingNames.length)await tx.profile.createMany({data:missingNames.map(name=>{
      const id=nextProfileId++;
      return {id,siteId,title:name,name,slug:`${slugify(name)||"artist"}-${id}`,created:new Date(),updated:new Date()};
    })});
    const profiles=await tx.profile.findMany({where:{siteId,name:{in:uniqueNames,mode:"insensitive"}}});
    const profileByName=new Map(profiles.map(profile=>[profile.name.toLocaleLowerCase(),profile.id]));
    const ordered=credits.map((credit,order)=>({...credit,order,profileId:profileByName.get(credit.name.toLocaleLowerCase())!}));
    let makerId=((await tx.playMaker.aggregate({_max:{id:true}}))._max.id??0)+1;
    let castId=((await tx.playCast.aggregate({_max:{id:true}}))._max.id??0)+1;
    let crewId=((await tx.playCrew.aggregate({_max:{id:true}}))._max.id??0)+1;
    const makers=ordered.filter(credit=>credit.kind==="maker").map(credit=>({id:makerId++,playId,profileId:credit.profileId,role:credit.role,order:credit.order}));
    const cast=ordered.filter(credit=>credit.kind==="cast").map(credit=>({id:castId++,playId,profileId:credit.profileId,role:credit.role,order:credit.order}));
    const crew=ordered.filter(credit=>credit.kind==="crew").map(credit=>({id:crewId++,playId,profileId:credit.profileId,role:credit.role,order:credit.order}));
    if(makers.length)await tx.playMaker.createMany({data:makers});
    if(cast.length)await tx.playCast.createMany({data:cast});
    if(crew.length)await tx.playCrew.createMany({data:crew});

}
