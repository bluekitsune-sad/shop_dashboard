import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePinForm } from "@/components/settings/change-pin-form";
import { KeyRoundIcon } from "lucide-react";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your shop PIN. A PIN is a number with up to 6 digits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRoundIcon className="size-4 text-muted-foreground" />
            Change shop PIN
          </CardTitle>
          <CardDescription>
            Enter your current PIN, then choose a new 1–6 digit PIN. You{"'"}ll be asked for it next time
            you open the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePinForm />
        </CardContent>
      </Card>
    </div>
  );
}
