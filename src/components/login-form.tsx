"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { LockKeyholeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "@/app/(app)/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Unlocking..." : "Unlock Dashboard"}
    </Button>
  );
}

export function LoginForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="rounded-full bg-muted p-4">
            <LockKeyholeIcon className="size-6" />
          </div>
          <CardTitle>Shop Dashboard</CardTitle>
          <CardDescription>Enter the shop PIN (up to 6 digits) to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={formAction}
            className="space-y-4"
            onSubmit={() => {
              if (state.error) {
                inputRef.current?.select();
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                ref={inputRef}
                id="pin"
                name="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="current-password"
                autoFocus
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                  if (cleaned !== e.target.value) e.target.value = cleaned;
                }}
                className="text-center text-2xl tracking-[0.5em]"
                maxLength={6}
                placeholder="••••••"
                aria-describedby={state.error ? "pin-error" : undefined}
              />
              {state.error ? (
                <p id="pin-error" className="text-sm font-medium text-destructive">
                  {state.error}
                </p>
              ) : null}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}