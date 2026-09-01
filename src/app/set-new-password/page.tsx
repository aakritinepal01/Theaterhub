import { redirect } from "next/navigation";
import { currentUser, requiresPasswordChange } from "@/lib/auth";

const messages: Record<string, string> = {
  length: "Password must contain at least 8 characters.",
  match: "The passwords do not match.",
  code: "The verification code is incorrect.",
  expired: "The verification code expired. Set your password again to receive a new code.",
  attempts: "Too many incorrect attempts. Set your password again to receive a new code.",
  email: "The verification email could not be sent. Please try again.",
};

export default async function SetPassword({ searchParams }: { searchParams: Promise<{ error?: string; step?: string; sent?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!requiresPasswordChange(user)) redirect(user.isStaff || user.isSuperuser ? "/admin" : "/theatre-dashboard");
  const { error, step, sent } = await searchParams;
  const verifying = step === "verify";
  return <main className="auth-page"><section className="auth-card auth-single"><p className="auth-kicker">First login</p><h1>{verifying?"Verify your email":"Set a new password"}</h1><p className="auth-intro">{verifying?`Enter the 6-digit code sent to ${user.email}.`:"Replace the temporary password before continuing."}</p>{sent&&<p className="auth-alert">A single-use code was sent to your email. It expires in 10 minutes.</p>}{error&&<p className="auth-alert">{messages[error]||"Something went wrong. Please try again."}</p>}{verifying?<form action="/api/auth/set-password" method="post" className="auth-form"><input type="hidden" name="action" value="verify"/><label>6-digit verification code<input type="text" name="code" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="one-time-code" required/></label><button>Verify &amp; open dashboard</button></form>:<form action="/api/auth/set-password" method="post" className="auth-form"><input type="hidden" name="action" value="request"/><label>New password<input type="password" name="password" minLength={8} autoComplete="new-password" required/></label><label>Confirm password<input type="password" name="confirmPassword" minLength={8} autoComplete="new-password" required/></label><button>Send verification code</button></form>}</section></main>;
}
