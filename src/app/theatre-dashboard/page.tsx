import { NewPlayForm, PlayEditor, ProfileForm, ScheduleForm } from "@/components/TheatreDashboardForms";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { redirect } from "next/navigation";

function date(value:Date|null){return value?value.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Not set"}

export default async function Dashboard(){
  const user=await currentUser();
  if(!user)redirect("/login");
  if(!user.isPasswordChanged)redirect("/set-new-password");
  if(user.isStaff||user.isSuperuser)redirect("/admin");
  const theatre=await prisma.theatre.findUnique({where:{ownerId:user.id},include:{
    plays:{include:{makers:{include:{profile:true},orderBy:{order:"asc"}},cast:{include:{profile:true},orderBy:{order:"asc"}},crew:{include:{profile:true},orderBy:{order:"asc"}}},orderBy:[{updated:"desc"},{title:"asc"}]},
    showsMeta:{include:{play:true,excludeDates:true,extraShows:true},orderBy:{startDate:"desc"}},
    shows:{include:{play:true},orderBy:{showtime:"desc"}},
  }});
  if(!theatre)return <main className="manage-page"><div className="manage-shell"><h1>Access denied</h1><p>No theatre is assigned to this account. Contact the administrator.</p></div></main>;
  const published=theatre.plays.filter(play=>play.status==="PUBLISHED").length;
  const upcoming=theatre.shows.filter(show=>show.showtime>=new Date()).length;
  const profileStrength=[theatre.about,theatre.profilePic,theatre.coverImage,theatre.email,theatre.phone,theatre.address,theatre.linkWebsite].filter(Boolean).length;
  const strength=Math.round(profileStrength/7*100);

  return <main className="owner-dashboard">
    <aside className="owner-sidebar">
      <Link className="owner-brand" href="/"><span>TH</span><strong>Owner Studio</strong></Link>
      <nav><p>Workspace</p><a href="#overview" className="owner-nav-overview">Overview</a><a href="#plays" className="owner-nav-plays">Productions <span>{theatre.plays.length}</span></a><a href="#schedule-workspace" className="owner-nav-schedules">Schedules <span>{theatre.showsMeta.length}</span></a><a href="#profile" className="owner-nav-profile">Theatre profile</a><p>Public presence</p>{theatre.slug?<Link href={`/theatre/${theatre.slug}`}>View theatre page ↗</Link>:<span className="owner-muted-link">Public page unavailable</span>}</nav>
      <div className="owner-account"><span>{user.username.slice(0,1).toUpperCase()}</span><div><strong>{user.username}</strong><small>ID: #{user.id} · {theatre.title}</small></div></div>
    </aside>
    <section className="owner-workspace">
      <header className="owner-topbar">
        <div>
          <span className="owner-status"><i/>Logged in as: <strong>{user.username}</strong> (ID: #{user.id})</span>
          <small>Theatre: {theatre.title} · Last updated {date(theatre.updated)}</small>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <ThemeToggle/>
          {theatre.slug&&<Link href={`/theatre/${theatre.slug}`}>View public page</Link>}
          <form action="/api/auth/logout" method="post"><button>Log out</button></form>
        </div>
      </header>
      <div className="owner-content" id="overview">
        <section className="owner-cover" style={theatre.coverImage?{backgroundImage:`linear-gradient(90deg,rgba(10,9,11,.95),rgba(10,9,11,.5)),url(${JSON.stringify(theatre.coverImage).slice(1,-1)})`}:undefined}>
          <div className="owner-cover-copy"><p>Theatre management studio</p><h1>{theatre.title}</h1><span>{theatre.address||"Add your theatre address"}</span><div><b className={theatre.status==="PUBLISHED"?"published":"draft"}>{theatre.status}</b>{theatre.establishedOn&&<small>Established {theatre.establishedOn.getFullYear()}</small>}</div></div>
          <div className="owner-profile-score"><strong>{strength}%</strong><span>Profile complete</span><i><b style={{width:`${strength}%`}}/></i><a href="#profile">Complete profile</a></div>
        </section>
        <section className="owner-stats"><article><span>Productions</span><strong>{theatre.plays.length}</strong><small>{published} published</small></article><article><span>Show schedules</span><strong>{theatre.showsMeta.length}</strong><small>Saved schedules</small></article><article><span>Generated shows</span><strong>{theatre.shows.length}</strong><small>{upcoming} upcoming</small></article><article><span>Archive rating</span><strong>{theatre.plays.length?(theatre.plays.reduce((sum,play)=>sum+play.ratingAverage,0)/theatre.plays.length).toFixed(1):"—"}</strong><small>Average across plays</small></article></section>

        <section className="owner-overview-grid">
          <article className="owner-panel"><div className="owner-panel-head"><div><p>Recent activity</p><h2>Latest productions</h2></div><a href="#plays">View all</a></div>{theatre.plays.slice(0,3).map(play=><div className="overview-list-row" key={play.id}><span>{play.title.slice(0,1)}</span><div><strong>{play.title}</strong><small>{play.status} · {date(play.updated)}</small></div></div>)}</article>
          <article className="owner-panel"><div className="owner-panel-head"><div><p>Coming up</p><h2>Next performances</h2></div><a href="#schedule-workspace">Manage</a></div>{theatre.shows.filter(show=>show.showtime>=new Date()).slice(0,3).map(show=><div className="overview-list-row" key={show.id}><span>{show.showtime.toLocaleDateString("en-US",{month:"short",day:"2-digit"})}</span><div><strong>{show.play.title}</strong><small>{show.showtime.toLocaleString()}</small></div></div>)}{!upcoming&&<p className="owner-small-empty">No upcoming performances scheduled.</p>}</article>
          <article className="owner-panel owner-quick-actions"><div className="owner-panel-head"><div><p>Shortcuts</p><h2>Quick actions</h2></div></div><a href="#plays">Add production</a><a href="#schedule-workspace">Create schedule</a><a href="#profile">Update theatre profile</a>{theatre.slug&&<Link href={`/theatre/${theatre.slug}`}>View public page</Link>}</article>
        </section>

        <section className="owner-schedule-workspace" id="schedule-workspace">
          <section className="owner-panel"><div className="owner-panel-head"><div><p>Performance calendar</p><h2>Show schedules</h2></div><span>{theatre.showsMeta.length}</span></div>{theatre.showsMeta.length?<div className="owner-schedule-list">{theatre.showsMeta.map(schedule=><article key={schedule.id}><span>{schedule.startDate.toLocaleDateString("en-US",{month:"short",day:"2-digit"})}</span><div><strong>{schedule.play.title}</strong><small>{date(schedule.startDate)} – {date(schedule.endDate)}</small></div></article>)}</div>:<p className="owner-small-empty">No schedules yet. Complete the form below to create the first one.</p>}<div className="owner-schedule-creator"><ScheduleForm plays={theatre.plays.map(play=>({id:play.id,title:play.title}))}/></div></section>
          <section className="owner-panel owner-generated-shows-inline"><div className="owner-panel-head"><div><p>Generated performances</p><h2>Upcoming shows</h2></div><span>{upcoming}</span></div>{theatre.shows.length?<div className="owner-shows-table"><table><thead><tr><th>Production</th><th>Showtime</th><th>Available</th></tr></thead><tbody>{theatre.shows.map(show=><tr key={show.id}><td>{show.play.title}</td><td>{show.showtime.toLocaleString()}</td><td>{show.availableSeats}</td></tr>)}</tbody></table></div>:<p className="owner-small-empty">Shows will appear here after creating a schedule.</p>}</section>
        </section>

        <div className="owner-main-grid">
          <section className="owner-panel" id="plays"><div className="owner-panel-head"><div><p>Production archive</p><h2>Your plays</h2></div><a href="#add-play">+ Add production</a></div>
            {theatre.plays.length?<div className="owner-play-list">{theatre.plays.map(play=><div className="owner-play-row" key={play.id}><div className="owner-play-poster" style={play.coverImage?{backgroundImage:`url(${JSON.stringify(play.coverImage).slice(1,-1)})`}:undefined}>{!play.coverImage&&play.title.slice(0,1)}</div><div className="owner-play-info"><span>{play.status}</span><h3>{play.title}</h3><p>{play.abstract||play.description||"No production summary added yet."}</p><small>{date(play.launchedOn)} {play.duration?`· ${play.duration} min`:""} {play.ratingCount?`· ★ ${play.ratingAverage.toFixed(1)}`:""}</small></div><details><summary>Edit</summary><PlayEditor play={play}/></details></div>)}</div>:<div className="owner-empty"><span>♪</span><h3>No plays added yet</h3><p>Start building your theatre archive with its first production.</p></div>}
            <details className="owner-add-play" id="add-play"><summary>+ Add a new production</summary><NewPlayForm/></details>
          </section>
          <aside className="owner-side-column">
            <section className="owner-panel owner-contact"><div className="owner-panel-head"><div><p>Contact information</p><h2>Public details</h2></div><a href="#profile">Edit</a></div><dl><div><dt>Email</dt><dd>{theatre.email||"Not added"}</dd></div><div><dt>Phone</dt><dd>{theatre.phone||"Not added"}</dd></div><div><dt>Address</dt><dd>{theatre.address||"Not added"}</dd></div><div><dt>Website</dt><dd>{theatre.linkWebsite||"Not added"}</dd></div></dl></section>
            <section className="owner-panel" id="schedules"><div className="owner-panel-head"><div><p>Performance calendar</p><h2>Show schedules</h2></div><span>{theatre.showsMeta.length}</span></div>{theatre.showsMeta.length?<div className="owner-schedule-list">{theatre.showsMeta.map(schedule=><article key={schedule.id}><span>{schedule.startDate.toLocaleDateString("en-US",{month:"short",day:"2-digit"})}</span><div><strong>{schedule.play.title}</strong><small>{date(schedule.startDate)} – {date(schedule.endDate)}</small><small>{schedule.excludeDates.length} exclusions · {schedule.extraShows.length} extra shows</small></div></article>)}</div>:<p className="owner-small-empty">No show schedules found.</p>}<details className="owner-add-schedule"><summary>+ Add schedule</summary><ScheduleForm plays={theatre.plays.map(play=>({id:play.id,title:play.title}))}/></details></section>
          </aside>
        </div>

        <section className="owner-panel owner-profile-panel" id="profile"><div className="owner-panel-head"><div><p>Complete theatre record</p><h2>Edit theatre profile</h2></div><span>All existing information is pre-filled</span></div><ProfileForm theatre={theatre}/></section>
        <section className="owner-panel owner-generated-shows"><div className="owner-panel-head"><div><p>Generated performances</p><h2>All shows</h2></div><span>{theatre.shows.length} records</span></div>{theatre.shows.length?<div className="owner-shows-table"><table><thead><tr><th>Production</th><th>Showtime</th><th>Seats</th><th>Available</th><th>Price</th></tr></thead><tbody>{theatre.shows.map(show=><tr key={show.id}><td>{show.play.title}</td><td>{show.showtime.toLocaleString()}</td><td>{show.totalSeats}</td><td>{show.availableSeats}</td><td>{show.price??"—"}</td></tr>)}</tbody></table></div>:<p className="owner-small-empty">No generated shows found.</p>}</section>
      </div>
    </section>
  </main>;
}
