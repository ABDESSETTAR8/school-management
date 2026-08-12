"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { updateSchoolSettings } from "../actions";
import type { ActionState } from "../schema";
import type { SchoolSettings } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/components/ui/toaster";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      Save
    </Button>
  );
}

export function SchoolSettingsForm({ settings }: { settings: SchoolSettings }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateSchoolSettings, null);
  useActionToast(state);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="schoolName">School name</Label>
        <Input id="schoolName" name="schoolName" defaultValue={settings.school_name} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={settings.email ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={settings.phone ?? ""} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={settings.address ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" name="logoUrl" placeholder="https://…" defaultValue={settings.logo_url ?? ""} />
      </div>

      <SaveButton />
    </form>
  );
}
