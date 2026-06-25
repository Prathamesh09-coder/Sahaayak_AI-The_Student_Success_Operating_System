import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, SignInForm } from "@/components/auth/auth-ui";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in · Sahaayak AI" },
      {
        name: "description",
        content: "Sign in to your Sahaayak AI student account.",
      },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your journey."
      footer={
        <>
          New here?{" "}
          <Link to="/sign-up" className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
