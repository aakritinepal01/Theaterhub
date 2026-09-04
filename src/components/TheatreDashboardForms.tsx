"use client";

import type { ContentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Credit = { profile: { name:string } };
type Play = { id:number; title:string; description:string; abstract:string; directorialNote:string; coverImage:string|null; duration:number|null; launchedOn:Date|string|null; endedOn:Date|string|null; status:ContentStatus; isFeatured:boolean; makers:Credit[]; cast:Credit[]; crew:Credit[] };

function PeopleFields({ title, hint, name, initialPeople=[] }: { title:string; hint:string; name:string; initialPeople?:string[] }) {
  const [people,setPeople]=useState(initialPeople.length?initialPeople:[""]);
  return <fieldset className="play-people-fieldset">
    <legend>{title}</legend>
    <p>{hint}</p>
    <div className="play-people-list">
      {people.map((person,index)=><div className="play-person-row" key={`${name}-${index}`}>
        <input name={name} value={person} onChange={(event)=>setPeople(current=>current.map((value,i)=>i===index?event.target.value:value))} placeholder="Artist name" aria-label={`${title} artist ${index+1}`}/>
        {index===people.length-1?<button type="button" className="play-person-add" onClick={()=>setPeople(current=>[...current,""])}>+ Add</button>:<button type="button" className="play-person-remove" onClick={()=>setPeople(current=>current.filter((_,i)=>i!==index))} aria-label={`Remove ${title} artist ${index+1}`}>Remove</button>}
      </div>)}
    </div>
  </fieldset>
}

export function NewPlayForm(){
  const router=useRouter(),[state,setState]=useState("");
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setState("Publishing…");
    const form=event.currentTarget;
    const response=await fetch("/api/theatre/plays",{method:"POST",body:new FormData(form)});
    const result=await response.json().catch(()=>null);
    if(!response.ok){setState(result?.error||"Unable to publish play.");return}
    setState("Play published successfully.");form.reset();router.refresh();
  }
  return <form className="manage-form new-play-form" onSubmit={submit}>
    <div className="play-form-intro"><span>New production</span><h3>Tell us about the play</h3><p>Published plays marked for the homepage will appear with the same cards as the rest of the TheatreHub archive.</p></div>
    <div className="play-form-grid">
      <label>Play title<input name="title" placeholder="Enter the production title" required/></label>
      <label>Publication status<select name="status" defaultValue="PUBLISHED"><option value="PUBLISHED">Published</option><option value="UPCOMING">Upcoming</option></select></label>
      <label>Poster URL<input name="coverImage" placeholder="/uploads/play_cover/poster.jpg"/></label>
      <label>Duration (minutes)<input type="number" min="1" name="duration" placeholder="90"/></label>
      <label>Opening date<input type="date" name="launchedOn"/></label>
      <label>Closing date<input type="date" name="endedOn"/></label>
    </div>
    <section className="play-credit-section">
      <div className="play-credit-heading"><span>Credits</span><h3>People behind the production</h3></div>
      <label className="play-director-field">Director<input name="director" placeholder="Director's full name"/></label>
      <div className="play-people-grid">
        <PeopleFields title="On-stage" hint="Actors and performers seen on stage." name="onStage"/>
        <PeopleFields title="Off-stage" hint="Backstage, technical and production artists." name="offStage"/>
      </div>
    </section>
    <label>Short description<textarea name="description" placeholder="A clear introduction shown on the play card and page."/></label>
    <label>Abstract<textarea name="abstract" placeholder="Synopsis or story overview."/></label>
    <label>Directorial note<textarea name="directorialNote" placeholder="A note from the director (optional)."/></label>
    <label className="play-feature-toggle"><input type="checkbox" name="isFeatured" defaultChecked/><span><strong>Show on landing page</strong></span></label>
    <button className="play-submit" type="submit">Publish play</button><p role="status">{state}</p>
  </form>
}

