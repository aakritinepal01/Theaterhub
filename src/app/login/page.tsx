import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, requiresPasswordChange } from "@/lib/auth";
import { AuthVisual } from "@/components/AuthVisual";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await currentUser();
  if (user) redirect(requiresPasswordChange(user) ? "/set-new-password" : user.isStaff || user.isSuperuser ? "/admin" : "/theatre-dashboard");
  const { error } = await searchParams;
  return <main className="auth-page"><div className="auth-shell"><AuthVisual/><section className="auth-card"><Link className="auth-back" href="/">← Back to home</Link><p className="auth-kicker">TheatreHub access</p><h1>Welcome back.</h1><p className="auth-intro">Admin and theatre owner login.</p>{error&&<p className="auth-alert" role="alert">Invalid username or password</p>}<form action="/api/auth/login" method="post" className="auth-form"><label>Username<input name="username" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" required/></label><button>Login</button></form><p className="auth-switch">Accounts are created by the TheatreHub administrator after verification.</p></section></div></main>;
}
