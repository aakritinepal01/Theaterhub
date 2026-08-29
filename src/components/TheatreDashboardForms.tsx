"use client";

import type { ContentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Play = { id:number; title:string; description:string; abstract:string; directorialNote:string; coverImage:string|null; duration:number|null; launchedOn:Date|string|null; endedOn:Date|string|null; status:ContentStatus; isFeatured:boolean };

export function ProfileForm({ theatre }: { theatre: Record<string, unknown> }) {
  const router=useRouter(), [state,setState]=useState("");
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setState("Saving…");const response=await fetch("/api/theatre",{method:"PATCH",body:new FormData(event.currentTarget)});setState(response.ok?"Profile saved.":(await response.json().catch(()=>null))?.error||"Unable to save profile.");if(response.ok)router.refresh()}
  return <form className="manage-form profile-form" onSubmit={submit}>
    <label>Theatre name<input name="title" defaultValue={String(theatre.title||"")} required/></label>
    <label>Publication status<select name="status" defaultValue={String(theatre.status||"PUBLISHED")}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select></label>
    <label>About<textarea name="about" defaultValue={String(theatre.about||"")}/></label>
    <label>Profile picture URL<input name="profilePic" defaultValue={String(theatre.profilePic||"")}/></label>
    <label>Cover image URL<input name="coverImage" defaultValue={String(theatre.coverImage||"")}/></label>
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

export function PlayEditor({play}:{play:Play}){
  const router=useRouter(),[open,setOpen]=useState(false),[state,setState]=useState("");
  async function save(event:React.FormEvent<HTMLFormElement>){event.preventDefault();const response=await fetch(`/api/theatre/plays/${play.id}`,{method:"PATCH",body:new FormData(event.currentTarget)});setState(response.ok?"Saved.":(await response.json().catch(()=>null))?.error||"Unable to save.");if(response.ok)router.refresh()}
  async function remove(){if(!confirm(`Delete ${play.title}?`))return;const response=await fetch(`/api/theatre/plays/${play.id}`,{method:"DELETE"});if(response.ok)router.refresh();else setState((await response.json().catch(()=>null))?.error||"Unable to delete.")}
  return <article className="play-editor"><div className="play-editor-head"><div><h3>{play.title}</h3><p>{play.launchedOn?new Date(play.launchedOn).toLocaleDateString():"Launch date not set"} · {play.status}</p></div><div><button type="button" onClick={()=>setOpen(!open)}>{open?"Close":"Edit"}</button><button type="button" className="danger" onClick={remove}>Delete</button></div></div>{open&&<form className="manage-form" onSubmit={save}>
    <label>Title<input name="title" defaultValue={play.title} required/></label>
    <label>Status<select name="status" defaultValue={play.status}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select></label>
    <label>Poster URL<input name="coverImage" defaultValue={play.coverImage||""}/></label>
    <label>Launched on<input type="date" name="launchedOn" defaultValue={dateValue(play.launchedOn)}/></label>
    <label>Ended on<input type="date" name="endedOn" defaultValue={dateValue(play.endedOn)}/></label>
    <label>Duration (minutes)<input type="number" min="1" name="duration" defaultValue={play.duration||""}/></label>
    <label>Description<textarea name="description" defaultValue={play.description}/></label>
    <label>Abstract<textarea name="abstract" defaultValue={play.abstract}/></label>
    <label>Directorial note<textarea name="directorialNote" defaultValue={play.directorialNote}/></label>
    <label><input type="checkbox" name="isFeatured" defaultChecked={play.isFeatured}/> Featured play</label>
    <button>Save play</button><p role="status">{state}</p>
  </form>}</article>
}

function dateValue(value:unknown){if(!value)return "";const date=new Date(String(value));return Number.isNaN(date.valueOf())?String(value):date.toISOString().slice(0,10)}
