"use client";

import { useActionState } from "react";
import { unlockDelivery, type ActionState } from "@/app/actions";
import { SubmitButton } from "./submit-button";

export function UnlockForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    unlockDelivery,
    null,
  );

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <input type="hidden" name="token" value={token} />
      <input
        className="field"
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="off"
        autoFocus
        required
      />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton className="w-full" pendingLabel="Checking...">
        Unlock
      </SubmitButton>
    </form>
  );
}
