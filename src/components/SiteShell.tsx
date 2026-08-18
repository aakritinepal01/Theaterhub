import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function Header() {
  let pages: { id:number; title:string; slug:string; linkUrl:string|null }[] = [];
  try { pages = await prisma.page.findMany({ where:{ status:"PUBLISHED", inMenus:{ contains:"1" } }, orderBy:{ order:"asc" }, select:{id:true,title:true,slug:true,linkUrl:true} }); } catch {}
  const fallback = [{id:-1,title:"Plays",slug:"/play/",linkUrl:"/play/"},{id:-2,title:"Theatres",slug:"/theatre/",linkUrl:"/theatre/"},{id:-3,title:"Blog",slug:"/blog/",linkUrl:"/blog/"},{id:-4,title:"About Us",slug:"about-us",linkUrl:null},{id:-5,title:"Contact Us",slug:"contact-us",linkUrl:null}];
  return <nav className="navbar"><div className="site-container nav-inner"><Link className="brand" href="/">TheatreHub</Link><div className="nav-links">{(pages.length?pages:fallback).map(p=><Link key={p.id} href={p.linkUrl || `/${p.slug.replace(/^\/+|\/+$/g,"")}/`}>{p.title}</Link>)}</div></div></nav>;
}

export function Sidebar(){return <aside className="sidebar"><div className="panel panel-default"><h3>Like us on Facebook</h3><a href={process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || "https://www.facebook.com/theatrehub.org"} target="_blank" rel="noreferrer">TheatreHub on Facebook</a></div></aside>}

export function PageFrame({children,sidebar=true}:{children:React.ReactNode;sidebar?:boolean}){return <div className="site-container main-grid"><main>{children}</main>{sidebar&&<Sidebar/>}</div>}
