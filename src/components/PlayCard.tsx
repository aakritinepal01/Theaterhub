import Link from "next/link";
import { mediaUrl } from "@/lib/content";

export function PlayCard({play,home=false}:{play:{title:string;slug:string|null;description:string;coverImage:string|null;shows?:unknown[]};home?:boolean}){
 const image=mediaUrl(play.coverImage); const running=Boolean(play.shows?.length);
 if(home)return <div className="panel"><div className="image-container">{running&&<div className="ribbon"><span>On Stage</span></div>}{image&&<Link href={`/play/${play.slug}/`}><img src={image} alt={play.title}/></Link>}</div></div>;
 return <article className="panel play-row"><div><h3>{running&&<span className="green-dot" title="Running"/>}<Link href={`/play/${play.slug}/`}>{play.title}</Link></h3><p>{play.description}</p></div>{image&&<Link className="play-cover" href={`/play/${play.slug}/`}><img className="thumbnail" src={image} alt={play.title}/></Link>}</article>;
}
