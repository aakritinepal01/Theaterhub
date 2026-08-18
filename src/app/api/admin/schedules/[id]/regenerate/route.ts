import {NextResponse} from "next/server";import {currentUser} from "@/lib/auth";import {regenerateShows} from "@/lib/showtimes";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){if(!(await currentUser())?.isStaff)return NextResponse.json({error:"Unauthorized"},{status:403});const count=await regenerateShows(Number((await params).id));return NextResponse.json({count});}
