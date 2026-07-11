"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "check-email">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    if (password.length < 6) {
      setStatus("error");
      setError("Password must be at least 6 characters.");
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setStatus("error");
      setError(signUpError.message);
      return;
    }

    if (!data.session) {
      // Email confirmation required before login — no session yet.
      setStatus("check-email");
      return;
    }

    await fetch("/api/subscriptions/bootstrap", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (status === "check-email") {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center space-y-4 p-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Check your email</h1>
        <p className="text-sm text-neutral-500">
          We sent a confirmation link to {email}. Click it, then log in.
        </p>
        <Link href="/login" className="text-sm font-medium text-neutral-900 underline">
          Go to log in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Sign up</h1>
        <p className="text-sm text-neutral-500">Start your 30-day free trial.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div>
          <label className="text-xs font-medium text-neutral-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {status === "submitting" ? "Signing up…" : "Sign up"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-neutral-900 underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
