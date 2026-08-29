import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function Section({params}:{params:Promise<{section:string}>}){
  const user=await currentUser();
  if(!user||(!user.isStaff&&!user.isSuperuser))redirect("/login");
  const {section}=await params;
  let rows:{id:number;name:string;href?:string}[]=[];
  if(section==="plays")rows=(await prisma.play.findMany({orderBy:{title:"asc"}})).map(item=>({id:item.id,name:item.title,href:`/play/${item.slug}/`}));
  else if(section==="profiles")rows=(await prisma.profile.findMany({orderBy:{name:"asc"}})).map(item=>({id:item.id,name:item.name,href:`/profile/${item.slug}/`}));
  else if(section==="theatres")redirect("/admin/theatres");
  else if(section==="schedules")rows=(await prisma.showsMeta.findMany({include:{play:true,theatre:true}})).map(item=>({id:item.id,name:`[${item.theatre.title}] ${item.play.title}`}));
  else if(section==="posts")rows=(await prisma.blogPost.findMany({orderBy:{title:"asc"}})).map(item=>({id:item.id,name:item.title,href:`/blog/${item.slug}/`}));
  else if(section==="entries")rows=(await prisma.formEntry.findMany({orderBy:{entryTime:"desc"},take:500})).map(item=>({id:item.id,name:item.entryTime.toISOString()}));
  else notFound();
  return <main className="manage-page"><div className="manage-shell wide"><p><Link href="/admin">← Administration</Link></p><h1>{section}</h1><table className="admin-table"><thead><tr><th>ID</th><th>Name</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{row.id}</td><td>{row.href?<Link href={row.href}>{row.name}</Link>:row.name}</td></tr>)}</tbody></table></div></main>;
}
