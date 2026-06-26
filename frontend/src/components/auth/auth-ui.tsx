import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/app/brand";
import { AuthAPI } from "@/lib/api";
import { toast } from "sonner";
import { useInvalidateUser } from "@/hooks/useUser";

// ─── AuthShell ─────────────────────────────────────────────────────────────

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="hero-bg relative grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to="/" aria-label="Home">
            <BrandLogo />
          </Link>
        </div>
        <div className="glass-strong shadow-soft rounded-3xl p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <div className="mt-5 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      </div>
    </div>
  );
}

// ─── PasswordField ──────────────────────────────────────────────────────────

export function PasswordField({
  id,
  label = "Password",
  ...props
}: {
  id: string;
  label?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          className="h-11 rounded-xl pl-10 pr-10"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── IconInput ──────────────────────────────────────────────────────────────

export function IconInput({
  id,
  label,
  icon,
  ...props
}: {
  id: string;
  label: string;
  icon: ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <Input id={id} className="h-11 rounded-xl pl-10" {...props} />
      </div>
    </div>
  );
}

// ─── PrimaryButton ──────────────────────────────────────────────────────────

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...props}
      className="h-11 w-full rounded-xl text-primary-foreground shadow-glow"
      style={{ background: "var(--gradient-primary)" }}
    >
      {children}
    </Button>
  );
}

// ─── GoogleButton ───────────────────────────────────────────────────────────

export function GoogleButton() {
  return (
    <Button variant="outline" className="h-11 w-full rounded-xl">
      <svg viewBox="0 0 48 48" className="size-4">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1 7.4 2.7l5.7-5.7C33.7 6.9 29.1 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.3-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1 7.4 2.7l5.7-5.7C33.7 6.9 29.1 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 43c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.5 2.1-7.1 2.1-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.4 38.7 16.1 43 24 43z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6.1 5c2.6-2.4 4.6-6 5.6-9.9.4-1.4.4-2.7.4-4 0-1.2-.1-2.3-.4-3.5z"
        />
      </svg>
      Continue with Google
    </Button>
  );
}

// ─── SignInForm ─────────────────────────────────────────────────────────────

export function SignInForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const invalidateUser = useInvalidateUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await AuthAPI.login({ email, password });
      if (res.success && res.data) {
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);
        // Seed React Query cache with fresh user data
        invalidateUser();
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      // toast is shown by fetchAPI already
      console.error("[SignIn]", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <IconInput
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="you@college.edu"
        icon={<Mail className="size-4" />}
        required
      />
      <PasswordField
        id="password"
        name="password"
        placeholder="••••••••"
        required
      />
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input
            type="checkbox"
            className="size-3.5 rounded border-border bg-background"
          />
          Remember me
        </label>
        <a href="#" className="text-primary hover:underline">
          Forgot password?
        </a>
      </div>
      <PrimaryButton type="submit" disabled={loading}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Sign in <ArrowRight className="size-4" />
          </>
        )}
      </PrimaryButton>
      <div className="relative my-2 text-center">
        <span className="bg-card relative z-10 px-3 text-xs uppercase tracking-wider text-muted-foreground">
          or
        </span>
        <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
      </div>
      <GoogleButton />
    </form>
  );
}

// ─── SignUpForm ─────────────────────────────────────────────────────────────

export function SignUpForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const invalidateUser = useInvalidateUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const full_name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await AuthAPI.signup({ email, password, full_name });
      if (res.success && res.data) {
        // Auto-login: store tokens immediately after signup
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);
        // Seed React Query cache
        invalidateUser();
        toast.success("Account created! Let's get you set up 🎉");
        // Go straight to onboarding — no need to sign in again
        navigate({ to: "/onboarding" });
      }
    } catch (err: any) {
      console.error("[SignUp]", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <IconInput
        id="name"
        name="name"
        label="Full name"
        placeholder="Anjali Raj"
        icon={<UserIcon className="size-4" />}
        required
      />
      <IconInput
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="you@college.edu"
        icon={<Mail className="size-4" />}
        required
      />
      <PasswordField
        id="password"
        name="password"
        placeholder="At least 8 characters"
        required
        minLength={8}
      />
      <PrimaryButton type="submit" disabled={loading}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Create account <ArrowRight className="size-4" />
          </>
        )}
      </PrimaryButton>
      <div className="relative my-2 text-center">
        <span className="bg-card relative z-10 px-3 text-xs uppercase tracking-wider text-muted-foreground">
          or
        </span>
        <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
      </div>
      <GoogleButton />
      <p className="pt-1 text-center text-[11px] text-muted-foreground">
        By continuing you agree to our Terms and Privacy. Sahaayak is free for
        all students.
      </p>
    </form>
  );
}
