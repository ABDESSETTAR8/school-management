"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/** A small banner shown while the browser is offline. */
export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[200] flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-medium text-warning-foreground shadow-lg">
      <WifiOff className="size-4" />
      You&apos;re offline — showing cached data. Changes won&apos;t save until you reconnect.
    </div>
  );
}
