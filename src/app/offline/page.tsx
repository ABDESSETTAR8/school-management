import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <WifiOff className="size-7" />
      </span>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">You&apos;re offline</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This page isn&apos;t available without a connection. Pages you&apos;ve already visited
          will still load — reconnect to see the latest data.
        </p>
      </div>
    </div>
  );
}
