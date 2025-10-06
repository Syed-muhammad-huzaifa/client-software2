// app/login/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";

/** OUTER: Page wrapped with Suspense (fixes the warning) */
export default function LoginPage() {
  return (
    <main>
      <Suspense fallback={<div className="p-6 text-sm text-slate-600">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

/** INNER: Actual form that uses useSearchParams */
function LoginForm() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setErr("Wrong username or password");
        return;
      }
      router.replace(next);
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Center container */}
      <div className="mx-auto max-w-md px-4 py-10 md:py-16">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-lg">
            <Lock className="h-6 w-6" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Admin Sign In
            </h1>
            <p className="text-sm text-slate-600">Access your dashboard</p>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-orange-200 bg-white/90 p-6 shadow-xl backdrop-blur"
        >
          {/* Error */}
          {err ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          {/* Username */}
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Username
          </label>
          <div className="mb-4 relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Mail className="h-4 w-4" />
            </span>
            <input
              className="w-full rounded-xl border border-orange-200 bg-white px-9 py-2.5 text-slate-900 outline-none ring-orange-400/60 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setU(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center justify-between">
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Password
            </label>
            <span className="text-xs text-slate-500">Use admin credentials</span>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type={showPw ? "text" : "password"}
              className="w-full rounded-xl border border-orange-200 bg-white px-9 py-2.5 pr-10 text-slate-900 outline-none ring-orange-400/60 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setP(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-orange-100"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2.5 font-semibold text-white shadow-md transition hover:from-orange-500/90 hover:to-orange-400/90 active:scale-[0.99] disabled:opacity-70"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Footer note */}
          <p className="mt-4 text-center text-xs text-slate-500">
            You’ll be redirected to{" "}
            <span className="font-medium text-slate-700">{next}</span> after login.
          </p>
        </form>

        {/* Tiny help text */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Trouble signing in? Check your{" "}
          <code className="rounded bg-orange-100 px-1">.env.local</code> creds and restart dev server.
        </p>
      </div>
    </div>
  );
}