export function ProfileForm({ theatre }: { theatre: Record<string, unknown> }) {
  const router=useRouter(), [state,setState]=useState("");
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setState("Saving…");const response=await fetch("/api/theatre",{method:"PATCH",body:new FormData(event.currentTarget)});setState(response.ok?"Profile saved.":(await response.json().catch(()=>null))?.error||"Unable to save profile.");if(response.ok)router.refresh()}
  return <form className="manage-form profile-form" onSubmit={submit}>
    <label>Theatre name<input name="title" defaultValue={String(theatre.title||"")} required/></label>
    <label>Publication status<select name="status" defaultValue={String(theatre.status||"PUBLISHED")}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select></label>
    <label>About<textarea name="about" defaultValue={String(theatre.about||"")}/></label>
    <div className="theatre-media-field">
      <span>Profile picture</span>
      <div className="theatre-media-preview theatre-media-preview-logo">{theatre.profilePic?<img src={String(theatre.profilePic)} alt="Current theatre profile"/>:<b>{String(theatre.title||"T").slice(0,1)}</b>}</div>
      <input type="hidden" name="profilePic" value={String(theatre.profilePic||"")}/>
      <label>Choose profile image<input type="file" name="profilePicFile" accept="image/jpeg,image/png,image/webp,image/gif"/></label>
    </div>
    <div className="theatre-media-field">
      <span>Cover image</span>
      <div className="theatre-media-preview theatre-media-preview-cover">{theatre.coverImage?<img src={String(theatre.coverImage)} alt="Current theatre cover"/>:<b>No cover image</b>}</div>
      <input type="hidden" name="coverImage" value={String(theatre.coverImage||"")}/>
      <label>Choose cover image<input type="file" name="coverImageFile" accept="image/jpeg,image/png,image/webp,image/gif"/></label>
    </div>
    <label>Public email<input type="email" name="email" defaultValue={String(theatre.email||"")}/></label>
    <label>Phone<input name="phone" defaultValue={String(theatre.phone||"")}/></label>
    <label>Address<input name="address" defaultValue={String(theatre.address||"")}/></label>
    <label>Website<input name="linkWebsite" defaultValue={String(theatre.linkWebsite||"")}/></label>
    <label>Facebook<input name="linkFacebook" defaultValue={String(theatre.linkFacebook||"")}/></label>
    <label>Twitter / X<input name="linkTwitter" defaultValue={String(theatre.linkTwitter||"")}/></label>
    <label>Instagram<input name="linkInstagram" defaultValue={String(theatre.linkInstagram||"")}/></label>
    <label>Established on<input type="date" name="establishedOn" defaultValue={dateValue(theatre.establishedOn)}/></label>
    <label>Closed on<input type="date" name="closedOn" defaultValue={dateValue(theatre.closedOn)}/></label>
    <button>Save theatre profile</button><p role="status">{state}</p>
  </form>
}

export function ScheduleForm({plays}:{plays:{id:number;title:string}[]}) {
  const days=[["monday","Monday"],["tuesday","Tuesday"],["wednesday","Wednesday"],["thursday","Thursday"],["friday","Friday"],["saturday","Saturday"],["sunday","Sunday"]] as const;
  const sortedPlays=[...plays].sort((a,b)=>a.title.localeCompare(b.title));
  return <form action="/api/theatre/schedules" method="post" className="manage-form owner-schedule-form">
    <div className="schedule-form-heading"><span>New schedule</span><h3>Plan performance dates</h3><p>Add show times to the days when this production runs.</p></div>
    <label>Production<select name="playId" required defaultValue="" disabled={!sortedPlays.length}><option value="" disabled>{sortedPlays.length?"Select a play":"Add a production first"}</option>{sortedPlays.map(play=><option value={play.id} key={play.id}>{play.title}</option>)}</select></label>
    <div className="schedule-date-grid"><label>Start date<input type="date" name="startDate" required/></label><label>End date<input type="date" name="endDate" required/></label></div>
    <div className="schedule-week-grid">{days.map(([name,label])=><label key={name}>{label}<input name={name} placeholder="18:30 or 14:00, 18:30"/></label>)}</div>
    <small className="schedule-form-note">Use 24-hour time. Leave days without a performance empty.</small>
    {!sortedPlays.length&&<p className="schedule-empty-note">Create a production before adding its performance schedule.</p>}
    <button type="submit" disabled={!sortedPlays.length}>Create schedule</button>
  </form>
}

