import { currentUser } from "@/lib/auth";
import { AuthVisual } from "@/components/AuthVisual";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await currentUser();

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <AuthVisual />
        <LoginForm error={error} />
      </div>
    </main>
  );
}
