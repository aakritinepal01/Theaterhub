import { redirect } from "next/navigation";
import { currentUser, requiresPasswordChange } from "@/lib/auth";
import { AuthVisual } from "@/components/AuthVisual";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await currentUser();
  if (user) {
    redirect(
      requiresPasswordChange(user)
        ? "/set-new-password"
        : user.isStaff || user.isSuperuser
        ? "/admin"
        : "/theatre-dashboard"
    );
  }

  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <AuthVisual />
        <LoginForm error={error} />
      </div>
    </main>
  );
}
