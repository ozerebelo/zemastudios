"use client";

import { useActionState } from "react";
import { sendDelivery, type ActionState } from "@/app/actions";
import { SubmitButton } from "./submit-button";

export function SendDeliveryForm({
  deliveryId,
  defaultEmail,
  alreadySent,
}: {
  deliveryId: string;
  defaultEmail: string;
  alreadySent: boolean;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    sendDelivery,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="deliveryId" value={deliveryId} />

      <div className="flex gap-2">
        <input
          className="field"
          name="notifyEmail"
          type="email"
          defaultValue={defaultEmail}
          placeholder="Recipient email (optional)"
        />
        <SubmitButton className="shrink-0" pendingLabel="Sending...">
          {alreadySent ? "Resend" : "Send"}
        </SubmitButton>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-400">{state.ok}</p>}
    </form>
  );
}