export function PlayEditor({play}:{play:Play}){
  const router=useRouter(),[state,setState]=useState("");
  async function save(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setState("Saving…");const response=await fetch(`/api/theatre/plays/${play.id}`,{method:"PATCH",body:new FormData(event.currentTarget)});const result=await response.json().catch(()=>null);setState(response.ok?"Saved.":result?.error||"Unable to save.");if(response.ok)router.refresh()}
  async function remove(){if(!confirm(`Delete ${play.title}?`))return;const response=await fetch(`/api/theatre/plays/${play.id}`,{method:"DELETE"});if(response.ok)router.refresh();else setState((await response.json().catch(()=>null))?.error||"Unable to delete.")}
  return <article className="play-editor"><div className="play-editor-head"><div><h3>{play.title}</h3><p>{play.launchedOn?new Date(play.launchedOn).toLocaleDateString():"Launch date not set"} · {play.status}</p></div><div><button type="button" className="danger" onClick={remove}>Delete</button></div></div><form className="manage-form new-play-form" onSubmit={save}>
    <div className="play-form-intro"><span>Edit production</span><h3>Update the play details</h3><p>Changes made here update the production across the TheatreHub archive.</p></div>
    <div className="play-form-grid">
      <label>Play title<input name="title" defaultValue={play.title} required/></label>
      <label>Publication status<select name="status" defaultValue={play.status==="UPCOMING"?"UPCOMING":"PUBLISHED"}><option value="PUBLISHED">Published</option><option value="UPCOMING">Upcoming</option></select></label>
      <label>Poster URL<input name="coverImage" defaultValue={play.coverImage||""}/></label>
      <label>Duration (minutes)<input type="number" min="1" name="duration" defaultValue={play.duration||""}/></label>
      <label>Opening date<input type="date" name="launchedOn" defaultValue={dateValue(play.launchedOn)}/></label>
      <label>Closing date<input type="date" name="endedOn" defaultValue={dateValue(play.endedOn)}/></label>
    </div>
    <section className="play-credit-section">
      <div className="play-credit-heading"><span>Credits</span><h3>People behind the production</h3></div>
      <label className="play-director-field">Director<input name="director" defaultValue={play.makers[0]?.profile.name||""} placeholder="Director's full name"/></label>
      {play.makers.slice(1).map((credit,index)=><input key={`director-${index}`} type="hidden" name="director" value={credit.profile.name}/>)}
      <div className="play-people-grid">
        <PeopleFields title="On-stage" hint="Actors and performers seen on stage." name="onStage" initialPeople={play.cast.map(credit=>credit.profile.name)}/>
        <PeopleFields title="Off-stage" hint="Backstage, technical and production artists." name="offStage" initialPeople={play.crew.map(credit=>credit.profile.name)}/>
      </div>
    </section>
    <label>Short description<textarea name="description" defaultValue={play.description}/></label>
    <label>Abstract<textarea name="abstract" defaultValue={play.abstract}/></label>
    <label>Directorial note<textarea name="directorialNote" defaultValue={play.directorialNote}/></label>
    <label className="play-feature-toggle"><input type="checkbox" name="isFeatured" defaultChecked={play.isFeatured}/><span><strong>Show on landing page</strong></span></label>
    <button className="play-submit" type="submit">Save changes</button><p role="status">{state}</p>
  </form></article>
}

function dateValue(value:unknown){if(!value)return "";const date=new Date(String(value));return Number.isNaN(date.valueOf())?String(value):date.toISOString().slice(0,10)}
