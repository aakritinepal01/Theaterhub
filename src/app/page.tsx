import { prisma } from "@/lib/prisma";
import { publishedWhere } from "@/lib/content";
import { PageFrame } from "@/components/SiteShell";
import { PlayCard } from "@/components/PlayCard";

export const revalidate=300;
export default async function Home(){const plays=await prisma.play.findMany({where:publishedWhere(),orderBy:{launchedOn:"desc"},take:6,include:{shows:{where:{showtime:{gt:new Date()}},take:1}}});return <PageFrame><div className="home-grid">{plays.map(p=><PlayCard key={p.id} play={p} home/>)}</div></PageFrame>}
