import { redirect } from "next/navigation";
import { currentUser, requiresPasswordChange } from "@/lib/auth";

export default async function SetPassword({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!requiresPasswordChange(user)) redirect(user.isStaff || user.isSuperuser ? "/admin" : "/theatre-dashboard");
  const { error } = await searchParams;
  return <main className="auth-page"><section className="auth-card auth-single"><p className="auth-kicker">First login</p><h1>Set a new password</h1><p className="auth-intro">Replace the temporary password before continuing.</p>{error&&<p className="auth-alert">{error==="match"?"The passwords do not match.":"Password must contain at least 8 characters."}</p>}<form action="/api/auth/set-password" method="post" className="auth-form"><label>New password<input type="password" name="password" minLength={8} autoComplete="new-password" required/></label><label>Confirm password<input type="password" name="confirmPassword" minLength={8} autoComplete="new-password" required/></label><button>Save new password</button></form></section></main>;
}
