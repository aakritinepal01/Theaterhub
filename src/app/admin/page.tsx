import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

type IconName = "theatre" | "play" | "people" | "calendar" | "article" | "inbox" | "user" | "arrow";

function Icon({name}:{name:IconName}) {
  const paths:Record<IconName,React.ReactNode>={
    theatre:<><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></>,
    play:<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></>,
    people:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    article:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    inbox:<><path d="M4 4h16v16H4zM4 14h4l2 3h4l2-3h4"/></>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    arrow:<><path d="M5 12h14M13 6l6 6-6 6"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default async function Admin(){
  const user=await currentUser();
  if(!user||(!user.isStaff&&!user.isSuperuser))redirect("/login");
  if(!user.isPasswordChanged)redirect("/set-new-password");

  const [plays,profiles,theatres,schedules,posts,entries,claimed,users,recentTheatres]=await Promise.all([
    prisma.play.count(),prisma.profile.count(),prisma.theatre.count(),prisma.showsMeta.count(),prisma.blogPost.count(),prisma.formEntry.count(),
    prisma.theatre.count({where:{ownerId:{not:null}}}),prisma.user.count({where:{isActive:true}}),
    prisma.theatre.findMany({take:5,orderBy:[{updated:"desc"},{title:"asc"}],select:{id:true,title:true,address:true,updated:true,owner:{select:{username:true}},_count:{select:{plays:true}}}}),
  ]);
  const unclaimed=theatres-claimed;
  const stats=[
    {label:"Theatres",value:theatres,note:`${claimed} linked · ${unclaimed} unclaimed`,icon:"theatre" as const,href:"/admin/theatres"},
    {label:"Productions",value:plays,note:"Plays in the archive",icon:"play" as const,href:"/admin/plays"},
    {label:"Artists",value:profiles,note:"Creative profiles",icon:"people" as const,href:"/admin/profiles"},
    {label:"Active users",value:users,note:"Enabled accounts",icon:"user" as const,href:"/admin/create-user"},
  ];
  const modules=[
    {title:"Theatre directory",copy:"Review every venue, ownership status, profile and production.",count:theatres,icon:"theatre" as const,href:"/admin/theatres",action:"Manage theatres"},
    {title:"Play archive",copy:"Browse and maintain productions published across TheaterHub.",count:plays,icon:"play" as const,href:"/admin/plays",action:"View productions"},
    {title:"Show schedules",copy:"Inspect performance calendars and generated showtimes.",count:schedules,icon:"calendar" as const,href:"/admin/schedules",action:"View schedules"},
    {title:"Artist profiles",copy:"Access the complete directory of performers and makers.",count:profiles,icon:"people" as const,href:"/admin/profiles",action:"View artists"},
    {title:"Editorial",copy:"Manage stories, interviews and theatre news.",count:posts,icon:"article" as const,href:"/admin/posts",action:"View articles"},
    {title:"Form inbox",copy:"Review messages and submissions received from the website.",count:entries,icon:"inbox" as const,href:"/admin/entries",action:"Open inbox"},
  ];

  return <main className="admin-command">
    <aside className="admin-sidebar">
      <Link className="admin-brand" href="/"><span>TH</span><strong>TheaterHub</strong></Link>
      <nav aria-label="Admin navigation"><p>Workspace</p><Link className="is-active" href="/admin"><Icon name="theatre"/>Overview</Link><Link href="/admin/theatres"><Icon name="theatre"/>Theatres</Link><Link href="/admin/plays"><Icon name="play"/>Productions</Link><Link href="/admin/schedules"><Icon name="calendar"/>Schedules</Link><p>Operations</p><Link href="/admin/create-user"><Icon name="user"/>Create user</Link><Link href="/admin/entries"><Icon name="inbox"/>Form inbox</Link></nav>
      <div className="admin-sidebar-user"><span>{user.username.slice(0,1).toUpperCase()}</span><div><strong>{user.firstName||"Administrator"}</strong><small>{user.username}</small></div></div>
    </aside>
    <section className="admin-workspace">
      <header className="admin-topbar"><div><p>Administration / Overview</p><span className="admin-live"><i/>System online</span></div><div className="admin-top-actions"><Link href="/">View website</Link><form action="/api/auth/logout" method="post"><button>Log out</button></form></div></header>
      <div className="admin-content">
        <section className="admin-hero"><div><p className="admin-eyebrow">TheaterHub command center</p><h1>Good to see you, <em>{user.firstName||"Admin"}.</em></h1><p>Manage Nepal&apos;s theatre archive, venue partners and live programming from one place.</p></div><Link className="admin-primary-action" href="/admin/create-user"><span>+</span>Create Theatre User</Link></section>
        <section className="admin-stats" aria-label="Platform statistics">{stats.map(stat=><Link href={stat.href} className="admin-stat" key={stat.label}><div className="admin-stat-icon"><Icon name={stat.icon}/></div><div><span>{stat.label}</span><strong>{stat.value.toLocaleString()}</strong><small>{stat.note}</small></div><Icon name="arrow"/></Link>)}</section>
        <div className="admin-dashboard-grid">
          <section className="admin-section"><div className="admin-section-head"><div><p className="admin-eyebrow">Content operations</p><h2>Management modules</h2></div><span>{modules.length} modules</span></div><div className="admin-modules">{modules.map(module=><Link href={module.href} className="admin-module" key={module.title}><div className="admin-module-top"><span><Icon name={module.icon}/></span><strong>{module.count.toLocaleString()}</strong></div><h3>{module.title}</h3><p>{module.copy}</p><small>{module.action}<Icon name="arrow"/></small></Link>)}</div></section>
          <aside className="admin-rail"><section className="admin-section"><div className="admin-section-head"><div><p className="admin-eyebrow">Latest activity</p><h2>Recently updated</h2></div><Link href="/admin/theatres">View all</Link></div><div className="admin-recent">{recentTheatres.map(theatre=><Link href={`/admin/theatres/${theatre.id}`} key={theatre.id}><span className="admin-recent-mark">{theatre.title.slice(0,1)}</span><div><strong>{theatre.title}</strong><small>{theatre.address||"Address not added"} · {theatre._count.plays} plays</small></div><time>{theatre.updated?theatre.updated.toLocaleDateString("en-US",{month:"short",day:"numeric"}):"—"}</time></Link>)}</div></section>
            <section className="admin-owner-card"><div className="admin-owner-glow"/><p className="admin-eyebrow">Account onboarding</p><h2>{unclaimed} theatres need an owner</h2><p>Connect verified theatre owners to their existing records without losing archive data.</p><Link href="/admin/theatres?unclaimed=1">Review unclaimed theatres <Icon name="arrow"/></Link></section>
          </aside>
        </div>
      </div>
    </section>
  </main>;
}
