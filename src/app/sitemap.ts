import type {MetadataRoute} from "next";import {prisma} from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";const [plays,profiles,theatres,posts,pages]=await Promise.all([prisma.play.findMany({where:{status:"PUBLISHED",inSitemap:true},select:{slug:true,updated:true}}),prisma.profile.findMany({where:{status:"PUBLISHED",inSitemap:true},select:{slug:true,updated:true}}),prisma.theatre.findMany({where:{status:"PUBLISHED",inSitemap:true},select:{slug:true,updated:true}}),prisma.blogPost.findMany({where:{status:"PUBLISHED",inSitemap:true},select:{slug:true,updated:true}}),prisma.page.findMany({where:{status:"PUBLISHED",inSitemap:true},select:{slug:true,updated:true}})]);  const staticRoutes = [
    { url: base, lastModified: new Date() },
    { url: `${base}/play/`, lastModified: new Date() },
    { url: `${base}/theatre/`, lastModified: new Date() },
    { url: `${base}/reviews/`, lastModified: new Date() },
    { url: `${base}/profile/`, lastModified: new Date() },
    { url: `${base}/blog/`, lastModified: new Date() },
    { url: `${base}/about-us/`, lastModified: new Date() },
    { url: `${base}/contact-us/`, lastModified: new Date() },
  ];

  return [
    ...staticRoutes,
    ...plays.map(x=>({url:`${base}/play/${x.slug}/`,lastModified:x.updated||undefined})),
    ...profiles.map(x=>({url:`${base}/profile/${x.slug}/`,lastModified:x.updated||undefined})),
    ...theatres.map(x=>({url:`${base}/theatre/${x.slug}/`,lastModified:x.updated||undefined})),
    ...posts.map(x=>({url:`${base}/blog/${x.slug}/`,lastModified:x.updated||undefined})),
    ...pages.map(x=>({url:`${base}/${x.slug}/`,lastModified:x.updated||undefined}))
  ];
}
