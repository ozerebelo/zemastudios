"use client";

import { useActionState } from "react";
import { createDelivery, type ActionState } from "@/app/actions";
import { SubmitButton } from "./submit-button";

type ClientOption = { id: string; name: string };

function Label({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-ink-300">
      {children}
      {hint && <span className="ml-2 font-normal text-ink-500">{hint}</span>}
    </label>
  );
}

export function NewDeliveryForm({ clients }: { clients: ClientOption[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createDelivery,
    null,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div>
        <Label>Client</Label>
        <select className="field" name="clientId" required defaultValue="">
          <option value="" disabled>
            Select a client
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Title</Label>
        <input
          className="field"
          name="title"
          placeholder="Nike Spot - final grade project"
          required
        />
      </div>

      <div>
        <Label hint="shown to the recipient">Message</Label>
        <textarea
          className="field"
          name="message"
          rows={3}
          placeholder="Relink to the camera originals on the LTO, reel names unchanged."
        />
      </div>

      <fieldset className="rounded-lg border border-ink-800 p-4">
        <legend className="px-1 text-xs uppercase tracking-wide text-ink-400">
          Handoff notes (optional)
        </legend>

        <div className="mt-2">
          <Label hint="a project will not open in an older build">
            Saved in Resolve version
          </Label>
          <input className="field" name="resolveVersion" placeholder="19.1.3" />
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-ink-300">
          <input
            type="checkbox"
            name="studioRequired"
            className="accent-accent"
          />
          Requires Resolve Studio
        </label>
      </fieldset>

      <fieldset className="rounded-lg border border-ink-800 p-4">
        <legend className="px-1 text-xs uppercase tracking-wide text-ink-400">
          Link controls (optional)
        </legend>

        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Expires after</Label>
            <select className="field" name="expiresInDays" defaultValue="30">
              <option value="0">Never</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>

          <div>
            <Label hint="0 = unlimited">Max downloads</Label>
            <input
              className="field"
              name="maxDownloads"
              type="number"
              min={0}
              defaultValue={0}
            />
          </div>
        </div>

        <div className="mt-4">
          <Label hint="send this separately">Password</Label>
          <input
            className="field"
            name="password"
            type="text"
            placeholder="Leave blank for no password"
            autoComplete="off"
          />
        </div>
      </fieldset>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton pendingLabel="Creating...">
        Create and add files
      </SubmitButton>
    </form>
  );
}
