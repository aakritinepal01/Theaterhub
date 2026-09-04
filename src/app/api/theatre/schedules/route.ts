import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regenerateShows } from "@/lib/showtimes";

const days=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"] as const;
const timePattern=/^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(request:Request) {
  try {
    const user=await requireTheatreUser();
    const theatre=await prisma.theatre.findUnique({where:{ownerId:user.id}});
    if(!theatre)return Response.json({error:"Access denied"},{status:403});
    const data=await request.formData(), value=(key:string)=>String(data.get(key)||"").trim();
    const playId=Number(value("playId"));
    if(!await prisma.play.findFirst({where:{id:playId,theatreId:theatre.id}}))return Response.json({error:"Select a valid production"},{status:400});
    const startDate=new Date(value("startDate")),endDate=new Date(value("endDate"));
    if(Number.isNaN(startDate.valueOf())||Number.isNaN(endDate.valueOf())||endDate<startDate)return Response.json({error:"Enter a valid date range"},{status:400});
    const times=Object.fromEntries(days.map(day=>[day,value(day)])) as Record<(typeof days)[number],string>;
    if(days.some(day=>times[day].split(",").map(x=>x.trim()).filter(Boolean).some(time=>!timePattern.test(time))))return Response.json({error:"Use HH:MM time format"},{status:400});
    if(!days.some(day=>times[day]))return Response.json({error:"Add at least one show time"},{status:400});
    const scheduleId=await prisma.$transaction(async tx=>{
      const id=((await tx.showsMeta.aggregate({_max:{id:true}}))._max.id??0)+1;
      await tx.showsMeta.create({data:{id,playId,theatreId:theatre.id,startDate,endDate,...times}});
      return id;
    },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
    await regenerateShows(scheduleId);
    revalidatePath("/theatre-dashboard/schedules");revalidatePath("/theatre-dashboard");revalidatePath("/");revalidatePath("/play");
    return NextResponse.redirect(new URL("/theatre-dashboard/schedules?saved=schedule",request.url),303);
  } catch {
    return Response.json({error:"Unable to create schedule"},{status:500});
  }
}
