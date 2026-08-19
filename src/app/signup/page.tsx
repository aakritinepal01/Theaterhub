import Link from "next/link";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthVisual } from "@/components/AuthVisual";

async function signup(formData: FormData) {
  "use server";
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!firstName || !username || !email || !password) redirect("/signup/?error=missing");
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) redirect("/signup/?error=username");
  if (!/^\S+@\S+\.\S+$/.test(email)) redirect("/signup/?error=email");
  if (password.length < 8) redirect("/signup/?error=password");
  if (password !== confirmPassword) redirect("/signup/?error=confirm");

  const duplicate = await prisma.user.findFirst({ where: { OR: [{ username: { equals: username, mode: "insensitive" } }, { email: { equals: email, mode: "insensitive" } }] }, select: { username: true, email: true } });
  if (duplicate) redirect(`/signup/?error=${duplicate.username.toLowerCase() === username.toLowerCase() ? "duplicate_username" : "duplicate_email"}`);

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await prisma.$transaction(async tx => {
      const highest = await tx.user.aggregate({ _max: { id: true } });
      await tx.user.create({ data: { id: (highest._max.id ?? 0) + 1, username, email, firstName, lastName, passwordHash, dateJoined: new Date() } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch {
    redirect("/signup/?error=duplicate_username");
  }
  redirect("/login/?created=1");
}

const messages: Record<string, string> = {
  missing: "Complete all required fields.", username: "Use 3–30 letters, numbers, dots, dashes, or underscores.",
  email: "Enter a valid email address.", password: "Password must contain at least 8 characters.",
  confirm: "The passwords do not match.", duplicate_username: "That username is already in use.", duplicate_email: "That email is already registered.",
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentUser()) redirect("/");
  const { error } = await searchParams;
  return <main className="auth-page">
    <div className="auth-shell auth-shell-wide"><AuthVisual/><section className="auth-card auth-card-wide">
      <Link className="auth-back" href="/">← Back to home</Link>
      <p className="auth-kicker">Join the audience</p>
      <h1>Your next story starts here.</h1>
      <p className="auth-intro">Create an account for a more personal TheaterHub experience.</p>
      {error && <p className="auth-alert" role="alert">{messages[error] || "Unable to create your account."}</p>}
      <form action={signup} className="auth-form auth-form-grid">
        <label>First name<input name="firstName" autoComplete="given-name" required /></label>
        <label>Last name<input name="lastName" autoComplete="family-name" /></label>
        <label>Username<input name="username" autoComplete="username" minLength={3} maxLength={30} required /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
        <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></label>
        <button type="submit">Create account</button>
      </form>
      <p className="auth-switch">Already have an account? <Link href="/login/">Login</Link></p>
    </section></div>
  </main>;
}
