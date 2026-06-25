import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, SignUpForm } from "@/components/auth/auth-ui";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Create your account · Sahaayak AI" },
      {
        name: "description",
        content: "Join Sahaayak AI — free for every first-generation student.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <AuthShell
      title="Create your free account"
      subtitle="Join 120,000+ first-generation learners building their futures."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
