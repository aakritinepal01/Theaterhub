import { currentUser } from "@/lib/auth";
import { PasswordFields } from "@/components/PasswordFields";
import Link from "next/link";
import { redirect } from "next/navigation";

const errors:Record<string,string>={
  invalid:"Please complete every field with valid details. Password must be at least 8 characters.",
  mismatch:"Password and confirm password do not match.",
  duplicate:"An account with this email already exists.",
  claimed:"This theatre already has an owner account.",
  email_mismatch:"The email does not match this existing theatre record.",
  failed:"The account could not be created. Please try again.",
};

export default async function CreateUser({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const user=await currentUser();
  if(!user||(!user.isStaff&&!user.isSuperuser))redirect("/login");
  const query=await searchParams;
  return <main className="manage-page"><div className="manage-shell">
    <nav className="manage-nav"><Link href="/admin">Administration</Link><Link href="/admin/theatres">Manage theatres</Link></nav>
    <p className="auth-kicker">Account provisioning</p><h1>Create Theatre User</h1>
    {query.error&&<p className="manage-alert error">{errors[query.error]}</p>}
    {query.success&&<p className="manage-alert success">{query.success==="linked"?`Linked to existing theatre: ${query.theatre}`:`Created new theatre: ${query.theatre}`}</p>}
    {query.sent&&<p className="manage-alert success">Credentials sent to {query.sent}</p>}
    <form className="manage-form" action="/api/admin/users" method="post">
      <label>Theatre name<input name="theatreName" defaultValue={query.theatreName||""} required/></label>
      <label>Email<input type="email" name="email" required/></label>
      <PasswordFields/>
      <button>Create account and send credentials</button>
    </form>
  </div></main>;
}
