import Link from "next/link";
import { mediaUrl, plainText } from "@/lib/content";

export function PlayCard({play,home=false}:{play:{title:string;slug:string|null;description:string;coverImage:string|null;shows?:unknown[]};home?:boolean}){
 const image=mediaUrl(play.coverImage); const running=Boolean(play.shows?.length);
 if(home)return <div className="panel"><div className="image-container">{running&&<div className="ribbon"><span>On Stage</span></div>}{image&&<Link href={`/play/${play.slug}/`}><img src={image} alt={play.title}/></Link>}</div></div>;
 return <article className="play-list-card"><Link className="play-list-image" href={`/play/${play.slug}/`}>{image?<img src={image} alt={play.title}/>:<span>No cover image</span>}{running&&<span className="landing-live-badge">On stage</span>}</Link><div className="play-list-copy"><h3><Link href={`/play/${play.slug}/`}>{play.title}</Link></h3><p>{plainText(play.description)}</p><Link className="play-read-more" href={`/play/${play.slug}/`}>Read more <span aria-hidden="true">→</span></Link></div></article>;
}
