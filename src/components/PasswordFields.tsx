"use client";

import { useState } from "react";

function EyeIcon({hidden}:{hidden:boolean}){
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {hidden?<><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9 8 9 8a17.7 17.7 0 0 1-2 3.1M6.6 6.6C4.3 8.1 3 12 3 12s3.5 8 9 8a9.8 9.8 0 0 0 4.1-.9"/></>:<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>}
  </svg>;
}

function PasswordInput({name,label}:{name:string;label:string}){
  const [visible,setVisible]=useState(false);
  return <label>{label}<span className="password-input-wrap"><input type={visible?"text":"password"} name={name} minLength={8} autoComplete="new-password" required/><button type="button" onClick={()=>setVisible(value=>!value)} aria-label={`${visible?"Hide":"Show"} ${label.toLowerCase()}`} title={visible?"Hide password":"Show password"}><EyeIcon hidden={visible}/></button></span></label>;
}

export function PasswordFields(){
  return <><PasswordInput name="password" label="Password"/><PasswordInput name="confirmPassword" label="Confirm password"/></>;
}
