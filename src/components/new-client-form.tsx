"use client";

import { useActionState } from "react";
import { createClient, type ActionState } from "@/app/actions";
import { SubmitButton } from "./submit-button";

export function NewClientForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createClient,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input className="field" name="name" placeholder="Client name" required />
      <input
        className="field"
        name="contactEmail"
        type="email"
        placeholder="Contact email (optional)"
      />
      <textarea
        className="field"
        name="notes"
        rows={2}
        placeholder="Notes (optional)"
      />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-400">{state.ok}</p>}

      <SubmitButton pendingLabel="Adding...">Add client</SubmitButton>
    </form>
  );
}
