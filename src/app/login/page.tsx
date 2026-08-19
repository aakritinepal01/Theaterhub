import Link from "next/link";
import { redirect } from "next/navigation";
import { createSession, currentUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthVisual } from "@/components/AuthVisual";

async function login(formData: FormData) {
  "use server";
  const identity = String(formData.get("identity") || "").trim();
  const password = String(formData.get("password") || "");
  if (!identity || !password) redirect("/login/?error=missing");

  const user = await prisma.user.findFirst({
    where: { OR: [{ username: { equals: identity, mode: "insensitive" } }, { email: { equals: identity, mode: "insensitive" } }] },
  });
  if (!user?.isActive || !(await verifyPassword(password, user.passwordHash))) redirect("/login/?error=invalid");

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  await createSession(user.id);
  redirect("/");
}

const messages: Record<string, string> = {
  missing: "Enter your username or email and password.",
  invalid: "The username/email or password is incorrect.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; created?: string }> }) {
  if (await currentUser()) redirect("/");
  const query = await searchParams;
  return <main className="auth-page">
    <div className="auth-shell"><AuthVisual/><section className="auth-card">
      <Link className="auth-back" href="/">← Back to home</Link>
      <p className="auth-kicker">Welcome back</p>
      <h1>Step back into the story.</h1>
      <p className="auth-intro">Sign in to continue exploring Nepal&apos;s theatre scene.</p>
      {query.created && <p className="auth-alert auth-success">Your account is ready. Sign in to continue.</p>}
      {query.error && <p className="auth-alert" role="alert">{messages[query.error] || "Unable to sign in."}</p>}
      <form action={login} className="auth-form">
        <label>Username or email<input name="identity" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <button type="submit">Login</button>
      </form>
      <p className="auth-switch">New to TheaterHub? <Link href="/signup/">Create an account</Link></p>
    </section></div>
  </main>;
}
