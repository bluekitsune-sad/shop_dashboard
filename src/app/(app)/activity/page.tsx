import { HistoryIcon } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground">Every stock change, in one place.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <HistoryIcon className="mb-4 size-10 text-muted-foreground" />
        <p className="font-medium">No inventory activity yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Add, sold, and adjusted movements will be recorded here automatically.
        </p>
      </div>
    </div>
  );
}