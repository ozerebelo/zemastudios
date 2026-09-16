"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export default function LoginPage() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    login,
    null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-lg font-semibold text-ink-50">
          Zema<span className="text-accent">.</span>Delivery
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Sign in to manage project deliveries.
        </p>

        <form action={formAction} className="mt-6 space-y-3">
          <input
            className="field"
            name="email"
            type="email"
            placeholder="you@zemastudios.com"
            autoComplete="username"
            defaultValue={state?.values?.email ?? ""}
            required
          />
          <input
            className="field"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
          />

          {state?.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <SubmitButton className="w-full" pendingLabel="Signing in...">
            Sign in
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
