import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { sendCredentialEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const value = (data: FormData, key: string) => String(data.get(key) || "").trim();
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]!);

function emailFailurePage(input: { username: string; password: string; email: string; theatre: string; action: string }) {
  const action = input.action === "linked" ? `Linked to existing theatre: ${input.theatre}` : `Created new theatre: ${input.theatre}`;
  return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Credentials require manual delivery</title><style>body{margin:0;background:#08080a;color:#f4f1ea;font:16px/1.6 system-ui,sans-serif}.card{max-width:680px;margin:8vh auto;padding:38px;background:#17171b;border:1px solid #3e3528;border-radius:18px}h1{font-family:Georgia,serif;font-size:2.2rem}.ok{color:#d5aa62}.warning{padding:18px;background:#2b1717;border:1px solid #8e3b3b;border-radius:10px}.credentials{padding:18px;background:#0d0d10;border-radius:10px;font-size:1.08rem}code{color:#f0c77d;user-select:all}a{display:inline-block;margin-top:22px;color:#0b0b0d;background:#d5aa62;padding:11px 18px;border-radius:8px;text-decoration:none}</style></head><body><main class="card"><p class="ok">${escapeHtml(action)}</p><h1>Account created</h1><p class="warning"><strong>Email delivery failed.</strong> Credentials could not be sent to ${escapeHtml(input.email)}. Share them with the verified owner manually.</p><div class="credentials">Username: <code>${escapeHtml(input.username)}</code><br>Temporary password: <code>${escapeHtml(input.password)}</code></div><p>This password is shown only on this response and will not be included in the URL.</p><a href="/admin/create-user">Return to Create Theatre User</a></main></body></html>`, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'", "referrer-policy": "no-referrer" } });
}
export async function POST(request: Request) {
  try { await requireStaff(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const data = await request.formData();
  const theatreName=value(data,"theatreName"),email=value(data,"email").toLowerCase(),username=email,firstName=theatreName,lastName="",password=String(data.get("password")||""),confirmPassword=String(data.get("confirmPassword")||"");
  const back = (params: Record<string, string>) => { const url = new URL("/admin/create-user", request.url); Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v)); return NextResponse.redirect(url, 303); };
  if (!email || password.length < 8 || !theatreName || !/^\S+@\S+\.\S+$/.test(email)) return back({ error: "invalid" });
  if(password!==confirmPassword)return back({error:"mismatch"});
  const duplicate = await prisma.user.findFirst({ where: { OR: [{ username: { equals: username, mode: "insensitive" } }, { email: { equals: email, mode: "insensitive" } }] } });
  if (duplicate) return back({ error: "duplicate" });
  const passwordHash=await bcrypt.hash(password,12);
  try {
    let result:{action:string;theatre:string}|undefined;
    for(let attempt=0;attempt<3&&!result;attempt++){
      try{
        result=await prisma.$transaction(async tx=>{
          const theatreCandidates=await tx.theatre.findMany({where:{title:{contains:theatreName,mode:"insensitive"}}});
          const theatre=theatreCandidates.find(item=>item.title.trim().toLocaleLowerCase()===theatreName.toLocaleLowerCase());
          if(theatre?.ownerId!=null)throw new Error("CLAIMED");
          if(theatre?.email.trim()&&theatre.email.trim().toLocaleLowerCase()!==email)throw new Error("EMAIL_MISMATCH");
          const maxUser=await tx.user.aggregate({_max:{id:true}});
          const user=await tx.user.create({data:{id:(maxUser._max.id??0)+1,firstName,lastName,username,email,passwordHash,isStaff:false,isSuperuser:false,isActive:true,dateJoined:new Date(),isPasswordChanged:false}});
          if(theatre){await tx.theatre.update({where:{id:theatre.id},data:{ownerId:user.id,email:theatre.email.trim()||email,updated:new Date()}});return{action:"linked",theatre:theatre.title}}
          const [maxTheatre,site]=await Promise.all([tx.theatre.aggregate({_max:{id:true}}),tx.site.findFirst({orderBy:{id:"asc"}})]);
          if(!site)throw new Error("NO_SITE");
          await tx.theatre.create({data:{id:(maxTheatre._max.id??0)+1,siteId:site.id,title:theatreName,created:new Date(),updated:new Date(),ownerId:user.id}});
          return{action:"created",theatre:theatreName};
        },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable,maxWait:10000,timeout:15000});
      }catch(error){
        if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2034"&&attempt<2)continue;
        throw error;
      }
    }
    if(!result)throw new Error("TRANSACTION_FAILED");
    try { await sendCredentialEmail({ email, firstName, username, temporaryPassword: password }); return back({ success: result.action, theatre: result.theatre, sent: email }); }
    catch (error) { console.error("Credential email failed:", error); return emailFailurePage({ username, password, email, theatre: result.theatre, action: result.action }); }
  } catch (error) {
    if (error instanceof Error && error.message === "CLAIMED") return back({ error: "claimed" });
    if(error instanceof Error&&error.message==="EMAIL_MISMATCH")return back({error:"email_mismatch"});
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return back({error:"duplicate"});
    console.error("Create theatre user failed:", error); return back({ error: "failed" });
  }
}
