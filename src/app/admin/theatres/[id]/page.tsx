import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const show = (value:unknown) => value instanceof Date ? value.toLocaleDateString() : String(value || "—");

export default async function TheatreDetail({params}:{params:Promise<{id:string}>}) {
  const user=await currentUser();
  if(!user||(!user.isStaff&&!user.isSuperuser))redirect("/login");
  const {id}=await params;
  const theatre=await prisma.theatre.findUnique({where:{id:Number(id)},include:{owner:{select:{firstName:true,lastName:true,username:true,email:true,lastLogin:true,dateJoined:true}},plays:{orderBy:{title:"asc"}},shows:{include:{play:true},orderBy:{showtime:"desc"}},showsMeta:{include:{play:true,excludeDates:true,extraShows:true},orderBy:{startDate:"desc"}}}});
  if(!theatre)notFound();
  const fields:Array<[string,unknown]>=[["Title",theatre.title],["Slug",theatre.slug],["About",theatre.about],["Profile picture",theatre.profilePic],["Cover image",theatre.coverImage],["Established",theatre.establishedOn],["Closed",theatre.closedOn],["Email",theatre.email],["Phone",theatre.phone],["Address",theatre.address],["Website",theatre.linkWebsite],["Facebook",theatre.linkFacebook],["Twitter",theatre.linkTwitter],["Instagram",theatre.linkInstagram],["Status",theatre.status]];
  return <main className="manage-page"><div className="manage-shell wide">
    <nav className="manage-nav"><Link href="/admin/theatres">← All theatres</Link><Link href="/admin">Administration</Link></nav><h1>{theatre.title}</h1>
    <section className="detail-grid"><article className="manage-panel"><h2>Full profile</h2><dl>{fields.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{show(value)}</dd></div>)}</dl></article>
      <article className="manage-panel"><h2>Owner account</h2>{theatre.owner?<dl><div><dt>Name</dt><dd>{theatre.owner.firstName} {theatre.owner.lastName}</dd></div><div><dt>Username</dt><dd>{theatre.owner.username}</dd></div><div><dt>Email</dt><dd>{theatre.owner.email}</dd></div><div><dt>Last login</dt><dd>{show(theatre.owner.lastLogin)}</dd></div><div><dt>Joined</dt><dd>{show(theatre.owner.dateJoined)}</dd></div></dl>:<><p>No account yet</p><Link className="manage-button" href={`/admin/create-user?theatreName=${encodeURIComponent(theatre.title)}`}>Create Theatre User</Link></>}</article>
    </section>
    <section className="manage-panel"><h2>Plays ({theatre.plays.length})</h2>{theatre.plays.length?<table className="admin-table"><thead><tr><th>Title</th><th>Poster</th><th>Status</th><th>Launched</th><th>Rating</th></tr></thead><tbody>{theatre.plays.map(play=><tr key={play.id}><td>{play.title}</td><td>{play.coverImage||"—"}</td><td>{play.status}</td><td>{show(play.launchedOn)}</td><td>{play.ratingAverage}</td></tr>)}</tbody></table>:<p>No plays.</p>}</section>
    <section className="manage-panel"><h2>Shows ({theatre.shows.length})</h2>{theatre.shows.map(showtime=><p key={showtime.id}>{showtime.play.title} — {showtime.showtime.toLocaleString()} · {showtime.availableSeats}/{showtime.totalSeats} seats</p>)}{!theatre.shows.length&&<p>No generated shows.</p>}<h2>Show schedules ({theatre.showsMeta.length})</h2>{theatre.showsMeta.map(schedule=><p key={schedule.id}>{schedule.play.title}: {show(schedule.startDate)}–{show(schedule.endDate)} · {schedule.excludeDates.length} exclusions · {schedule.extraShows.length} extras</p>)}{!theatre.showsMeta.length&&<p>No show schedules.</p>}</section>
  </div></main>;
}
