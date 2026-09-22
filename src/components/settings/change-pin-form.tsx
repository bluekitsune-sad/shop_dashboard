"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRoundIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePin } from "@/app/(app)/auth-actions";

function sanitizePin(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function ChangePinForm() {
  const router = useRouter();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await changePin(
        {},
        new FormData(e.currentTarget as HTMLFormElement),
      );
      if (!result.ok) {
        setError(result.error ?? "Could not change the PIN. Please try again.");
        return;
      }
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      toast.success("PIN changed successfully.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-pin">Current PIN</Label>
        <Input
          id="current-pin"
          name="currentPin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="current-password"
          maxLength={6}
          value={currentPin}
          onChange={(e) => setCurrentPin(sanitizePin(e.target.value))}
          className="tracking-[0.3em]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-pin">New PIN</Label>
        <Input
          id="new-pin"
          name="newPin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="new-password"
          maxLength={6}
          value={newPin}
          onChange={(e) => setNewPin(sanitizePin(e.target.value))}
          className="tracking-[0.3em]"
          placeholder="Up to 6 digits"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-pin">Confirm new PIN</Label>
        <Input
          id="confirm-pin"
          name="confirmPin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="new-password"
          maxLength={6}
          value={confirmPin}
          onChange={(e) => setConfirmPin(sanitizePin(e.target.value))}
          className="tracking-[0.3em]"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "change-pin-error" : undefined}
        />
        {error ? (
          <p id="change-pin-error" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <KeyRoundIcon className="size-4" />}
        Change PIN
      </Button>
      <button type="submit" hidden aria-hidden />
    </form>
  );
}